import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pinia } from '@app/plugins/pinia'
import { useCheckoutStore } from '@features/checkout/store/checkoutStore'
import { ordersApi } from '@shared/lib/api/services'
import { OrderListResponse, OrderDetailResponse, canRetryOrderPayment } from '@shared/lib/api/services/orders/orders.model'
import { i18n } from '@shared/i18n'

const t = (key, params) => i18n.global.t(key, params)

export const useOrderStore = defineStore('accountOrder', () => {
  const orders = ref([])
  const orderDetails = ref({})
  const loading = ref(false)

  function findOrder(orderRef) {
    if (!orderRef) return null
    if (typeof orderRef === 'object') return orderRef

    return orders.value.find((order) => order.id === orderRef || order.orderCode === orderRef)
      || orderDetails.value[orderRef]
      || null
  }

  async function fetchOrders() {
    try {
      loading.value = true
      const { data } = await ordersApi.getOrders()
      const rawItems = Array.isArray(data) ? data : data?.items ?? []
      orders.value = Array.isArray(rawItems) ? rawItems.map(item => new OrderListResponse(item)) : []
      return orders.value
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetail(orderCode) {
    if (!orderCode) return null
    if (orderDetails.value[orderCode]) return orderDetails.value[orderCode]

    try {
      loading.value = true
      const { data } = await ordersApi.getOrderDetail(orderCode)
      const detail = new OrderDetailResponse(data)
      orderDetails.value[orderCode] = detail
      if (detail.id) orderDetails.value[detail.id] = detail
      return detail
    } catch (error) {
      console.error(`Failed to fetch order detail ${orderCode}:`, error)
      return null
    } finally {
      loading.value = false
    }
  }

  function getOrderDetail(orderRef) {
    return orderDetails.value[orderRef] ?? findOrder(orderRef)
  }

  function addOrderFromCheckout(payload) {
    if (payload.order) {
      const parsedOrder = new OrderDetailResponse(payload.order)
      orders.value = [parsedOrder, ...orders.value]
      orderDetails.value = { ...orderDetails.value, [parsedOrder.orderCode || parsedOrder.id]: parsedOrder }
      return parsedOrder
    }
    return payload.order
  }

  async function cancelOrder(orderRef) {
    const detail = findOrder(orderRef)
    if (!detail) return { ok: false, message: t('account.orders.notFound') }
    
    try {
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

      return { ok: true, status: updatedDetail?.status }
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || t('account.orders.cancelNowError') }
    }
  }

  async function confirmOrderReceived(orderRef) {
    const detail = findOrder(orderRef)
    if (!detail) return { ok: false, message: t('account.orders.notFound') }
    
    try {
      const orderCode = detail.orderCode || orderRef
      await ordersApi.confirmOrderReceived(orderCode)
      const updatedDetail = await fetchOrderDetail(orderCode)
      
      if (updatedDetail) {
        orders.value = orders.value.map((order) =>
          order.id === detail.id || order.orderCode === orderCode
            ? new OrderListResponse({ ...order, ...updatedDetail })
            : order,
        )
      } else {
        await fetchOrders()
      }

      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || t('account.orders.confirmError') }
    }
  }

  async function retryPayment(orderRef) {
    const order = findOrder(orderRef)
    if (!order?.orderCode) {
      return { ok: false, message: t('account.orders.retryNoCode') }
    }

    if (!canRetryOrderPayment(order)) {
      return { ok: false, message: t('account.orders.retryExpiredOrUnavailable') }
    }

    const paymentMethod = String(order.paymentMethod || order.paymentDetail?.paymentMethod || 'vnpay').toLowerCase()
    if (paymentMethod !== 'vnpay') {
      return { ok: false, message: t('account.orders.retryMethodUnsupported') }
    }

    try {
      const checkoutStore = useCheckoutStore(pinia)
      const response = await ordersApi.createVnpayPayment({
        orderCode: order.orderCode,
        returnUrl: `${window.location.origin}/orders/payment/callback`,
        cancelUrl: `${window.location.origin}/orders/payment/callback`,
      })
      const paymentUrl = typeof response?.data === 'string' ? response.data : response?.data?.paymentUrl

      if (!paymentUrl) {
        return { ok: false, message: t('account.orders.paymentUrlMissing') }
      }

      checkoutStore.rememberPendingPayment({
        paymentMethod,
        orderCode: order.orderCode,
        lineIds: [],
      })

      window.location.href = paymentUrl
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || t('account.orders.paymentCreateError'),
      }
    }
  }

  function resetOrderState() {
    orders.value = []
    orderDetails.value = {}
    loading.value = false
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
