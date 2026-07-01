import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'
import { useAccountOrders } from './useAccountOrders'
import { useCancelOrderDialog } from './useCancelOrderDialog'
import { usePaymentCountdown } from './usePaymentCountdown'
import { i18n } from '@shared/i18n'
import { productsApi } from '@shared/lib/api/services/products/products.api'
import { ReviewResponse } from '@shared/lib/api/services/products/products.model'
import {
  canRetryOrderPayment,
  isOrderPaymentExpired,
  shouldShowRetryPayment,
} from '@shared/lib/api/services/orders/orders.model'
import { PriceFormatter, formatDate, formatDateTime } from '@shared/lib/formatters'
import { isCodPayment, getOrderStatusLabel } from '@shared/lib/orders/orderStatusMapper'

// Statuses from which user can cancel (mirrors BE canCancelOrder; COD: UNPAID/SHIPPING; VNPAY: UNPAID/PAYMENT_FAILED/PAID/SHIPPING)
const CANCELABLE_ORDER_STATUSES = ['unpaid', 'payment_failed', 'paid', 'shipping']

const t = (key, params) => i18n.global.t(key, params)
// Fallback for non-UNPAID statuses via i18n key
const orderStatusLabel = (status) => t(`account.orders.status.${String(status || 'unpaid').toLowerCase()}`)

export function useOrderDetailView(notify) {
  const router = useRouter()
  const authStore = useAuthStore()
  const {
    selectedOrder: order,
    backToOrders,
    cancelOrder,
    confirmOrderReceived,
    retryPayment,
    retryingOrderCode,
  } = useAccountOrders(notify)

  const {
    cancelTarget,
    canceling,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
  } = useCancelOrderDialog(cancelOrder)
  
  const cancelDialogOpen = computed(() => Boolean(cancelTarget.value))
  const confirmDialogOpen = ref(false)
  const confirming = ref(false)
  const reviewedItems = ref({})

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

  const canConfirmReceived = computed(() => order.value?.status === 'in_transit')

  const statusLabel = computed(() => {
    if (!order.value) return ''
    // For UNPAID: differentiate COD ("Đã đặt đơn") vs VNPAY ("Chờ thanh toán")
    if (order.value.status === 'unpaid') return getOrderStatusLabel(order.value)
    return order.value.status ? orderStatusLabel(order.value.status) : (order.value.statusLabel || '')
  })

  const paymentStatusLabel = computed(() => {
    if (isCodOrder()) return t('account.orders.payment.cod')
    const rawStatus = String(order.value?.paymentDetail?.paymentStatus || order.value?.rawStatus || '').toUpperCase()
    if (rawStatus === 'PAID') return t('account.orders.payment.paid')
    if (['FAILED', 'PAYMENT_FAILED'].includes(rawStatus)) return t('account.orders.payment.failed')
    if (order.value?.status === 'unpaid') return t('account.orders.payment.pending')
    if (order.value?.status === 'refund_pending') return t('account.orders.payment.refundPending')
    if (order.value?.status === 'refunded') return t('account.orders.payment.refunded')
    return rawStatus || t('account.orders.notRecorded')
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
      { label: t('account.orders.transaction.code'), value: payment.transactionCode || current.orderCode || t('account.orders.none') },
      { label: t('account.orders.transaction.status'), value: paymentStatusLabel.value },
      {
        label: isCodOrder(current) ? t('account.orders.transaction.codAmount') : t('account.orders.transaction.paidAmount'),
        value: formatMoney(isCodOrder(current) ? current.totalAmount : (payment.paidAmount || 0)),
      },
      {
        label: t('account.orders.transaction.paymentTime'),
        value: isCodOrder(current)
          ? t('account.orders.payment.whenReceived')
          : (formatDateTime(payment.paidAt || timeline.paymentCompletedAt) || t('account.orders.notRecorded')),
      },
      {
        label: t('account.orders.transaction.paymentDeadline'),
        value: formatDateTime(timeline.paymentExpiresAt || current.paymentExpiresAt) || t('account.orders.notApplicable'),
      },
    ]
  })

  const paymentDeadline = computed(() => {
    if (!order.value || !canRetryPaymentNow.value || !order.value.paymentExpiresAt || !isPaymentTimeRemaining(order.value)) return ''
    return t('account.orders.deadlineDetail', { time: formatCountdown(order.value) })
  })

  const retryPaymentTitle = computed(() => {
    if (canRetryPaymentNow.value) return t('account.orders.retryTitle.available')
    if (order.value && isOrderPaymentExpired(order.value)) return t('account.orders.retryTitle.expired')
    return t('account.orders.retryTitle.unavailable')
  })

  async function loadReviewedItems() {
    if (!authStore.isAuthenticated) {
      reviewedItems.value = {}
      return
    }

    const orderItemIds = Array.isArray(order.value?.items)
      ? order.value.items.map((item) => item?.id).filter(Boolean)
      : []

    if (!orderItemIds.length) {
      reviewedItems.value = {}
      return
    }

    try {
      const response = await productsApi.getMyOrderItemReviews(orderItemIds)
      const reviews = Array.isArray(response.data)
        ? response.data.map((review) => new ReviewResponse(review))
        : []
      reviewedItems.value = reviews.reduce((accumulator, review) => {
        if (review.orderItemId) {
          accumulator[review.orderItemId] = review
        }
        return accumulator
      }, {})
    } catch {
      reviewedItems.value = {}
    }
  }

  function handleCancel() {
    if (!canCancelCurrentOrder.value) return
    openCancelDialog(order.value)
  }

  function handleConfirmReceived() {
    if (!canConfirmReceived.value) return
    confirmDialogOpen.value = true
  }

  function closeConfirmDialog() {
    if (confirming.value) return
    confirmDialogOpen.value = false
  }

  async function executeConfirmReceived() {
    if (!order.value || confirming.value) return
    confirming.value = true
    const success = await confirmOrderReceived(order.value.orderCode)
    confirming.value = false
    if (success) confirmDialogOpen.value = false
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
    if (!productId || order.value?.status !== 'delivered') return
    router.push({
      name: 'product-detail',
      params: { id: productId },
      query: {
        tab: 'review',
        orderItemId: item?.id || '',
        orderCode: order.value?.orderCode || '',
      },
    })
  }

  function itemReviewState(item) {
    return reviewedItems.value[item?.id] || null
  }

  function hasReviewedItem(item) {
    return Boolean(itemReviewState(item))
  }

  function itemReviewRating(item) {
    return Number(itemReviewState(item)?.rating || 0)
  }

  function isCodOrder(current = order.value) {
    return isCodPayment(current)
  }

  function paymentMethodLabel(current = order.value) {
    return isCodOrder(current)
      ? t('account.orders.payment.cod')
      : (current?.paymentDetail?.paymentMethod || current?.paymentMethod || t('account.orders.unknown'))
  }

  function orderItemProductId(item) {
    return item?.productSnapshot?.productId || item?.productId || ''
  }

  watch(
    () => order.value?.orderCode,
    () => {
      loadReviewedItems()
    },
    { immediate: true },
  )

  return {
    order,
    backToOrders,
    cancelDialogOpen,
    canceling,
    confirmDialogOpen,
    confirming,
    retryingPayment,
    canRetryPaymentNow,
    canCancelCurrentOrder,
    canConfirmReceived,
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
    orderItemProductId,
    itemReviewState,
    hasReviewedItem,
    itemReviewRating,
    openProductDetail,
    reviewProduct,
    paymentMethodLabel,
    handleCancel,
    closeCancelDialog,
    confirmCancel,
    handleConfirmReceived,
    closeConfirmDialog,
    executeConfirmReceived,
    handleRetryPayment,
  }
}



