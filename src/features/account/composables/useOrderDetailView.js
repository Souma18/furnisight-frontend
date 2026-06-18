import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountOrders } from './useAccountOrders'
import { usePaymentCountdown } from './usePaymentCountdown'
import { ORDER_STATUS_LABELS } from './orderStatusLabels'
import {
  canRetryOrderPayment,
  isOrderPaymentExpired,
  shouldShowRetryPayment,
} from '@shared/lib/api/services/orders/orders.model'
import { PriceFormatter, formatDate, formatDateTime } from '@shared/lib/formatters'
import { isCodPayment } from '@shared/lib/orders/orderStatusMapper'

const CANCELABLE_ORDER_STATUSES = [
  'unpaid',
  'payment_failed',
  'paid',
  'cod_pending_confirmation',
  'cod_confirmed',
]

export function useOrderDetailView(notify) {
  const router = useRouter()
  const {
    selectedOrder: order,
    backToOrders,
    cancelOrder,
    retryPayment,
    retryingOrderCode,
  } = useAccountOrders(notify)

  const cancelDialogOpen = ref(false)
  const canceling = ref(false)
  const { formatCountdown, isPaymentTimeRemaining } = usePaymentCountdown()
  const formatMoney = PriceFormatter.format

  const retryingPayment = computed(() =>
    Boolean(order.value) && retryingOrderCode.value === order.value.orderCode,
  )

  const canRetryPaymentNow = computed(() =>
    Boolean(order.value)
      && canRetryOrderPayment(order.value),
  )

  const canCancelCurrentOrder = computed(() =>
    CANCELABLE_ORDER_STATUSES.includes(order.value?.status),
  )

  const statusLabel = computed(() => {
    return order.value?.statusLabel || ORDER_STATUS_LABELS[order.value?.status] || order.value?.status || ''
  })

  const paymentStatusLabel = computed(() => {
    if (isCodOrder()) return 'Thanh toán khi nhận hàng'
    const rawStatus = String(order.value?.paymentDetail?.paymentStatus || order.value?.rawStatus || '').toUpperCase()
    if (rawStatus === 'PAID') return 'Đã thanh toán'
    if (['FAILED', 'PAYMENT_FAILED'].includes(rawStatus)) return 'Thanh toán thất bại'
    if (order.value?.status === 'unpaid') return 'Chờ thanh toán'
    if (order.value?.status === 'refund_pending') return 'Chờ hoàn tiền'
    if (order.value?.status === 'refunded') return 'Đã hoàn tiền'
    return rawStatus || 'Chưa ghi nhận'
  })

  const transactionTimeline = computed(() => buildTransactionTimeline(order.value, {
    canRetryPaymentNow: canRetryPaymentNow.value,
    formatMoney,
    isCodOrder,
    paymentMethodLabel,
  }))

  const transactionRows = computed(() => {
    const current = order.value
    if (!current) return []

    const payment = current.paymentDetail || {}
    const timeline = current.paymentTimeline || {}
    return [
      { label: 'Mã giao dịch', value: payment.transactionCode || current.orderCode || 'Chưa có' },
      { label: 'Trạng thái', value: paymentStatusLabel.value },
      {
        label: isCodOrder(current) ? 'Số tiền cần thu' : 'Số tiền ghi nhận',
        value: formatMoney(isCodOrder(current) ? current.totalAmount : (payment.paidAmount || 0)),
      },
      {
        label: 'Thời điểm thanh toán',
        value: isCodOrder(current)
          ? 'Khi nhận hàng'
          : (formatDateTime(payment.paidAt || timeline.paymentCompletedAt) || 'Chưa ghi nhận'),
      },
      {
        label: 'Hạn thanh toán',
        value: formatDateTime(timeline.paymentExpiresAt || current.paymentExpiresAt) || 'Không áp dụng',
      },
    ]
  })

  const paymentDeadline = computed(() => {
    if (!order.value || !canRetryPaymentNow.value || !order.value.paymentExpiresAt || !isPaymentTimeRemaining(order.value)) return ''
    return `Còn ${formatCountdown(order.value)} để hoàn tất thanh toán`
  })

  const retryPaymentTitle = computed(() => {
    if (canRetryPaymentNow.value) return 'Tiếp tục thanh toán đơn hàng'
    if (order.value && isOrderPaymentExpired(order.value)) return 'Đơn hàng đã quá hạn thanh toán'
    return 'Đơn hàng không thể thanh toán lại'
  })

  function handleCancel() {
    if (!canCancelCurrentOrder.value) return
    cancelDialogOpen.value = true
  }

  function closeCancelDialog() {
    if (canceling.value) return
    cancelDialogOpen.value = false
  }

  async function confirmCancel() {
    if (!order.value || canceling.value) return
    canceling.value = true
    const success = await cancelOrder(order.value.orderCode)
    canceling.value = false
    if (success) cancelDialogOpen.value = false
  }

  function handleRetryPayment() {
    if (!order.value) return
    retryPayment(order.value)
  }

  function openProductDetail(item) {
    const productId = orderItemProductId(item)
    if (!productId) return
    router.push({
      name: 'product-detail',
      params: { id: productId },
    })
  }

  function reviewProduct(item) {
    const productId = orderItemProductId(item)
    if (!productId || order.value?.status !== 'done') return
    router.push({
      name: 'product-detail',
      params: { id: productId },
      query: { tab: 'review' },
    })
  }

  function isCodOrder(current = order.value) {
    return isCodPayment(current)
  }

  function paymentMethodLabel(current = order.value) {
    return isCodOrder(current)
      ? 'Thanh toán khi nhận hàng'
      : (current?.paymentDetail?.paymentMethod || current?.paymentMethod || 'Chưa rõ')
  }

  return {
    order,
    backToOrders,
    cancelDialogOpen,
    canceling,
    retryingPayment,
    canRetryPaymentNow,
    canCancelCurrentOrder,
    statusLabel,
    paymentStatusLabel,
    transactionTimeline,
    transactionRows,
    paymentDeadline,
    retryPaymentTitle,
    shouldShowRetryPayment,
    formatMoney,
    formatDate,
    formatDateTime,
    orderItemImage,
    orderItemProductId,
    openProductDetail,
    reviewProduct,
    hideBrokenImage,
    paymentMethodLabel,
    handleCancel,
    closeCancelDialog,
    confirmCancel,
    handleRetryPayment,
  }
}



