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
import { formatCheckoutMoney } from '../utils/checkoutPricing'
import { clampPurchaseQuantity, isPurchasableLine } from '@features/cart/lib/stockGuards'

export function useCheckout() {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()
  const orderStore = useOrderStore()
  const checkoutStore = useCheckoutStore()
  const authStore = useAuthStore()

  const checkoutState = storeToRefs(checkoutStore)
  const { hydrateSession, refreshApplicableCombo, validateRequestedCombo, applyVoucherByCode } = useCheckoutSession(checkoutStore)
  const showSuccess = ref(false)
  const toast = ref({ show: false, icon: 'check', title: '', subtitle: '' })
  const selectedAddressId = ref('')

  const lineIdsFromQuery = computed(() => {
    const raw = route.query.lines
    if (typeof raw !== 'string' || !raw.trim()) return []
    return raw.split(',').map((id) => id.trim()).filter(Boolean)
  })
  const requestedComboId = computed(() => String(route.query.comboId || '').trim())

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

  let toastTimer = null

  function showToast(payload) {
    clearTimeout(toastTimer)
    toast.value = {
      show: true,
      icon: payload.icon ?? 'check',
      title: payload.title ?? '',
      subtitle: payload.subtitle ?? '',
    }
    toastTimer = setTimeout(() => {
      toast.value = { ...toast.value, show: false }
    }, 3000)
  }

  async function initCheckout() {
    if (!authStore.isCustomer) {
      await router.replace({ name: authStore.isAdmin ? 'admin-dashboard' : 'home' })
      return
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
    await refreshApplicableCombo(checkoutLines.value)
  }

  watch(
    checkoutLines,
    (lines) => {
      if (requestedComboId.value) {
        validateRequestedCombo(requestedComboId.value, lines)
      } else {
        refreshApplicableCombo(lines)
      }
    },
    { deep: true },
  )

  watch(addressList, syncSelectedAddress, { deep: true })

  return {
    ...checkoutState,
    checkoutLines,
    addressList,
    selectedAddress,
    selectedAddressId,
    summary,
    isEmpty,
    showSuccess,
    toast,
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
