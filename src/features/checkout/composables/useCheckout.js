import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAddressStore } from '@features/account/store/addressStore'
import { useOrderStore } from '@features/account/store/orderStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useCheckoutStore } from '../store/checkoutStore'
import { useCheckoutOrder } from './useCheckoutOrder'
import { useCheckoutSession } from './useCheckoutSession'
import { calcLineTotal, formatCheckoutMoney } from '../utils/checkoutPricing'
import { clampPurchaseQuantity, isPurchasableLine } from '@features/cart/lib/stockGuards'
import { consumeVoucherIntent } from '../lib/checkoutVoucherIntentStorage'
import { useToast } from '@shared/composables/useToast'
import { useLocaleStore } from '@shared/stores/localeStore'
import { useI18n } from 'vue-i18n'

export function useCheckout() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()
  const orderStore = useOrderStore()
  const checkoutStore = useCheckoutStore()
  const authStore = useAuthStore()
  const localeStore = useLocaleStore()

  const checkoutState = storeToRefs(checkoutStore)
  const { locale } = storeToRefs(localeStore)
  const { hydrateSession, refreshApplicableCombo, validateRequestedCombo, applyVoucherByCode, revalidateVouchers } = useCheckoutSession(checkoutStore)
  const showSuccess = ref(false)
  const { show: showToastGlobal } = useToast()
  const selectedAddressId = ref('')

  const lineIdsFromQuery = computed(() => {
    const raw = route.query.lines
    if (typeof raw !== 'string' || !raw.trim()) return []
    return raw.split(',').map((id) => id.trim()).filter(Boolean)
  })
  const requestedComboId = computed(() => String(route.query.comboId || '').trim())
  const requestedVoucherCode = computed(() => String(route.query.voucherCode || '').trim())

  const checkoutLines = computed(() => {
    const available = cartStore.items.filter(isPurchasableLine)
    if (!lineIdsFromQuery.value.length) return available
    return available.filter((item) => lineIdsFromQuery.value.includes(item.id))
  })

  const addressList = computed(() => addressStore.addresses)
  const selectedAddress = computed(() => {
    if (!addressList.value.length) return null
    return addressList.value.find((item) => String(item.id) === String(selectedAddressId.value))
      ?? addressStore.defaultAddress
  })
  const summary = computed(() => checkoutStore.buildSummary(checkoutLines.value))
  const voucherSubtotal = computed(() => checkoutLines.value.reduce((sum, line) => sum + calcLineTotal(line), 0))

  const isEmpty = computed(() => checkoutLines.value.length === 0)
  const { placeOrder } = useCheckoutOrder({
    authStore,
    cartStore,
    checkoutLines,
    checkoutState,
    checkoutStore,
    selectedAddress,
    orderStore,
    showSuccess,
    showToast,
    summary,
    t,
  })

  function showToast(payload) {
    const message = payload.subtitle ? `${payload.title} - ${payload.subtitle}` : payload.title
    const type = payload.icon === 'alert' ? 'error' : 'success'
    showToastGlobal(message, type)
  }

  async function initCheckout(isLanguageChange = false) {
    checkoutStore.loading = true
    try {
      if (!authStore.isCustomer) {
        await router.replace({ name: authStore.isAdmin ? 'admin-dashboard' : 'home' })
        return
      }
      if (!isLanguageChange) {
        checkoutStore.beginVoucherSession()
      }
      await Promise.all([
        cartStore.ensureHydrated(),
        addressStore.fetchAddresses(),
        hydrateSession({ loadCombos: !requestedComboId.value }),
      ])
      syncSelectedAddress()
      if (requestedComboId.value) {
        await validateRequestedCombo(requestedComboId.value, checkoutLines.value)
      } else {
        await refreshApplicableCombo(checkoutLines.value)
      }
      const intentCode = consumeVoucherIntent()
      const preferredCode = requestedVoucherCode.value || intentCode
      try {
        await revalidateVouchers({
          subtotal: voucherSubtotal.value,
          shippingFee: checkoutStore.shipFee,
          preferredVoucherCode: preferredCode,
          forceRecommend: !checkoutStore.shopVoucher && !checkoutStore.shippingVoucher,
        })
      } catch {
        checkoutStore.shopVoucher = null
        checkoutStore.shippingVoucher = null
      } finally {
        if (requestedVoucherCode.value) {
          const query = { ...route.query }
          delete query.voucherCode
          await router.replace({ query })
        }
      }
      voucherSessionReady = true
    } finally {
      checkoutStore.loading = false
    }
  }

  function goBackToCart() {
    router.push({ path: '/account', query: { view: 'cart' } })
  }

  function syncSelectedAddress() {
    if (!addressList.value.length) {
      selectedAddressId.value = ''
      return
    }
    if (!selectedAddressId.value || !addressList.value.some((item) => String(item.id) === String(selectedAddressId.value))) {
      selectedAddressId.value = addressStore.defaultAddress?.id ?? addressList.value[0]?.id ?? ''
    }
  }

  function selectAddress(addressId) {
    selectedAddressId.value = addressId
  }

  async function saveCheckoutAddress(payload) {
    try {
      const addressId = payload?.id
      const nextAddresses = addressId
        ? await addressStore.updateAddress(addressId, payload)
        : await addressStore.addAddress(payload)
      const nextSelected = addressId
        ? addressId
        : (nextAddresses.find((item) => item.isDefault)?.id ?? nextAddresses[0]?.id)
      selectedAddressId.value = nextSelected ?? ''
      syncSelectedAddress()
      showToast({
        icon: 'mapPin',
        title: addressId ? t('checkout.toast.addressUpdate.titleEdit') : t('checkout.toast.addressUpdate.titleAdd'),
        subtitle: t('checkout.toast.addressUpdate.sub'),
      })
    } catch (error) {
      showToast({
        icon: 'alert',
        title: t('checkout.toast.addressFailed.title'),
        subtitle: error?.response?.data?.message || error.message || t('checkout.toast.addressFailed.sub'),
      })
    }
  }

  async function updateLineQty(lineId, nextQty) {
    const line = cartStore.items.find((item) => item.id === lineId)
    await cartStore.updateQty(lineId, clampPurchaseQuantity(nextQty, line))
    if (requestedComboId.value) {
      await validateRequestedCombo(requestedComboId.value, checkoutLines.value)
    } else {
      await refreshApplicableCombo(checkoutLines.value)
    }
    await refreshVoucherSelection()
  }

  let voucherSessionReady = false
  let voucherRequestId = 0
  async function refreshVoucherSelection() {
    if (!voucherSessionReady) return
    const requestId = ++voucherRequestId
    const result = await revalidateVouchers({
      subtotal: voucherSubtotal.value,
      shippingFee: checkoutStore.shipFee,
    }).catch(() => null)
    return requestId === voucherRequestId ? result : null
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('furnisight_payment_channel')
      channel.onmessage = (event) => {
        if (event.data?.type === 'VNPAY_PAYMENT_RESULT') {
          if (event.data.success) {
            showSuccess.value = true
            cartStore.hydrate({ force: true }).catch(() => null)
          } else {
            showToast({
              icon: 'alert',
              title: t('checkout.toast.vnpayFailed.title'),
              subtitle: t('checkout.toast.vnpayFailed.sub', { status: 400 }),
            })
          }
        }
      }
      onBeforeUnmount(() => {
        channel.close()
      })
    }
  })

  // Explicit UI-triggered API call
  watch(() => checkoutStore.selectedShippingId, refreshVoucherSelection)
  watch(locale, () => {
    initCheckout(true).catch(() => null)
  })

  return {
    ...checkoutState,
    checkoutLines,
    addressList,
    selectedAddress,
    selectedAddressId,
    summary,
    isEmpty,
    showSuccess,
    formatMoney: formatCheckoutMoney,
    initCheckout,
    goBackToCart,
    selectAddress,
    saveCheckoutAddress,
    updateLineQty,
    placeOrder,
    showToast,
    applyVoucherByCode,
  }
}