function orderItemImage(item = {}) {
  return item.imageUrl || item.productSnapshot?.imageUrl || ''
}

function orderItemProductId(item = {}) {
  return item.productId || item.productSnapshot?.productId || ''
}

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}

function buildTransactionTimeline(current, helpers) {
  if (!current) return []

  const timeline = current.paymentTimeline || {}
  const items = [
    {
      key: 'created',
      title: 'Đơn hàng được tạo',
      sub: 'Hệ thống đã ghi nhận đơn hàng.',
      time: timeline.orderCreatedAt || current.createdAt,
      state: 'done',
      icon: 'clipboardList',
    },
  ]

  if (timeline.paymentInitiatedAt) {
    items.push({
      key: 'initiated',
      title: 'Khởi tạo thanh toán',
      sub: `Phương thức ${helpers.paymentMethodLabel(current)}.`,
      time: timeline.paymentInitiatedAt,
      state: 'done',
      icon: 'creditCard',
    })
  }

  if (helpers.isCodOrder(current)) {
    items.push({
      key: 'cod',
      title: 'Thanh toán khi nhận hàng',
      sub: 'Khách sẽ thanh toán tiền mặt khi nhận hàng.',
      time: timeline.orderCreatedAt || current.createdAt,
      state: 'active',
      icon: 'cash',
    })
  } else if (timeline.paymentCompletedAt || current.paymentDetail?.paidAt) {
    items.push({
      key: 'completed',
      title: 'Thanh toán thành công',
      sub: `Đã ghi nhận ${helpers.formatMoney(current.paymentDetail?.paidAmount || current.totalAmount)}.`,
      time: timeline.paymentCompletedAt || current.paymentDetail?.paidAt,
      state: 'done',
      icon: 'check',
    })
  } else if (timeline.paymentFailedAt || current.status === 'payment_failed') {
    items.push({
      key: 'failed',
      title: 'Thanh toán thất bại',
      sub: 'Giao dịch chưa được cổng thanh toán chấp nhận.',
      time: timeline.paymentFailedAt,
      state: 'failed',
      icon: 'ban',
    })
  } else {
    items.push({
      key: 'pending',
      title: 'Chờ thanh toán',
      sub: helpers.canRetryPaymentNow
        ? 'Bạn vẫn có thể tiếp tục thanh toán đơn hàng.'
        : 'Đơn hàng đã hết thời gian thanh toán.',
      time: timeline.paymentExpiresAt || current.paymentExpiresAt,
      state: helpers.canRetryPaymentNow ? 'active' : 'pending',
      icon: 'clock',
    })
  }

  if (current.status === 'refund_pending') {
    items.push({
      key: 'refund_pending',
      title: 'Chờ hoàn tiền',
      sub: 'Đơn đã thanh toán được hủy trước khi giao và đang chờ xử lý hoàn tiền.',
      time: null,
      state: 'active',
      icon: 'refresh',
    })
  }

  if (current.status === 'refunded') {
    items.push({
      key: 'refunded',
      title: 'Đã hoàn tiền',
      sub: 'Admin đã xác nhận hoàn tiền cho đơn hàng.',
      time: null,
      state: 'done',
      icon: 'checkCheck',
    })
  }

  return items
}
