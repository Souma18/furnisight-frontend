import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../store/orderStore'
import { i18n } from '@shared/i18n'
import { useLocaleStore } from '@shared/stores/localeStore'
import { storeToRefs } from 'pinia'

const t = (key, params) => i18n.global.t(key, params)

export function useAccountOrders(emitNotify) {
  const route = useRoute()
  const router = useRouter()
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
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
      if (emitNotify) emitNotify(result.message ?? t('account.orders.cancelError'), 'error')
      return false
    }
    if (emitNotify) {
      emitNotify(
        result.status === 'refund_pending' ? t('account.orders.cancelRefundPending') : t('account.orders.cancelSuccess'),
        'success',
      )
    }
    return true
  }

  async function confirmOrderReceived(orderCode) {
    const result = await orderStore.confirmOrderReceived(orderCode)
    if (!result.ok) {
      if (emitNotify) emitNotify(result.message ?? t('account.orders.confirmError'), 'error')
      return false
    }
    if (emitNotify) emitNotify(t('account.orders.confirmSuccess'), 'success')
    return true
  }

  async function retryPayment(order) {
    const orderCode = order?.orderCode || ''
    if (!orderCode || retryingOrderCode.value) return false

    retryingOrderCode.value = orderCode
    try {
      const result = await orderStore.retryPayment(order)
      if (!result.ok) {
        if (emitNotify) emitNotify(result.message ?? t('account.orders.retryError'), 'error')
        return false
      }
      if (emitNotify) emitNotify(t('account.orders.redirectPayment'), 'success')
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

  watch(locale, () => {
    const orderCode = selectedOrderCode.value
    if (!orderCode) return
    orderStore.fetchOrderDetail(orderCode)
  })

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
    confirmOrderReceived,
    retryPayment,
    retryingOrderCode,
  }
}
