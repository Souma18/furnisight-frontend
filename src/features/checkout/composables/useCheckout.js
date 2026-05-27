import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAccountStore } from '@features/account/store/accountStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { useCheckoutStore } from '../store/checkoutStore'
import { formatCheckoutMoney } from '../utils/checkoutPricing'

export function useCheckout() {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()
  const accountStore = useAccountStore()
  const checkoutStore = useCheckoutStore()

  const checkoutState = storeToRefs(checkoutStore)
  const showSuccess = ref(false)
  const toast = ref({ show: false, icon: 'check', title: '', subtitle: '' })

  const lineIdsFromQuery = computed(() => {
    const raw = route.query.lines
    if (typeof raw !== 'string' || !raw.trim()) return []
    return raw.split(',').map((id) => id.trim()).filter(Boolean)
  })

  const checkoutLines = computed(() => {
    const available = cartStore.items.filter((item) => !item.outOfStock)
    if (!lineIdsFromQuery.value.length) return available
    return available.filter((item) => lineIdsFromQuery.value.includes(item.id))
  })

  const defaultAddress = computed(() => accountStore.defaultAddress)
  const summary = computed(() => checkoutStore.buildSummary(checkoutLines.value))

  const isEmpty = computed(() => checkoutLines.value.length === 0)

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
    await Promise.all([cartStore.ensureHydrated(), accountStore.hydrate(), checkoutStore.hydrateSession()])
  }

  function goBackToCart() {
    router.push({ path: '/account', query: { view: 'cart' } })
  }

  function goChangeAddress() {
    router.push({ path: '/account', query: { view: 'address' } })
  }

  async function updateLineQty(lineId, nextQty) {
    await cartStore.updateQty(lineId, nextQty)
  }

  async function placeOrder() {
    if (!checkoutState.agreedTerms.value) {
      showToast({
        icon: 'shield',
        title: 'Vui lòng đồng ý điều khoản',
        subtitle: 'Bạn cần tick đồng ý trước khi đặt hàng.',
      })
      return null
    }

    if (!defaultAddress.value) {
      showToast({
        icon: 'mapPin',
        title: 'Chưa có địa chỉ giao hàng',
        subtitle: 'Vui lòng thêm địa chỉ mặc định trong tài khoản.',
      })
      return null
    }

    if (!checkoutLines.value.length) {
      showToast({
        icon: 'cart',
        title: 'Giỏ hàng trống',
        subtitle: 'Không có sản phẩm để thanh toán.',
      })
      return null
    }

    const linesSnapshot = [...checkoutLines.value]

    const order = await checkoutStore.placeOrder({
      addressId: defaultAddress.value.id,
      lineIds: linesSnapshot.map((item) => item.id),
      shippingId: checkoutState.selectedShippingId.value,
      paymentId: checkoutState.selectedPaymentId.value,
      shopVoucherCode: checkoutState.shopVoucher.value?.code ?? null,
      shippingVoucherCode: checkoutState.shippingVoucher.value?.code ?? null,
      hasInsurance: checkoutState.hasInsurance.value,
      sellerNote: checkoutState.sellerNote.value,
      summary: summary.value,
      lines: linesSnapshot,
      address: defaultAddress.value,
    })

    if (!order) return null

    if (checkoutState.selectedPaymentId.value === 'vnpay') {
      const paymentRes = await checkoutStore.createVnpayPayment({
        orderId: order.orderId,
        orderCode: order.orderCode,
        amount: summary.value.total,
        returnUrl: `${window.location.origin}/checkout?vnpay=success`,
        cancelUrl: `${window.location.origin}/checkout?vnpay=cancel`,
      })

      if (!paymentRes.ok) {
        showToast({
          icon: 'alert',
          title: 'Thanh toán VNPAY thất bại',
          subtitle: paymentRes.message || `Mã phản hồi: ${paymentRes.status}`,
        })
        return null
      }

      // TODO(BE): Bật redirect thật khi API VNPAY sẵn sàng.
      // Khi backend trả 200 + paymentUrl hợp lệ, bỏ comment dòng dưới để điều hướng:
      // window.location.href = paymentRes.paymentUrl
    }

    accountStore.addOrderFromCheckout({
      order,
      lines: linesSnapshot,
      summary: summary.value,
      address: defaultAddress.value,
    })
    showSuccess.value = true
    for (const line of linesSnapshot) {
      await cartStore.removeItem(line.id)
    }

    return order
  }

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
  }
}
