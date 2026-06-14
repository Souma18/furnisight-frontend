import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAddressStore } from '@features/account/store/addressStore'
import { useOrderStore } from '@features/account/store/orderStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { useCheckoutStore } from '../store/checkoutStore'
import { formatCheckoutMoney } from '../utils/checkoutPricing'

export function useCheckout() {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()
  const orderStore = useOrderStore()
  const checkoutStore = useCheckoutStore()

  const checkoutState = storeToRefs(checkoutStore)
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
    await Promise.all([
      cartStore.ensureHydrated(),
      addressStore.fetchAddresses(),
      checkoutStore.hydrateSession({ loadCombos: !requestedComboId.value }),
    ])
    if (requestedComboId.value) {
      await checkoutStore.validateRequestedCombo(requestedComboId.value, checkoutLines.value)
    } else {
      await checkoutStore.refreshApplicableCombo(checkoutLines.value)
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
    await checkoutStore.refreshApplicableCombo(checkoutLines.value)
  }

  function buildShippingAddressDetail(address = {}) {
    return [
      address.detail || address.street,
      address.wardName || address.ward,
      address.districtName || address.district,
      address.provinceName || address.city,
    ].filter(Boolean).join(', ')
  }

  function resolveLineImageUrl(item = {}) {
    const imageCandidates = [
      item.imageUrl,
      item.productImageUrl,
      item.image,
      item.thumbnail,
      item.thumbnailUrl,
      item.coverImage,
      item.coverImageUrl,
      item.productSnapshot?.imageUrl,
      item.product?.imageUrl,
      item.product?.image,
    ]

    if (Array.isArray(item.gallery)) {
      imageCandidates.push(...item.gallery)
    }

    if (Array.isArray(item.images)) {
      imageCandidates.push(...item.images.map((image) => {
        if (typeof image === 'string') return image
        return image?.url || image?.imageUrl || image?.src || ''
      }))
    }

    return imageCandidates.find(Boolean) || ''
  }

  function buildOrderItemPayload(item = {}) {
    return {
      productId: item.productId,
      variantId: item.variantId || null,
      categoryName: item.categoryName || item.categoryLabel || '',
      productName: item.productName || item.name,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Number(item.qty ?? item.quantity) || 1),
      imageUrl: resolveLineImageUrl(item),
    }
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
    const address = defaultAddress.value
    const shippingAddressDetail = buildShippingAddressDetail(address)
    const shippingAddressName = address.fullName || address.name || ''

    if (!shippingAddressName || !address.phone || !shippingAddressDetail) {
      showToast({
        icon: 'mapPin',
        title: 'Địa chỉ giao hàng chưa đủ',
        subtitle: 'Vui lòng cập nhật họ tên, số điện thoại và địa chỉ chi tiết.',
      })
      return null
    }

    const orderPayload = {
      shippingAddressName,
      shippingAddressPhone: address.phone,
      shippingAddressDetail,
      shippingMethod: checkoutState.selectedShipping.value?.name || checkoutState.selectedShippingId.value,
      customerNote: checkoutState.sellerNote.value,
      paymentMethod: checkoutState.selectedPaymentId.value,
      shopVoucherCode: checkoutState.shopVoucher.value?.code || null,
      shippingVoucherCode: checkoutState.shippingVoucher.value?.code || null,
      comboId: checkoutState.selectedCombo.value?.id || null,
      discountAmount: summary.value.shopDiscount,
      shippingDiscount: summary.value.shippingDiscount,
      comboDiscount: summary.value.comboDiscount,
      shippingFee: summary.value.shipFee,
      insuranceFee: summary.value.insuranceAmount,
      items: linesSnapshot.map(buildOrderItemPayload),
    }

    let order = null
    try {
      order = await checkoutStore.placeOrder(orderPayload)
    } catch (error) {
      showToast({
        icon: 'alert',
        title: 'Không thể tạo đơn hàng',
        subtitle: error?.response?.data?.message || error.message || 'Vui lòng kiểm tra lại thông tin thanh toán.',
      })
      return null
    }

    if (!order) return null

    if (checkoutState.selectedPaymentId.value === 'vnpay') {
      const paymentRes = await checkoutStore.createVnpayPayment({
        orderId: order.orderId,
        orderCode: order.orderCode,
        amount: summary.value.total,
        returnUrl: `${window.location.origin}/orders/payment/callback`,
        cancelUrl: `${window.location.origin}/orders/payment/callback`,
      })

      if (!paymentRes.ok) {
        showToast({
          icon: 'alert',
          title: 'Thanh toán VNPAY thất bại',
          subtitle: paymentRes.message || `Mã phản hồi: ${paymentRes.status}`,
        })
        return null
      }

      checkoutStore.rememberPendingPayment({
        paymentMethod: checkoutState.selectedPaymentId.value,
        orderId: order.orderId,
        orderCode: order.orderCode,
        lineIds: linesSnapshot.map((line) => line.id),
      })

      window.location.href = paymentRes.paymentUrl
      return order
    }

    orderStore.addOrderFromCheckout({
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

  watch(
    checkoutLines,
    (lines) => {
      if (requestedComboId.value) {
        checkoutStore.validateRequestedCombo(requestedComboId.value, lines)
      } else {
        checkoutStore.refreshApplicableCombo(lines)
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
  }
}
