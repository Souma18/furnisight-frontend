import { ref } from 'vue'
import { useAccountOrders } from './useAccountOrders'
import { usePaymentCountdown } from './usePaymentCountdown'
import { ORDER_STATUS_LABELS } from './orderStatusLabels'
import {
  canRetryOrderPayment,
  isOrderPaymentExpired,
  shouldShowRetryPayment,
} from '@shared/lib/api/services/orders/orders.model'
import { PriceFormatter } from '@shared/lib/formatters'
import { formatDate as formatDisplayDate } from '@shared/lib/formatters'

const CANCELABLE_ORDER_STATUSES = [
  'unpaid',
  'payment_failed',
  'paid',
  'cod_pending_confirmation',
  'cod_confirmed',
]

export const ORDER_FILTER_OPTIONS = [
  'all',
  'cod_pending_confirmation',
  'cod_confirmed',
  'unpaid',
  'payment_failed',
  'paid',
  'in_transit',
  'delivering',
  'done',
  'refund_pending',
  'refunded',
  'cancel',
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
    if (canRetryPaymentNow(order)) return 'Tiếp tục thanh toán đơn hàng'
    if (isOrderPaymentExpired(order)) return 'Đơn hàng đã quá hạn thanh toán'
    return 'Đơn hàng không thể thanh toán lại'
  }

  function canRetryPaymentNow(order) {
    return canRetryOrderPayment(order)
  }

  function formatDate(dateStr) {
    return formatDisplayDate(dateStr)
  }

  function statusClass(status) {
    if (status === 'delivering') return 'shipping'
    if (status === 'in_transit') return 'shipping'
    if (status === 'done') return 'done'
    if (status === 'cancel') return 'cancel'
    if (status === 'refund_pending') return 'refund'
    if (status === 'refunded') return 'done'
    if (status === 'payment_failed') return 'failed'
    if (status === 'cod_confirmed') return 'paid'
    if (status === 'cod_pending_confirmation') return 'pending'
    if (status === 'paid') return 'paid'
    return 'pending'
  }

  function displayCode(order) {
    return order.orderCode || 'Chưa có mã đơn'
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
    return `Còn ${formatCountdown(order)} để thanh toán`
  }

  function canCancelOrder(order) {
    return CANCELABLE_ORDER_STATUSES.includes(order?.status)
  }

  function displayStatusLabel(order) {
    if (order?.statusLabel) return order.statusLabel
    return ORDER_STATUS_LABELS[order.status] ?? order.status
  }

  return {
    filter,
    filteredOrders,
    cancelTarget,
    canceling,
    filterOptions: ORDER_FILTER_OPTIONS,
    statusLabels: ORDER_STATUS_LABELS,
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
