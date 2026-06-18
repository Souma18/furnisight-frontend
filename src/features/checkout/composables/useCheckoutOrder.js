import { buildOrderPayload, buildShippingAddressDetail } from '../utils/checkoutOrderPayload'
import { ordersApi } from '@shared/lib/api/services'

export function useCheckoutOrder({
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
}) {
  function validateOrderInput() {
    if (!authStore.isCustomer) {
      return {
        icon: 'shield',
        title: 'Không có quyền đặt hàng',
        subtitle: 'Chỉ tài khoản khách hàng mới có thể đặt hàng và thanh toán.',
      }
    }

    if (!checkoutState.agreedTerms.value) {
      return {
        icon: 'shield',
        title: 'Vui lòng đồng ý điều khoản',
        subtitle: 'Bạn cần tick đồng ý trước khi đặt hàng.',
      }
    }

    if (!defaultAddress.value) {
      return {
        icon: 'mapPin',
        title: 'Chưa có địa chỉ giao hàng',
        subtitle: 'Vui lòng thêm địa chỉ mặc định trong tài khoản.',
      }
    }

    if (!checkoutLines.value.length) {
      return {
        icon: 'cart',
        title: 'Giỏ hàng trống',
        subtitle: 'Không có sản phẩm để thanh toán.',
      }
    }

    const address = defaultAddress.value
    const shippingAddressDetail = buildShippingAddressDetail(address)
    const shippingAddressName = address.fullName || address.name || ''

    if (!shippingAddressName || !address.phone || !shippingAddressDetail) {
      return {
        icon: 'mapPin',
        title: 'Địa chỉ giao hàng chưa đủ',
        subtitle: 'Vui lòng cập nhật họ tên, số điện thoại và địa chỉ chi tiết.',
      }
    }

    return null
  }

  async function createVnpayPayment(payload) {
    if (!authStore.isCustomer) {
      return {
        ok: false,
        status: 403,
        paymentUrl: '',
        transactionRef: '',
        message: 'Chỉ tài khoản khách hàng mới có thể thanh toán.',
      }
    }
    try {
      const response = await ordersApi.createVnpayPayment(payload)
      const ok = response?.status === 200
      const data = response?.data
      return {
        ok,
        status: response?.status ?? 500,
        paymentUrl: typeof data === 'string' ? data : data?.paymentUrl ?? '',
        transactionRef: data?.transactionRef ?? '',
        message: data?.message ?? '',
      }
    } catch (error) {
      return {
        ok: false,
        status: error?.response?.status ?? 500,
        paymentUrl: '',
        transactionRef: '',
        message: error?.response?.data?.message || error.message || 'Không thể khởi tạo VNPAY.',
      }
    }
  }

  async function redirectToVnpay(order, linesSnapshot) {
    const paymentRes = await createVnpayPayment({
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
      return false
    }

    checkoutStore.rememberPendingPayment({
      paymentMethod: checkoutState.selectedPaymentId.value,
      orderCode: order.orderCode,
      lineIds: linesSnapshot.map((line) => line.id),
    })

    window.location.href = paymentRes.paymentUrl
    return true
  }

  async function removeOrderedLines(linesSnapshot) {
    for (const line of linesSnapshot) {
      await cartStore.removeItem(line.id)
    }
  }

  async function placeOrder() {
    const validationError = validateOrderInput()
    if (validationError) {
      showToast(validationError)
      return null
    }

    const linesSnapshot = [...checkoutLines.value]
    const orderPayload = buildOrderPayload({
      address: defaultAddress.value,
      checkoutState,
      lines: linesSnapshot,
      summary: summary.value,
    })

    if (!authStore.isCustomer) {
      showToast({
        icon: 'alert',
        title: 'Không thể tạo đơn hàng',
        subtitle: 'Chỉ tài khoản khách hàng mới có thể đặt hàng.',
      })
      return null
    }

    checkoutStore.placing = true
    let order = null
    try {
      const response = await ordersApi.createOrder(orderPayload)
      order = response?.data ?? null
      checkoutStore.lastOrder = order
    } catch (error) {
      showToast({
        icon: 'alert',
        title: 'Không thể tạo đơn hàng',
        subtitle: error?.response?.data?.message || error.message || 'Vui lòng kiểm tra lại thông tin thanh toán.',
      })
      return null
    } finally {
      checkoutStore.placing = false
    }

    if (!order) return null

    if (checkoutState.selectedPaymentId.value === 'vnpay') {
      const redirected = await redirectToVnpay(order, linesSnapshot)
      return redirected ? order : null
    }

    orderStore.addOrderFromCheckout({
      order,
      lines: linesSnapshot,
      summary: summary.value,
      address: defaultAddress.value,
    })
    showSuccess.value = true
    await removeOrderedLines(linesSnapshot)

    return order
  }

  return {
    placeOrder,
  }
}
