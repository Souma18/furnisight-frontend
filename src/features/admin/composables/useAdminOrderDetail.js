import { ref, computed } from 'vue'
import { ordersApi } from '@shared/lib/api/services'
import { OrderDetailResponse } from '@shared/lib/api/services/orders/orders.model'
import { formatVietnamAddress, PriceFormatter } from '@shared/lib/formatters'
import { getOrderStatusLabel } from '@shared/lib/orders/orderStatusMapper'

export function useAdminOrderDetail(orderCode) {
  const order = ref(null)
  const loading = ref(false)
  const error = ref('')

  const statusMap = {
    unpaid: { label: 'Chờ thanh toán', className: 'b-pending' },
    payment_failed: { label: 'Thanh toán lỗi', className: 'b-cancel' },
    paid: { label: 'Đã thanh toán', className: 'b-success' },
    cod_pending_confirmation: { label: 'Chờ xác nhận', className: 'b-pending' },
    cod_confirmed: { label: 'Xác nhận thành công', className: 'b-success' },
    in_transit: { label: 'Đang vận chuyển', className: 'b-shipping' },
    delivering: { label: 'Đang giao', className: 'b-shipping' },
    done: { label: 'Hoàn thành', className: 'b-success' },
    cancel: { label: 'Đã hủy', className: 'b-cancel' },
    refund_pending: { label: 'Chờ hoàn tiền', className: 'b-pending' },
    refunded: { label: 'Đã hoàn tiền', className: 'b-success' },
  }

  const statusMeta = computed(() => statusMap[order.value?.status] ?? {
    label: order.value?.rawStatus || order.value?.status || '',
    className: 'b-pending',
  })

  function isCodOrder(current = order.value) {
    return String(current?.paymentMethod || current?.paymentDetail?.paymentMethod || '').toLowerCase() === 'cod'
  }

  const displayStatusMeta = computed(() => {
    return {
      ...statusMeta.value,
      label: getOrderStatusLabel(order.value),
    }
  })

  const shippingAddress = computed(() => {
    const detail = order.value?.shippingDetail || {}
    return formatVietnamAddress({
      detail: detail.shippingAddressDetail,
      wardName: detail.wardName,
      provinceName: detail.provinceName,
    })
  })

  const paymentStatusMeta = computed(() => {
    if (isCodOrder()) return { label: 'Thanh toán khi nhận hàng', className: 'b-success' }
    const status = String(order.value?.paymentDetail?.paymentStatus || order.value?.rawStatus || '').toUpperCase()
    if (status === 'PAID') return { label: 'Đã thanh toán', className: 'b-success' }
    if (status === 'FAILED' || status === 'PAYMENT_FAILED') return { label: 'Thanh toán lỗi', className: 'b-cancel' }
    if (order.value?.status === 'refund_pending') return { label: 'Chờ hoàn tiền', className: 'b-pending' }
    if (order.value?.status === 'refunded') return { label: 'Đã hoàn tiền', className: 'b-success' }
    if (order.value?.status === 'unpaid') return { label: 'Chờ thanh toán', className: 'b-pending' }
    return { label: status || 'Chưa rõ', className: 'b-pending' }
  })

  const paymentRows = computed(() => {
    const payment = order.value?.paymentDetail || {}
    const timeline = order.value?.paymentTimeline || {}
    return [
      { label: 'Mã giao dịch nội bộ', value: payment.transactionCode || order.value?.orderCode || 'Chưa có' },
      { label: 'Phương thức', value: paymentMethodLabel(order.value) },
      { label: 'Trạng thái thanh toán', value: paymentStatusMeta.value.label },
      { label: isCodOrder() ? 'Số tiền cần thu' : 'Số tiền đã ghi nhận', value: formatMoney(isCodOrder() ? order.value?.totalAmount : (payment.paidAmount || 0)) },
      { label: 'Thời điểm thanh toán', value: isCodOrder() ? 'Khi nhận hàng' : (formatDateTime(payment.paidAt || timeline.paymentCompletedAt) || 'Chưa ghi nhận') },
      { label: 'Hạn thanh toán', value: formatDateTime(timeline.paymentExpiresAt || order.value?.paymentExpiresAt) || 'Không áp dụng' },
    ]
  })

  function paymentMethodLabel(current = order.value) {
    return isCodOrder(current) ? 'Thanh toán khi nhận hàng' : (current?.paymentDetail?.paymentMethod || current?.paymentMethod || 'Chưa rõ')
  }

  const timelineItems = computed(() => {
    const current = order.value
    if (!current) return []

    const timeline = current.paymentTimeline || {}
    const items = [
      {
        key: 'created',
        title: 'Đơn hàng được tạo',
        desc: 'Hệ thống ghi nhận đơn và khóa thông tin sản phẩm tại thời điểm đặt.',
        at: timeline.orderCreatedAt || current.createdAt,
        state: 'done',
        icon: 'clipboardList',
      },
    ]

    if (timeline.paymentInitiatedAt) {
      items.push({
        key: 'payment_initiated',
        title: 'Khởi tạo thanh toán',
        desc: `Khách chọn phương thức ${paymentMethodLabel(current)}.`,
        at: timeline.paymentInitiatedAt,
        state: 'done',
        icon: 'creditCard',
      })
    } else {
      items.push({
        key: 'payment_waiting',
        title: 'Chờ khởi tạo thanh toán',
        desc: 'Chưa có thời điểm khởi tạo thanh toán từ cổng thanh toán.',
        at: null,
        state: current.status === 'unpaid' ? 'current' : 'muted',
        icon: 'clock',
      })
    }

    if (isCodOrder(current)) {
      items.push({
        key: 'cod',
        title: 'Thanh toán khi nhận hàng',
        desc: 'Khách sẽ thanh toán tiền mặt khi nhận hàng.',
        at: timeline.orderCreatedAt || current.createdAt,
        state: 'current',
        icon: 'cash',
      })
    } else if (timeline.paymentCompletedAt || current.paymentDetail?.paidAt) {
      items.push({
        key: 'payment_completed',
        title: 'Thanh toán thành công',
        desc: `Đã ghi nhận ${formatMoney(current.paymentDetail?.paidAmount || current.totalAmount)}.`,
        at: timeline.paymentCompletedAt || current.paymentDetail?.paidAt,
        state: 'done',
        icon: 'check',
      })
    } else if (timeline.paymentFailedAt || current.status === 'payment_failed') {
      items.push({
        key: 'payment_failed',
        title: 'Thanh toán thất bại',
        desc: 'Cổng thanh toán trả trạng thái lỗi hoặc giao dịch không hợp lệ.',
        at: timeline.paymentFailedAt,
        state: 'failed',
        icon: 'ban',
      })
    } else if (current.status === 'unpaid') {
      items.push({
        key: 'payment_pending',
        title: 'Đang chờ thanh toán',
        desc: current.canRetryPayment ? 'Khách vẫn còn trong thời hạn thanh toán.' : 'Đã quá thời hạn thanh toán hoặc không thể thanh toán lại.',
        at: timeline.paymentExpiresAt || current.paymentExpiresAt,
        state: current.canRetryPayment ? 'current' : 'failed',
        icon: 'clock',
      })
    }

    if (['delivering', 'done'].includes(current.status)) {
      items.push({
        key: 'shipping',
        title: 'Đơn đang giao',
        desc: 'Đơn đã được chuyển sang trạng thái vận chuyển.',
        at: null,
        state: 'done',
        icon: 'truck',
      })
    }

    if (current.status === 'done') {
      items.push({
        key: 'done',
        title: 'Đã giao',
        desc: 'Đơn hàng đã được giao thành công.',
        at: null,
        state: 'done',
        icon: 'checkCheck',
      })
    }

    if (current.status === 'cancel') {
      items.push({
        key: 'cancel',
        title: 'Đơn đã hủy',
        desc: 'Đơn hàng đã được chuyển sang trạng thái hủy.',
        at: null,
        state: 'failed',
        icon: 'ban',
      })
    }

    if (current.status === 'refund_pending') {
      items.push({
        key: 'refund_pending',
        title: 'Chờ hoàn tiền',
        desc: 'Đơn đã thanh toán được hủy trước khi giao và đang chờ xử lý hoàn tiền.',
        at: null,
        state: 'current',
        icon: 'refresh',
      })
    }

    if (current.status === 'refunded') {
      items.push({
        key: 'refunded',
        title: 'Đã hoàn tiền',
        desc: 'Admin đã xác nhận hoàn tiền cho khách hàng.',
        at: null,
        state: 'done',
        icon: 'checkCheck',
      })
    }

    return items
  })

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const { data } = await ordersApi.getOrderDetail(orderCode.value)
      order.value = new OrderDetailResponse(data)
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Không tải được chi tiết đơn hàng.'
    } finally {
      loading.value = false
    }
  }

  const formatMoney = PriceFormatter.format

  function formatDate(value) {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date)
  }

  function formatDateTime(value) {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  return {
    order,
    loading,
    error,
    displayStatusMeta,
    shippingAddress,
    paymentStatusMeta,
    paymentRows,
    timelineItems,
    load,
    paymentMethodLabel,
    formatMoney,
    formatDate,
    formatDateTime,
  }
}
