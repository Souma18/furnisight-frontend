import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../store/orderStore'

export function useAccountOrders(emitNotify) {
  const route = useRoute()
  const router = useRouter()
  const orderStore = useOrderStore()
  const retryingOrderCode = ref('')

  const orders = computed(() => orderStore.orders)

  const filter = ref('all')
  const filteredOrders = computed(() =>
    filter.value === 'all' ? orders.value : orders.value.filter((order) => order.status === filter.value),
  )

  const selectedOrderId = computed(() => {
    const raw = route.query.orderId
    return typeof raw === 'string' ? raw : ''
  })

  const selectedOrder = computed(() => {
    if (!selectedOrderId.value) return null
    return orderStore.getOrderDetail(selectedOrderId.value)
  })

  function openOrderDetail(orderId) {
    router.push({ path: '/account', query: { view: 'order-detail', orderId } })
  }

  function backToOrders() {
    router.push({ path: '/account', query: { view: 'orders' } })
  }

  async function cancelOrder(orderId) {
    const result = await orderStore.cancelOrder(orderId)
    if (!result.ok) {
      if (emitNotify) emitNotify(result.message ?? 'Không thể huỷ đơn.', 'error')
      return false
    }
    if (emitNotify) emitNotify('Đã huỷ đơn hàng.', 'success')
    return true
  }

  async function retryPayment(order) {
    const orderCode = order?.orderCode || order?.id || ''
    if (!orderCode || retryingOrderCode.value) return false

    retryingOrderCode.value = orderCode
    try {
      const result = await orderStore.retryPayment(order)
      if (!result.ok) {
        if (emitNotify) emitNotify(result.message ?? 'Không thể thanh toán lại.', 'error')
        return false
      }
      if (emitNotify) emitNotify('Đang chuyển sang cổng thanh toán.', 'success')
      return true
    } finally {
      retryingOrderCode.value = ''
    }
  }

  watch(selectedOrderId, (orderId) => {
    if (!orderId) return
    const order = orderStore.getOrderDetail(orderId)
    orderStore.fetchOrderDetail(order?.orderCode || orderId)
  }, { immediate: true })

  return {
    orders,
    filter,
    filteredOrders,
    selectedOrderId,
    selectedOrder,
    openOrderDetail,
    backToOrders,
    cancelOrder,
    retryPayment,
    retryingOrderCode,
  }
}
