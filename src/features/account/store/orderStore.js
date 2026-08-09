import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pinia } from '@app/plugins/pinia'
import { useCheckoutStore } from '@features/checkout/store/checkoutStore'
import { ordersApi } from '@shared/lib/api/services'
import { i18n, normalizeLocale } from '@shared/i18n'
import { OrderListResponse, OrderDetailResponse, canRetryOrderPayment } from '@shared/lib/api/services/orders/orders.model'

function getCurrentLocale() {
  return normalizeLocale(i18n.global.locale.value)
}

export const useOrderStore = defineStore('accountOrder', () => {
  const orders = ref([])
  const orderDetails = ref({})
  const loading = ref(false)
  const cacheLocale = ref('')

  function invalidateLocaleCacheIfNeeded() {
    const currentLocale = getCurrentLocale()
    if (cacheLocale.value === currentLocale) return currentLocale

    orders.value = []
    orderDetails.value = {}
    cacheLocale.value = currentLocale
    return currentLocale
  }

  function findOrder(orderRef) {
    if (cacheLocale.value !== getCurrentLocale()) return null
    if (!orderRef) return null
    if (typeof orderRef === 'object') return orderRef

    return orders.value.find((order) => order.id === orderRef || order.orderCode === orderRef)
      || orderDetails.value[orderRef]
      || null
  }

  async function fetchOrders() {
    try {
      const currentLocale = invalidateLocaleCacheIfNeeded()
      loading.value = true
      const { data } = await ordersApi.getOrders()
      const rawItems = Array.isArray(data) ? data : data?.items ?? []
      orders.value = Array.isArray(rawItems) ? rawItems.map(item => new OrderListResponse(item)) : []
      cacheLocale.value = currentLocale
      return orders.value
    } catch (error) {
      // Error handled by empty state
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetail(orderCode) {
    if (!orderCode) return null
    const currentLocale = invalidateLocaleCacheIfNeeded()
    if (orderDetails.value[orderCode]) return orderDetails.value[orderCode]

    try {
      loading.value = true
      const { data } = await ordersApi.getOrderDetail(orderCode)
      const detail = new OrderDetailResponse(data)
      orderDetails.value[orderCode] = detail
      if (detail.id) orderDetails.value[detail.id] = detail
      cacheLocale.value = currentLocale
      return detail
    } catch (error) {
      return null
    } finally {
      loading.value = false
    }
  }

  function getOrderDetail(orderRef) {
    if (cacheLocale.value !== getCurrentLocale()) return null
    return orderDetails.value[orderRef] ?? findOrder(orderRef)
  }

  function addOrderFromCheckout(payload) {
    if (payload.order) {
      const parsedOrder = new OrderDetailResponse(payload.order)
      cacheLocale.value = getCurrentLocale()
      orders.value = [parsedOrder, ...orders.value]
      orderDetails.value = { ...orderDetails.value, [parsedOrder.orderCode || parsedOrder.id]: parsedOrder }
      return parsedOrder
    }
    return payload.order
  }

  async function cancelOrder(orderRef) {
    const detail = findOrder(orderRef)
    if (!detail) throw new Error('NOT_FOUND')
    
    const orderCode = detail.orderCode || orderRef
    const { data } = await ordersApi.cancelOrder(orderCode)
    delete orderDetails.value[orderCode]
    if (detail.id) delete orderDetails.value[detail.id]
    const updatedDetail = data && typeof data === 'object'
      ? new OrderDetailResponse(data)
      : await fetchOrderDetail(orderCode)

    if (updatedDetail) {
      orders.value = orders.value.map((order) =>
        order.id === detail.id || order.orderCode === orderCode
          ? new OrderListResponse({ ...order, ...updatedDetail })
          : order,
      )
      orderDetails.value = {
        ...orderDetails.value,
        [orderCode]: updatedDetail,
        ...(updatedDetail.id ? { [updatedDetail.id]: updatedDetail } : {}),
      }
    } else {
      await fetchOrders()
    }

    return updatedDetail
  }

  async function confirmOrderReceived(orderRef) {
    const detail = findOrder(orderRef)
    if (!detail) throw new Error('NOT_FOUND')
    
    const orderCode = detail.orderCode || orderRef
    const { data } = await ordersApi.confirmOrderReceived(orderCode)
    delete orderDetails.value[orderCode]
    if (detail.id) delete orderDetails.value[detail.id]
    const updatedDetail = data && typeof data === 'object'
      ? new OrderDetailResponse(data)
      : await fetchOrderDetail(orderCode)
    
    if (updatedDetail) {
      orders.value = orders.value.map((order) =>
        order.id === detail.id || order.orderCode === orderCode
          ? new OrderListResponse({ ...order, ...updatedDetail })
          : order,
      )
      orderDetails.value = {
        ...orderDetails.value,
        [orderCode]: updatedDetail,
        ...(updatedDetail.id ? { [updatedDetail.id]: updatedDetail } : {}),
      }
    } else {
      await fetchOrders()
    }

    return true
  }

  async function retryPayment(orderRef) {
    const order = findOrder(orderRef)
    if (!order?.orderCode) throw new Error('NO_CODE')
    if (!canRetryOrderPayment(order)) throw new Error('EXPIRED_OR_UNAVAILABLE')

    const paymentMethod = String(order.paymentMethod || order.paymentDetail?.paymentMethod || 'vnpay').toLowerCase()
    if (paymentMethod !== 'vnpay') throw new Error('UNSUPPORTED_METHOD')

    const checkoutStore = useCheckoutStore(pinia)
    const response = await ordersApi.createVnpayPayment({
      orderCode: order.orderCode,
      returnUrl: `${window.location.origin}/orders/payment/callback`,
      cancelUrl: `${window.location.origin}/orders/payment/callback`,
    })
    const paymentUrl = typeof response?.data === 'string' ? response.data : response?.data?.paymentUrl

    if (!paymentUrl) throw new Error('PAYMENT_URL_MISSING')

    checkoutStore.rememberPendingPayment({
      paymentMethod,
      orderCode: order.orderCode,
      lineIds: [],
    })

    window.location.href = paymentUrl
    return true
  }

  function resetOrderState() {
    orders.value = []
    orderDetails.value = {}
    loading.value = false
    cacheLocale.value = ''
  }

  return {
    orders,
    orderDetails,
    fetchOrders,
    fetchOrderDetail,
    addOrderFromCheckout,
    getOrderDetail,
    cancelOrder,
    confirmOrderReceived,
    retryPayment,
    resetOrderState,
  }
})
