import { computed, ref } from 'vue'
import { useAccountOrders } from './useAccountOrders'
import { usePaymentCountdown } from './usePaymentCountdown'
import { i18n } from '@shared/i18n'
import {
  canRetryOrderPayment,
  isOrderPaymentExpired,
  shouldShowRetryPayment,
} from '@shared/lib/api/services/orders/orders.model'
import { PriceFormatter } from '@shared/lib/formatters'
import { formatDate as formatDisplayDate } from '@shared/lib/formatters'

// Mirrors BE canCancelOrder() — VNPAY: UNPAID/PAYMENT_FAILED/PAID/SHIPPING; COD adds SHIPPING
const CANCELABLE_ORDER_STATUSES = ['unpaid', 'payment_failed', 'paid', 'shipping']


const t = (key, params) => i18n.global.t(key, params)
const statusLabel = (status) => t(`account.orders.status.${String(status || 'unpaid').toLowerCase()}`)

export const ORDER_FILTER_OPTIONS = [
  'all',
  'unpaid',
  'payment_failed',
  'paid',
  'shipping',
  'in_transit',
  'delivered',
  'cancelled',
  'refund_pending',
  'refunded',
]

export function useOrdersView(notify) {
  const {
    filter,
    filteredOrders,
    openOrderDetail,
    cancelOrder,
    retryPayment,
    retryingOrderCode,
  } = useAccountOrders(notify)

  const cancelTarget = ref(null)
  const canceling = ref(false)
  const { formatCountdown, isPaymentTimeRemaining } = usePaymentCountdown()
  const formatMoney = PriceFormatter.format
  const statusLabels = computed(() => Object.fromEntries(
    ORDER_FILTER_OPTIONS.map((status) => [status, statusLabel(status)]),
  ))

  function handleCancel(order, event) {
    event?.stopPropagation?.()
    cancelTarget.value = order
  }

  function closeCancelDialog() {
    if (canceling.value) return
    cancelTarget.value = null
  }

  async function confirmCancel() {
    if (!cancelTarget.value || canceling.value) return
    canceling.value = true
    const success = await cancelOrder(cancelTarget.value.orderCode)
    canceling.value = false
    if (success) cancelTarget.value = null
  }

  function handleRetryPayment(order, event) {
    event?.stopPropagation?.()
    retryPayment(order)
  }

  function isRetrying(order) {
    return retryingOrderCode.value === order.orderCode
  }

  function retryPaymentTitle(order) {
    if (canRetryPaymentNow(order)) return t('account.orders.retryTitle.available')
    if (isOrderPaymentExpired(order)) return t('account.orders.retryTitle.expired')
    return t('account.orders.retryTitle.unavailable')
  }

  function canRetryPaymentNow(order) {
    return canRetryOrderPayment(order)
  }

  function formatDate(dateStr) {
    return formatDisplayDate(dateStr)
  }

  function statusClass(status) {
    if (status === 'shipping' || status === 'in_transit') return 'shipping'
    if (status === 'delivered' || status === 'refunded') return 'done'
    if (status === 'cancelled') return 'cancel'
    if (status === 'refund_pending') return 'refund'
    if (status === 'payment_failed') return 'failed'
    if (status === 'paid') return 'paid'
    return 'pending' // unpaid
  }

  function displayCode(order) {
    return order.orderCode || t('account.orders.noCode')
  }

  function hideBrokenImage(event) {
    event.target.style.display = 'none'
  }

  function orderListImage(order = {}) {
    return order.firstProductImage
      || order.items?.[0]?.imageUrl
      || order.items?.[0]?.productSnapshot?.imageUrl
      || ''
  }

  function formatPaymentDeadline(order) {
    if (!canRetryPaymentNow(order) || !order.paymentExpiresAt || !isPaymentTimeRemaining(order)) return ''
    return t('account.orders.deadlineList', { time: formatCountdown(order) })
  }

  function canCancelOrder(order) {
    return CANCELABLE_ORDER_STATUSES.includes(order?.status)
  }

  function displayStatusLabel(order) {
    if (order?.statusLabel) return order.statusLabel
    const rawStatus = String(order.status || 'unpaid').toLowerCase()
    return statusLabels.value[rawStatus] ?? order.status
  }

  return {
    filter,
    filteredOrders,
    cancelTarget,
    canceling,
    filterOptions: ORDER_FILTER_OPTIONS,
    statusLabels,
    shouldShowRetryPayment,
    openOrderDetail,
    handleCancel,
    closeCancelDialog,
    confirmCancel,
    handleRetryPayment,
    isRetrying,
    retryPaymentTitle,
    canRetryPaymentNow,
    formatDate,
    formatMoney,
    statusClass,
    displayCode,
    hideBrokenImage,
    orderListImage,
    formatPaymentDeadline,
    canCancelOrder,
    displayStatusLabel,
  }
}
