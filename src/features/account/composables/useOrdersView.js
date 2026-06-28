import { computed, ref } from 'vue'
import { useAccountOrders } from './useAccountOrders'
import { useCancelOrderDialog } from './useCancelOrderDialog'
import { usePaymentCountdown } from './usePaymentCountdown'
import { i18n } from '@shared/i18n'
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

  const {
    cancelTarget,
    canceling,
    openCancelDialog: handleCancel,
    closeCancelDialog,
    confirmCancel,
  } = useCancelOrderDialog(cancelOrder)

  const statusLabels = computed(() => Object.fromEntries(
    ORDER_FILTER_OPTIONS.map((status) => [status, statusLabel(status)]),
  ))

  function handleRetryPayment(order, event) {
    event?.stopPropagation?.()
    retryPayment(order)
  }

  function isRetrying(order) {
    return retryingOrderCode.value === order.orderCode
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
  }
}
