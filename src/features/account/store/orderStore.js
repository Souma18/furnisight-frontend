import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersApi } from '@shared/lib/api/services'
import { OrderListResponse, OrderDetailResponse } from '@shared/lib/api/services/orders/orders.model'

export const useOrderStore = defineStore('accountOrder', () => {
  const orders = ref([])
  const orderDetails = ref({})
  const loading = ref(false)

  async function fetchOrders() {
    try {
      loading.value = true
      const { data } = await ordersApi.getOrders()
      orders.value = Array.isArray(data) ? data.map(item => new OrderListResponse(item)) : []
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
      return detail
    } catch (error) {
      console.error(`Failed to fetch order detail ${orderCode}:`, error)
      return null
    } finally {
      loading.value = false
    }
  }

  function getOrderDetail(orderId) {
    return orderDetails.value[orderId] ?? null
  }

  function addOrderFromCheckout(payload) {
    if (payload.order) {
      orders.value = [payload.order, ...orders.value]
      orderDetails.value = { ...orderDetails.value, [payload.order.id || payload.order.orderCode]: payload.order }
    }
    return payload.order
  }

  async function cancelOrder(orderId) {
    const detail = orderDetails.value[orderId]
    if (!detail) return { ok: false, message: 'Đơn hàng không tồn tại.' }
    
    try {
      await ordersApi.cancelOrder(orderId)
      orders.value = orders.value.map(o => o.id === orderId || o.orderCode === orderId ? { ...o, status: 'cancel' } : o)
      orderDetails.value = { ...orderDetails.value, [orderId]: { ...detail, status: 'cancel' } }
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || 'Không thể huỷ đơn hàng lúc này.' }
    }
  }

  return {
    orders,
    orderDetails,
    fetchOrders,
    fetchOrderDetail,
    addOrderFromCheckout,
    getOrderDetail,
    cancelOrder
  }
})
