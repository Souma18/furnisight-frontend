import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '../store/orderStore'
import { i18n } from '@shared/i18n'
import { useLocaleStore } from '@shared/stores/localeStore'

const t = (key, params) => i18n.global.t(key, params)

function orderActionErrorMessage(error, fallbackKey) {
  if (error.message === 'NOT_FOUND') return t('account.orders.notFound')

  const code = error.code || error.response?.data?.code
  if (code === 'ORDER_NOT_FOUND') return t('account.orders.notFound')
  if (code === 'INVALID_ORDER_STATUS') return t('account.orders.invalidStatus')

  return t(fallbackKey)
}

export function useAccountOrders(emitNotify) {
  const route = useRoute()
  const router = useRouter()
  const orderStore = useOrderStore()
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
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
    try {
      const updatedDetail = await orderStore.cancelOrder(orderCode)
      if (emitNotify) {
        emitNotify(
          updatedDetail.status === 'refund_pending' ? t('account.orders.cancelRefundPending') : t('account.orders.cancelSuccess'),
          'success',
        )
      }
      return true
    } catch (error) {
      if (emitNotify) emitNotify(orderActionErrorMessage(error, 'account.orders.cancelError'), 'error')
      return false
    }
  }

  async function confirmOrderReceived(orderCode) {
    try {
      await orderStore.confirmOrderReceived(orderCode)
      if (emitNotify) emitNotify(t('account.orders.confirmSuccess'), 'success')
      return true
    } catch (error) {
      if (emitNotify) emitNotify(orderActionErrorMessage(error, 'account.orders.confirmError'), 'error')
      return false
    }
  }

  async function retryPayment(order) {
    const orderCode = order?.orderCode || ''
    if (!orderCode || retryingOrderCode.value) return false

    retryingOrderCode.value = orderCode
    try {
      await orderStore.retryPayment(order)
      if (emitNotify) emitNotify(t('account.orders.redirectPayment'), 'success')
      return true
    } catch (error) {
      let msg = t('account.orders.paymentCreateError')
      if (error.message === 'NO_CODE') msg = t('account.orders.retryNoCode')
      else if (error.message === 'EXPIRED_OR_UNAVAILABLE') msg = t('account.orders.retryExpiredOrUnavailable')
      else if (error.message === 'UNSUPPORTED_METHOD') msg = t('account.orders.retryMethodUnsupported')
      else if (error.message === 'PAYMENT_URL_MISSING') msg = t('account.orders.paymentUrlMissing')
      else msg = orderActionErrorMessage(error, 'account.orders.paymentCreateError')
      
      if (emitNotify) emitNotify(msg, 'error')
      return false
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

  watch(locale, async () => {
    await orderStore.fetchOrders()
    if (selectedOrderCode.value) {
      await orderStore.fetchOrderDetail(selectedOrderCode.value)
    }
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
