import { i18n } from '../../i18n'

/**
 * Order Status Flow (matches backend OrderStatus enum exactly):
 *
 * VNPAY:
 *   UNPAID  → PAID | PAYMENT_FAILED | CANCELLED
 *   PAYMENT_FAILED → PAID | CANCELLED
 *   PAID    → SHIPPING | REFUND_PENDING
 *   SHIPPING → IN_TRANSIT | CANCELLED | REFUND_PENDING
 *   IN_TRANSIT → DELIVERED  (customer confirms receipt)
 *   CANCELLED  → REFUND_PENDING  (admin, for paid orders)
 *   REFUND_PENDING → REFUNDED
 *   DELIVERED, REFUNDED → (terminal)
 *
 * COD:
 *   UNPAID  → SHIPPING | CANCELLED
 *   SHIPPING → IN_TRANSIT | CANCELLED
 *   IN_TRANSIT → DELIVERED  (customer confirms receipt)
 *   DELIVERED, CANCELLED → (terminal, no payment/refund steps)
 */

// Canonical status codes matching backend OrderStatus enum exactly
export const ORDER_STATUS_CODES = Object.freeze({
  UNPAID: 'UNPAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAID: 'PAID',
  SHIPPING: 'SHIPPING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  CANCELLED_BY_ADMIN: 'CANCELLED_BY_ADMIN',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
})

// UI key → human label defaults (VNPAY context)
export const ORDER_STATUS_LABELS = Object.freeze({
  all: 'Tất cả',
  unpaid: 'Chờ thanh toán',       // VNPAY default
  unpaid_cod: 'Đã đặt đơn',          // COD: no payment needed
  payment_failed: 'Thanh toán thất bại',
  paid: 'Đã thanh toán',
  shipping: 'Đang vận chuyển',
  in_transit: 'Đang giao',
  delivered: 'Đã nhận',
  cancelled: 'Đã hủy',
  cancelled_by_admin: 'Hủy bởi shop',
  refund_pending: 'Chờ hoàn tiền',
  refunded: 'Đã hoàn tiền',
})

// Raw BE string → canonical code  (handles old/alias values gracefully)
const RAW_STATUS_TO_CODE = Object.freeze({
  UNPAID: ORDER_STATUS_CODES.UNPAID,
  PENDING: ORDER_STATUS_CODES.UNPAID,
  PAYMENT_FAILED: ORDER_STATUS_CODES.PAYMENT_FAILED,
  FAILED: ORDER_STATUS_CODES.PAYMENT_FAILED,
  PAID: ORDER_STATUS_CODES.PAID,
  CONFIRMED: ORDER_STATUS_CODES.PAID, // legacy alias → treat as paid
  SHIPPING: ORDER_STATUS_CODES.SHIPPING,
  IN_TRANSIT: ORDER_STATUS_CODES.IN_TRANSIT,
  DELIVERING: ORDER_STATUS_CODES.IN_TRANSIT,
  DELIVERED: ORDER_STATUS_CODES.DELIVERED,
  DONE: ORDER_STATUS_CODES.DELIVERED,
  SUCCESS: ORDER_STATUS_CODES.DELIVERED,
  CANCELLED: ORDER_STATUS_CODES.CANCELLED,
  CANCELED: ORDER_STATUS_CODES.CANCELLED,
  CANCEL: ORDER_STATUS_CODES.CANCELLED,
  CANCELLED_BY_ADMIN: ORDER_STATUS_CODES.CANCELLED_BY_ADMIN,
  REFUND_PENDING: ORDER_STATUS_CODES.REFUND_PENDING,
  PENDING_REFUND: ORDER_STATUS_CODES.REFUND_PENDING,
  REFUNDED: ORDER_STATUS_CODES.REFUNDED,
})

// Canonical code → UI key (snake_case for i18n lookup)
const STATUS_CODE_TO_UI_KEY = Object.freeze({
  [ORDER_STATUS_CODES.UNPAID]: 'unpaid',
  [ORDER_STATUS_CODES.PAYMENT_FAILED]: 'payment_failed',
  [ORDER_STATUS_CODES.PAID]: 'paid',
  [ORDER_STATUS_CODES.SHIPPING]: 'shipping',
  [ORDER_STATUS_CODES.IN_TRANSIT]: 'in_transit',
  [ORDER_STATUS_CODES.DELIVERED]: 'delivered',
  [ORDER_STATUS_CODES.CANCELLED]: 'cancelled',
  [ORDER_STATUS_CODES.CANCELLED_BY_ADMIN]: 'cancelled_by_admin',
  [ORDER_STATUS_CODES.REFUND_PENDING]: 'refund_pending',
  [ORDER_STATUS_CODES.REFUNDED]: 'refunded',
})

