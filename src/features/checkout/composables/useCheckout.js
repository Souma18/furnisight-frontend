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

  const lineIdsFromQuery = computed(() => {
    const raw = route.query.lines
    if (typeof raw !== 'string' || !raw.trim()) return []
    return raw.split(',').map((id) => id.trim()).filter(Boolean)
  })
  const requestedComboId = computed(() => String(route.query.comboId || '').trim())

  const checkoutLines = computed(() => {
    const available = cartStore.items.filter((item) => !item.outOfStock)
    if (!lineIdsFromQuery.value.length) return available
    return available.filter((item) => lineIdsFromQuery.value.includes(item.id))
  })

  const defaultAddress = computed(() => addressStore.defaultAddress)
  const summary = computed(() => checkoutStore.buildSummary(checkoutLines.value))

  const isEmpty = computed(() => checkoutLines.value.length === 0)
  const { placeOrder } = useCheckoutOrder({
    authStore,
    cartStore,
    checkoutLines,
    checkoutState,
    checkoutStore,
    defaultAddress,
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
    if (requestedComboId.value) {
      await validateRequestedCombo(requestedComboId.value, checkoutLines.value)
    } else {
      await refreshApplicableCombo(checkoutLines.value)
    }
  }

  function goBackToCart() {
    router.push({ path: '/account', query: { view: 'cart' } })
  }

  function goChangeAddress() {
    router.push({ path: '/account', query: { view: 'address' } })
  }

  async function updateLineQty(lineId, nextQty) {
    await cartStore.updateQty(lineId, nextQty)
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

  return {
    ...checkoutState,
    checkoutLines,
    defaultAddress,
    summary,
    isEmpty,
    showSuccess,
    toast,
    formatMoney: formatCheckoutMoney,
    initCheckout,
    goBackToCart,
    goChangeAddress,
    updateLineQty,
    placeOrder,
    showToast,
    applyVoucherByCode,
  }
}
