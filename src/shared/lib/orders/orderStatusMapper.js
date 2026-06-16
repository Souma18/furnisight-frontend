export const ORDER_STATUS_CODES = Object.freeze({
  UNPAID: 'UNPAID',
  CONFIRMED: 'CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAID: 'PAID',
  IN_TRANSIT: 'IN_TRANSIT',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
})

export const ORDER_STATUS_LABELS = Object.freeze({
  all: 'Tất cả',
  unpaid: 'Chờ thanh toán',
  payment_failed: 'Thanh toán thất bại',
  paid: 'Đã thanh toán',
  cod_pending_confirmation: 'Chờ xác nhận',
  cod_confirmed: 'Xác nhận thành công',
  in_transit: 'Đang vận chuyển',
  pending: 'Chờ xác nhận',
  delivering: 'Đang giao',
  done: 'Hoàn thành',
  cancel: 'Đã hủy',
  refund_pending: 'Chờ hoàn tiền',
  refunded: 'Đã hoàn tiền',
})

const RAW_STATUS_TO_CODE = Object.freeze({
  UNPAID: ORDER_STATUS_CODES.UNPAID,
  PENDING: ORDER_STATUS_CODES.UNPAID,
  CONFIRMED: ORDER_STATUS_CODES.CONFIRMED,
  PAYMENT_FAILED: ORDER_STATUS_CODES.PAYMENT_FAILED,
  FAILED: ORDER_STATUS_CODES.PAYMENT_FAILED,
  PAID: ORDER_STATUS_CODES.PAID,
  IN_TRANSIT: ORDER_STATUS_CODES.IN_TRANSIT,
  SHIPPING: ORDER_STATUS_CODES.SHIPPING,
  DELIVERING: ORDER_STATUS_CODES.SHIPPING,
  DELIVERED: ORDER_STATUS_CODES.DELIVERED,
  DONE: ORDER_STATUS_CODES.DELIVERED,
  SUCCESS: ORDER_STATUS_CODES.DELIVERED,
  CANCELLED: ORDER_STATUS_CODES.CANCELLED,
  CANCELED: ORDER_STATUS_CODES.CANCELLED,
  CANCEL: ORDER_STATUS_CODES.CANCELLED,
  REFUND_PENDING: ORDER_STATUS_CODES.REFUND_PENDING,
  PENDING_REFUND: ORDER_STATUS_CODES.REFUND_PENDING,
  REFUNDED: ORDER_STATUS_CODES.REFUNDED,
})

const STATUS_CODE_TO_UI_KEY = Object.freeze({
  [ORDER_STATUS_CODES.UNPAID]: 'unpaid',
  [ORDER_STATUS_CODES.CONFIRMED]: 'cod_confirmed',
  [ORDER_STATUS_CODES.PAYMENT_FAILED]: 'payment_failed',
  [ORDER_STATUS_CODES.PAID]: 'paid',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'in_transit',
  [ORDER_STATUS_CODES.SHIPPING]: 'delivering',
  [ORDER_STATUS_CODES.DELIVERED]: 'done',
  [ORDER_STATUS_CODES.CANCELLED]: 'cancel',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'refund_pending',
  [ORDER_STATUS_CODES.REFUNDED]: 'refunded',
})

const COD_STATUS_CODE_TO_UI_KEY = Object.freeze({
  [ORDER_STATUS_CODES.UNPAID]: 'cod_pending_confirmation',
  [ORDER_STATUS_CODES.CONFIRMED]: 'cod_confirmed',
  [ORDER_STATUS_CODES.PAID]: 'cod_confirmed',
})

const COD_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS_CODES.UNPAID]: 'Chờ xác nhận',
  [ORDER_STATUS_CODES.CONFIRMED]: 'Xác nhận thành công',
  [ORDER_STATUS_CODES.PAYMENT_FAILED]: 'Thanh toán thất bại',
  [ORDER_STATUS_CODES.PAID]: 'Xác nhận thành công',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'Đang vận chuyển',
  [ORDER_STATUS_CODES.SHIPPING]: 'Đang giao',
  [ORDER_STATUS_CODES.DELIVERED]: 'Hoàn thành',
  [ORDER_STATUS_CODES.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'Chờ hoàn tiền',
  [ORDER_STATUS_CODES.REFUNDED]: 'Đã hoàn tiền',
})

const ONLINE_PAYMENT_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS_CODES.CONFIRMED]: 'Xác nhận thành công',
  [ORDER_STATUS_CODES.UNPAID]: 'Chờ thanh toán',
  [ORDER_STATUS_CODES.PAYMENT_FAILED]: 'Thanh toán thất bại',
  [ORDER_STATUS_CODES.PAID]: 'Đã thanh toán',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'Đang vận chuyển',
  [ORDER_STATUS_CODES.SHIPPING]: 'Đang giao',
  [ORDER_STATUS_CODES.DELIVERED]: 'Hoàn thành',
  [ORDER_STATUS_CODES.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'Chờ hoàn tiền',
  [ORDER_STATUS_CODES.REFUNDED]: 'Đã hoàn tiền',
})

