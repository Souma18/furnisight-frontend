import { computed, onMounted, ref, watch } from 'vue'
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

  const selectedOrderCode = computed(() => {
    const raw = route.query.orderCode || route.query.orderId
    return typeof raw === 'string' ? raw : ''
  })

  const selectedOrder = computed(() => {
    if (!selectedOrderCode.value) return null
    return orderStore.getOrderDetail(selectedOrderCode.value)
  })

  async function openOrderDetail(orderCode) {
    if (!orderCode) return
    await router.push({
      name: 'account',
      query: {
        view: 'order-detail',
        orderCode,
      },
    })
  }

  async function backToOrders() {
    await router.push({
      name: 'account',
      query: { view: 'orders' },
    })
  }

  async function cancelOrder(orderCode) {
    const result = await orderStore.cancelOrder(orderCode)
    if (!result.ok) {
      if (emitNotify) emitNotify(result.message ?? 'Không thể huỷ đơn.', 'error')
      return false
    }
    if (emitNotify) {
      emitNotify(
        result.status === 'refund_pending' ? 'Đã hủy đơn. Đơn đang chờ hoàn tiền.' : 'Đã huỷ đơn hàng.',
        'success',
      )
    }
    return true
  }

  async function retryPayment(order) {
    const orderCode = order?.orderCode || ''
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

  onMounted(() => {
    orderStore.fetchOrders()
  })

  watch(selectedOrderCode, (orderCode) => {
    if (!orderCode) return
    const order = orderStore.getOrderDetail(orderCode)
    orderStore.fetchOrderDetail(order?.orderCode || orderCode)
  }, { immediate: true })

  return {
    orders,
    filter,
    filteredOrders,
    selectedOrderId: selectedOrderCode,
    selectedOrderCode,
    selectedOrder,
    openOrderDetail,
    backToOrders,
    cancelOrder,
    retryPayment,
    retryingOrderCode,
  }
}