function buildTransactionTimeline(current, helpers) {
  if (!current) return []

  const timeline = current.paymentTimeline || {}
  const items = [
    {
      key: 'created',
      title: t('account.orders.timeline.createdTitle'),
      sub: t('account.orders.timeline.createdSub'),
      time: timeline.orderCreatedAt || current.createdAt,
      state: 'done',
      icon: 'clipboardList',
    },
  ]

  if (timeline.paymentInitiatedAt) {
    items.push({
      key: 'initiated',
      title: t('account.orders.timeline.initiatedTitle'),
      sub: t('account.orders.timeline.initiatedSub', { method: helpers.paymentMethodLabel(current) }),
      time: timeline.paymentInitiatedAt,
      state: 'done',
      icon: 'creditCard',
    })
  }

  if (helpers.isCodOrder(current)) {
    items.push({
      key: 'cod',
      title: t('account.orders.timeline.codTitle'),
      sub: t('account.orders.timeline.codSub'),
      time: timeline.orderCreatedAt || current.createdAt,
      state: 'active',
      icon: 'cash',
    })
  } else if (timeline.paymentCompletedAt || current.paymentDetail?.paidAt) {
    items.push({
      key: 'completed',
      title: t('account.orders.timeline.completedTitle'),
      sub: t('account.orders.timeline.completedSub', { amount: helpers.formatMoney(current.paymentDetail?.paidAmount || current.totalAmount) }),
      time: timeline.paymentCompletedAt || current.paymentDetail?.paidAt,
      state: 'done',
      icon: 'check',
    })
  } else if (timeline.paymentFailedAt || current.status === 'payment_failed') {
    items.push({
      key: 'failed',
      title: t('account.orders.timeline.failedTitle'),
      sub: t('account.orders.timeline.failedSub'),
      time: timeline.paymentFailedAt,
      state: 'failed',
      icon: 'ban',
    })
  } else {
    items.push({
      key: 'pending',
      title: t('account.orders.timeline.pendingTitle'),
      sub: helpers.canRetryPaymentNow
        ? t('account.orders.timeline.pendingCanPay')
        : t('account.orders.timeline.pendingExpired'),
      time: timeline.paymentExpiresAt || current.paymentExpiresAt,
      state: helpers.canRetryPaymentNow ? 'active' : 'pending',
      icon: 'clock',
    })
  }

  if (current.status === 'refund_pending') {
    items.push({
      key: 'refund_pending',
      title: t('account.orders.timeline.refundPendingTitle'),
      sub: t('account.orders.timeline.refundPendingSub'),
      time: null,
      state: 'active',
      icon: 'refresh',
    })
  }

  if (current.status === 'refunded') {
    items.push({
      key: 'refunded',
      title: t('account.orders.timeline.refundedTitle'),
      sub: t('account.orders.timeline.refundedSub'),
      time: null,
      state: 'done',
      icon: 'checkCheck',
    })
  }

  return items
}
