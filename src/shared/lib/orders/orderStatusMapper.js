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
  unpaid: 'Đã đặt đơn',
  payment_failed: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  in_transit: 'Đang vận chuyển',
  delivering: 'Đang giao',
  done: 'Đã nhận',
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
  [ORDER_STATUS_CODES.PAYMENT_FAILED]: 'payment_failed',
  [ORDER_STATUS_CODES.PAID]: 'paid',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'in_transit',
  [ORDER_STATUS_CODES.SHIPPING]: 'delivering',
  [ORDER_STATUS_CODES.DELIVERED]: 'done',
  [ORDER_STATUS_CODES.CANCELLED]: 'cancel',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'refund_pending',
  [ORDER_STATUS_CODES.REFUNDED]: 'refunded',
})

const COD_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS_CODES.UNPAID]: 'Đã đặt đơn',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'Đang vận chuyển',
  [ORDER_STATUS_CODES.SHIPPING]: 'Đang giao',
  [ORDER_STATUS_CODES.DELIVERED]: 'Đã nhận',
  [ORDER_STATUS_CODES.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'Chờ hoàn tiền',
  [ORDER_STATUS_CODES.REFUNDED]: 'Đã hoàn tiền',
})

const ONLINE_PAYMENT_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS_CODES.UNPAID]: 'Đã đặt đơn',
  [ORDER_STATUS_CODES.PAYMENT_FAILED]: 'Chưa thanh toán',
  [ORDER_STATUS_CODES.PAID]: 'Đã thanh toán',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'Đang vận chuyển',
  [ORDER_STATUS_CODES.SHIPPING]: 'Đang giao',
  [ORDER_STATUS_CODES.DELIVERED]: 'Đã nhận',
  [ORDER_STATUS_CODES.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'Chờ hoàn tiền',
  [ORDER_STATUS_CODES.REFUNDED]: 'Đã hoàn tiền',
})

export const ORDER_STATUS_LABEL_TO_API = Object.freeze({
  'Đang vận chuyển': ORDER_STATUS_CODES.IN_TRANSIT,
  'Đang giao': ORDER_STATUS_CODES.SHIPPING,
  'Đã nhận': ORDER_STATUS_CODES.DELIVERED,
  'Hoàn thành': ORDER_STATUS_CODES.DELIVERED,
  'Đã giao': ORDER_STATUS_CODES.DELIVERED,
  'Đã hủy': ORDER_STATUS_CODES.CANCELLED,
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
  const paymentType = normalizePaymentType(orderOrPaymentType)
  return paymentType === 'cod'
    || paymentType === 'cash_on_delivery'
    || paymentType === 'cash-on-delivery'
    || paymentType === 'cashondelivery'
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
  const options = []

  if (code === ORDER_STATUS_CODES.REFUND_PENDING) return ['Đã hoàn tiền']

  if (isCodPayment(order)) {
    if (code === ORDER_STATUS_CODES.UNPAID) options.push('Đang vận chuyển')
    if (code === ORDER_STATUS_CODES.IN_TRANSIT) options.push('Đang giao')
    if (code === ORDER_STATUS_CODES.SHIPPING) options.push('Đã nhận')
    if (canCancelOrder(order)) options.push('Đã hủy')
    return options
  }

  if (code === ORDER_STATUS_CODES.UNPAID || code === ORDER_STATUS_CODES.PAYMENT_FAILED || code === ORDER_STATUS_CODES.PAID) {
    options.push('Đang vận chuyển')
  }
  if (code === ORDER_STATUS_CODES.IN_TRANSIT) options.push('Đang giao')
  if (code === ORDER_STATUS_CODES.SHIPPING) options.push('Đã nhận')
  if (canCancelOrder(order)) options.push('Đã hủy')
  return options
}

export function getNextOrderStatusLabel(order = {}) {
  return getOrderStatusOptions(order)[0] || ''
}

export function canUpdateOrderStatus(order = {}) {
  return getOrderStatusOptions(order).length > 0
}

export function canCancelOrder(order = {}) {
  const code = normalizeOrderStatusCode(order)
  return [
    ORDER_STATUS_CODES.UNPAID,
    ORDER_STATUS_CODES.PAYMENT_FAILED,
    ORDER_STATUS_CODES.CONFIRMED,
    ORDER_STATUS_CODES.PAID,
    ORDER_STATUS_CODES.IN_TRANSIT,
  ].includes(code)
}

export function canEditOrderTrackingCode(order = {}, nextStatusLabel = '') {
  return normalizeOrderStatusCode(order) !== ORDER_STATUS_CODES.DELIVERED
    && nextStatusLabel === 'Đang vận chuyển'
}

export function applyOrderStatusMapping(order = {}) {
  return {
    ...order,
    rawStatus: order.rawStatus || order.status || ORDER_STATUS_CODES.UNPAID,
    status: normalizeOrderUiStatus(order),
    statusLabel: getOrderStatusLabel(order),
  }
}
