import { buildOrderPayload, buildShippingAddressDetail } from '../utils/checkoutOrderPayload'
import { ordersApi } from '@shared/lib/api/services'
import { isPurchasableLine, stockLimitLabel } from '@features/cart/lib/stockGuards'

export function useCheckoutOrder({
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
}) {
  function validateOrderInput() {
    if (!authStore.isCustomer) {
      return {
        icon: 'shield',
        title: t('checkout.toast.noAuth.title'),
        subtitle: t('checkout.toast.noAuth.sub'),
      }
    }

    if (!checkoutState.agreedTerms.value) {
      return {
        icon: 'shield',
        title: t('checkout.toast.noTerms.title'),
        subtitle: t('checkout.toast.noTerms.sub'),
      }
    }

    if (!selectedAddress.value) {
      return {
        icon: 'mapPin',
        title: t('checkout.toast.noAddress.title'),
        subtitle: t('checkout.toast.noAddress.sub'),
      }
    }

    if (!checkoutLines.value.length) {
      return {
        icon: 'cart',
        title: t('checkout.toast.emptyCart.title'),
        subtitle: t('checkout.toast.emptyCart.sub'),
      }
    }

    const invalidLine = checkoutLines.value.find((line) => !isPurchasableLine(line))
    if (invalidLine) {
      return {
        icon: 'alert',
        title: t('checkout.toast.overStock.title'),
        subtitle: t('checkout.toast.overStock.sub', { 
          name: invalidLine.name || 'Sản phẩm', 
          limit: stockLimitLabel(invalidLine).toLowerCase() 
        }),
      }
    }

    const address = selectedAddress.value
    const shippingAddressDetail = buildShippingAddressDetail(address)
    const shippingAddressName = address.fullName || address.name || ''

    if (!shippingAddressName || !address.phone || !shippingAddressDetail) {
      return {
        icon: 'mapPin',
        title: t('checkout.toast.incompleteAddress.title'),
        subtitle: t('checkout.toast.incompleteAddress.sub'),
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
        title: t('checkout.toast.vnpayFailed.title'),
        subtitle: paymentRes.message || t('checkout.toast.vnpayFailed.sub', { status: paymentRes.status }),
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
      address: selectedAddress.value,
      checkoutState,
      lines: linesSnapshot,
      summary: summary.value,
    })

    if (!authStore.isCustomer) {
      showToast({
        icon: 'alert',
        title: t('checkout.toast.noAuth.title'),
        subtitle: t('checkout.toast.noAuth.createSub'),
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
        title: t('checkout.toast.createFailed.title'),
        subtitle: error?.response?.data?.message || error.message || t('checkout.toast.createFailed.sub'),
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
      address: selectedAddress.value,
    })
    showSuccess.value = true
    await removeOrderedLines(linesSnapshot)

    return order
  }

  return {
    placeOrder,
  }
}
