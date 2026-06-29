import { computed, ref, watch } from 'vue'
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

export function useCheckout() {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()
  const orderStore = useOrderStore()
  const checkoutStore = useCheckoutStore()
  const authStore = useAuthStore()

  const checkoutState = storeToRefs(checkoutStore)
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
  })

  function showToast(payload) {
    const message = payload.subtitle ? `${payload.title} - ${payload.subtitle}` : payload.title
    const type = payload.icon === 'alert' ? 'error' : 'success'
    showToastGlobal(message, type)
  }

  async function initCheckout() {
    checkoutStore.loading = true
    try {
      if (!authStore.isCustomer) {
        await router.replace({ name: authStore.isAdmin ? 'admin-dashboard' : 'home' })
        return
      }
      checkoutStore.beginVoucherSession()
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
        title: addressId ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới',
        subtitle: 'Bạn có thể dùng địa chỉ này cho đơn hàng hiện tại.',
      })
    } catch (error) {
      showToast({
        icon: 'alert',
        title: 'Không lưu được địa chỉ',
        subtitle: error?.response?.data?.message || error.message || 'Vui lòng kiểm tra lại thông tin địa chỉ.',
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

  // Explicit UI-triggered API call
  watch(() => checkoutStore.selectedShippingId, refreshVoucherSelection)

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