export const ORDER_STATUS_LABEL_TO_API = Object.freeze({
  'Xác nhận thành công': ORDER_STATUS_CODES.CONFIRMED,
  'Đang vận chuyển': ORDER_STATUS_CODES.IN_TRANSIT,
  'Đang giao': ORDER_STATUS_CODES.SHIPPING,
  'Hoàn thành': ORDER_STATUS_CODES.DELIVERED,
  'Đã giao': ORDER_STATUS_CODES.DELIVERED,
  'Đã hoàn tiền': ORDER_STATUS_CODES.REFUNDED,
})

function normalizeRawStatus(value) {
  return String(value || '').trim().toUpperCase()
}

export function normalizeOrderStatusCode(orderOrStatus = '') {
  const status = (orderOrStatus && typeof orderOrStatus === 'object')
    ? orderOrStatus.rawStatus || orderOrStatus.statusCode || orderOrStatus.status
    : orderOrStatus
  const normalized = normalizeRawStatus(status)
  return RAW_STATUS_TO_CODE[normalized] || normalized || ORDER_STATUS_CODES.UNPAID
}

export function normalizeOrderStatus(status) {
  const code = normalizeOrderStatusCode(status)
  return STATUS_CODE_TO_UI_KEY[code] || String(status || 'unpaid').toLowerCase()
}

export function normalizeOrderUiStatus(orderOrStatus = '', paymentType = '') {
  const code = normalizeOrderStatusCode(orderOrStatus)
  if (isCodPayment((orderOrStatus && typeof orderOrStatus === 'object') ? orderOrStatus : paymentType)) {
    return COD_STATUS_CODE_TO_UI_KEY[code] || STATUS_CODE_TO_UI_KEY[code] || String(orderOrStatus || '').toLowerCase()
  }

  return STATUS_CODE_TO_UI_KEY[code] || String(orderOrStatus || 'unpaid').toLowerCase()
}

export function normalizePaymentType(orderOrPaymentType = '') {
  const value = (orderOrPaymentType && typeof orderOrPaymentType === 'object')
    ? orderOrPaymentType.paymentMethod
      || orderOrPaymentType.paymentType
      || orderOrPaymentType.paymentDetail?.paymentMethod
      || orderOrPaymentType.paymentDetail?.paymentType
    : orderOrPaymentType

  return String(value || 'vnpay').trim().toLowerCase()
}

export function isCodPayment(orderOrPaymentType = '') {
  return normalizePaymentType(orderOrPaymentType) === 'cod'
}

export function getOrderStatusLabel(orderOrStatus = '', paymentType = '') {
  const code = normalizeOrderStatusCode(orderOrStatus)
  const labels = isCodPayment((orderOrStatus && typeof orderOrStatus === 'object') ? orderOrStatus : paymentType)
    ? COD_STATUS_LABELS
    : ONLINE_PAYMENT_STATUS_LABELS

  return labels[code] || ORDER_STATUS_LABELS[normalizeOrderStatus(code)] || String(orderOrStatus || '')
}

export function getOrderStatusApiValue(label) {
  return ORDER_STATUS_LABEL_TO_API[label] || ''
}

export function getOrderStatusOptions(order = {}) {
  const code = normalizeOrderStatusCode(order)

  if (code === ORDER_STATUS_CODES.REFUND_PENDING) return ['Đã hoàn tiền']

  if (isCodPayment(order)) {
    if (code === ORDER_STATUS_CODES.UNPAID) return ['Xác nhận thành công']
    if (code === ORDER_STATUS_CODES.CONFIRMED || code === ORDER_STATUS_CODES.PAID) return ['Đang giao']
    if (code === ORDER_STATUS_CODES.SHIPPING) return ['Hoàn thành']
    return []
  }

  if (code === ORDER_STATUS_CODES.PAID) return ['Đang vận chuyển']
  if (code === ORDER_STATUS_CODES.IN_TRANSIT) return ['Đang giao']
  if (code === ORDER_STATUS_CODES.SHIPPING) return ['Hoàn thành']
  return []
}

export function getNextOrderStatusLabel(order = {}) {
  return getOrderStatusOptions(order)[0] || ''
}

export function canUpdateOrderStatus(order = {}) {
  return getOrderStatusOptions(order).length > 0
}

export function canEditOrderTrackingCode(order = {}, nextStatusLabel = '') {
  return normalizeOrderStatusCode(order) !== ORDER_STATUS_CODES.DELIVERED
    && nextStatusLabel === 'Đang giao'
}

export function applyOrderStatusMapping(order = {}) {
  return {
    ...order,
    rawStatus: order.rawStatus || order.status || ORDER_STATUS_CODES.UNPAID,
    status: normalizeOrderUiStatus(order),
    statusLabel: getOrderStatusLabel(order),
  }
}