// Admin action label → BE enum value (for updateOrder API)
export const ORDER_STATUS_LABEL_TO_API = Object.freeze({
  'Đang vận chuyển': ORDER_STATUS_CODES.SHIPPING,
  'Đang giao': ORDER_STATUS_CODES.IN_TRANSIT,
  'Đã hủy': ORDER_STATUS_CODES.CANCELLED,
  'Hủy bởi shop': ORDER_STATUS_CODES.CANCELLED_BY_ADMIN,
  'Chờ hoàn tiền': ORDER_STATUS_CODES.REFUND_PENDING,
  'Đã hoàn tiền': ORDER_STATUS_CODES.REFUNDED,
})

// ─── Normalizers ──────────────────────────────────────────────────────────────

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

export function normalizeOrderUiStatus(orderOrStatus = '') {
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

// ─── Label Helpers ────────────────────────────────────────────────────────────

/**
 * Returns the human-readable status label for an order.
 * UNPAID is payment-method-aware:
 *   - COD  → "Đã đặt đơn"  (no online payment required)
 *   - VNPAY → "Chờ thanh toán"
 */
export function getOrderStatusLabel(orderOrStatus = '') {
  const code = normalizeOrderStatusCode(orderOrStatus)
  const uiKey = STATUS_CODE_TO_UI_KEY[code]
  
  let resultKey = uiKey
  if (code === ORDER_STATUS_CODES.UNPAID && typeof orderOrStatus === 'object') {
    resultKey = isCodPayment(orderOrStatus) ? 'unpaid_cod' : 'unpaid'
  }
  
  if (i18n && i18n.global && i18n.global.te(`orders.status.${resultKey}`)) {
    return i18n.global.t(`orders.status.${resultKey}`)
  }
  
  return ORDER_STATUS_LABELS[resultKey] || resultKey || String(orderOrStatus || '')
}

export function getOrderStatusApiValue(label) {
  return ORDER_STATUS_LABEL_TO_API[label] || ''
}

// ─── Admin Status Transition Options ─────────────────────────────────────────
/**
 * Returns list of human-readable next-status options for admin.
 * Mirrors backend handler allowedTargets() exactly for each status.
 */
export function getOrderStatusOptions(order = {}) {
  const code = normalizeOrderStatusCode(order)
  const cod = isCodPayment(order)

  // Terminal or user-only transitions
  if ([ORDER_STATUS_CODES.DELIVERED, ORDER_STATUS_CODES.REFUNDED, ORDER_STATUS_CODES.CANCELLED, ORDER_STATUS_CODES.CANCELLED_BY_ADMIN].includes(code)) {
    return []
  }

  if (code === ORDER_STATUS_CODES.REFUND_PENDING) return ['Đã hoàn tiền']

  const options = []

  if (cod) {
    // COD: no payment, no refund
    if (code === ORDER_STATUS_CODES.UNPAID) options.push('Đang vận chuyển')
    if (code === ORDER_STATUS_CODES.SHIPPING) options.push('Đang giao')
    if ([ORDER_STATUS_CODES.UNPAID, ORDER_STATUS_CODES.SHIPPING, ORDER_STATUS_CODES.IN_TRANSIT].includes(code)) options.push('Hủy bởi shop')
  } else {
    // VNPAY
    if ([ORDER_STATUS_CODES.UNPAID, ORDER_STATUS_CODES.PAYMENT_FAILED, ORDER_STATUS_CODES.PAID].includes(code)) {
      options.push('Đang vận chuyển')
    }
    if (code === ORDER_STATUS_CODES.SHIPPING) options.push('Đang giao')
    if ([ORDER_STATUS_CODES.UNPAID, ORDER_STATUS_CODES.PAYMENT_FAILED, ORDER_STATUS_CODES.PAID, ORDER_STATUS_CODES.SHIPPING, ORDER_STATUS_CODES.IN_TRANSIT].includes(code)) {
      options.push('Hủy bởi shop')
    }
    if ([ORDER_STATUS_CODES.SHIPPING, ORDER_STATUS_CODES.IN_TRANSIT].includes(code)) {
      options.push('Chờ hoàn tiền')
    }
  }

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
  const cod = isCodPayment(order)
  if (cod) return [ORDER_STATUS_CODES.UNPAID, ORDER_STATUS_CODES.SHIPPING, ORDER_STATUS_CODES.IN_TRANSIT].includes(code)
  return [ORDER_STATUS_CODES.UNPAID, ORDER_STATUS_CODES.PAYMENT_FAILED, ORDER_STATUS_CODES.PAID, ORDER_STATUS_CODES.SHIPPING, ORDER_STATUS_CODES.IN_TRANSIT].includes(code)
}

export function canEditOrderTrackingCode(order = {}, nextStatusLabel = '') {
  return nextStatusLabel === 'Đang vận chuyển'
}

export function applyOrderStatusMapping(order = {}) {
  return {
    ...order,
    rawStatus: order.rawStatus || order.status || ORDER_STATUS_CODES.UNPAID,
    status: normalizeOrderUiStatus(order),
    statusLabel: getOrderStatusLabel(order),
  }
}
