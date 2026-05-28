import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ordersApi } from '@shared/lib/api/services'
import { buildCheckoutSummary } from '../utils/checkoutPricing'

const PENDING_PAYMENT_KEY = 'luxnest-pending-payment'

function readPendingPayment() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(PENDING_PAYMENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writePendingPayment(payload) {
  if (typeof window === 'undefined') return

  if (!payload) {
    window.sessionStorage.removeItem(PENDING_PAYMENT_KEY)
    return
  }

  window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payload))
}

function formatVoucherExpire(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return `HSD: ${new Intl.DateTimeFormat('vi-VN').format(date)}`
}

function normalizeDiscountType(type) {
  const normalized = String(type || '').trim().toUpperCase()
  const map = {
    PERCENT: 'percent',
    FIXED: 'fixed',
    SHIPPING_CAP: 'shipping_cap',
  }

  return map[normalized] || String(type || '').toLowerCase()
}

function normalizeVoucher(raw = {}) {
  const discountType = normalizeDiscountType(raw.discountType)
  const iconMap = {
    percent: 'badgePercent',
    ticket: 'badgePercent',
    truck: 'truck',
    star: 'star',
    gift: 'gift',
  }

  return {
    ...raw,
    id: raw.id || raw.code,
    code: raw.code || '',
    name: raw.name || raw.code || 'Voucher',
    desc: raw.desc || raw.description || '',
    expire: raw.expire || formatVoucherExpire(raw.endDate),
    discountType,
    discountValue: Number(raw.discountValue) || 0,
    maxDiscount: raw.maxDiscount ?? null,
    minOrder: raw.minOrder ?? null,
    icon: iconMap[raw.icon] || (discountType === 'shipping_cap' ? 'truck' : 'badgePercent'),
  }
}

export const useCheckoutStore = defineStore('checkout', () => {
  const loading = ref(false)
  const placing = ref(false)
  const hydrated = ref(false)

  const shippingOptions = ref([])
  const paymentMethods = ref([])
  const shopVouchers = ref([])
  const shippingVouchers = ref([])
  const insuranceOption = ref(null)
  const codNote = ref('')

  const selectedShippingId = ref('')
  const selectedPaymentId = ref('vnpay')
  const sellerNote = ref('')
  const hasInsurance = ref(false)
  const agreedTerms = ref(true)

  const shopVoucher = ref(null)
  const shippingVoucher = ref(null)

  const lastOrder = ref(null)
  const pendingPayment = ref(readPendingPayment())

  const selectedShipping = computed(
    () => shippingOptions.value.find((item) => item.id === selectedShippingId.value) ?? null,
  )

  const shipFee = computed(() => {
    const fee = Number(selectedShipping.value?.fee) || 0
    return selectedShipping.value?.isFree ? 0 : fee
  })

  async function hydrateSession() {
    if (hydrated.value) return
    loading.value = true

    try {
      // The backend currently does not implement /checkout/session, so we mock it.
      shippingOptions.value = [
        { id: 'standard', name: 'Giao hàng tiêu chuẩn', fee: 30000, estimatedDays: '3-5 ngày', isFree: false },
        { id: 'express', name: 'Giao hàng hỏa tốc', fee: 50000, estimatedDays: '1-2 ngày', isFree: false }
      ]
      paymentMethods.value = [
        { id: 'vnpay', name: 'Thanh toán qua VNPAY', description: 'Thanh toán an toàn qua ví VNPAY', icon: 'vnpay' },
        { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', description: 'Thanh toán tiền mặt khi nhận hàng', icon: 'cash' }
      ]
      const voucherResponse = await ordersApi.getVouchers().catch(() => ({ data: [] }))
      const vouchers = Array.isArray(voucherResponse?.data)
        ? voucherResponse.data.map(normalizeVoucher).filter((voucher) => voucher.active !== false)
        : []

      shopVouchers.value = vouchers.filter((voucher) => voucher.discountType !== 'shipping_cap')
      shippingVouchers.value = vouchers.filter((voucher) => voucher.discountType === 'shipping_cap')
      insuranceOption.value = { price: 20000, label: 'Bảo hiểm hàng hóa (Bồi thường 100% nếu thất lạc/hư hỏng)' }
      codNote.value = 'Quý khách vui lòng chuẩn bị số tiền tương ứng khi nhận hàng.'

      selectedShippingId.value = 'standard'
      selectedPaymentId.value = 'vnpay'
      shippingVoucher.value = null

      hydrated.value = true
    } finally {
      loading.value = false
    }
  }

  function buildSummary(lines) {
    return buildCheckoutSummary({
      lines,
      shipFee: shipFee.value,
      shopVoucher: shopVoucher.value,
      shippingVoucher: shippingVoucher.value,
      hasInsurance: hasInsurance.value,
      insurancePrice: insuranceOption.value?.price ?? 0,
    })
  }

  async function applyVoucherByCode(code, type, subtotal) {
    const response = await ordersApi.validateCheckoutVoucher({ code, type, subtotal })
    const data = response?.data ?? {}

    if (!data.valid) {
      return { ok: false, message: data.message ?? 'Mã không hợp lệ.' }
    }

    if (type === 'ship') {
      shippingVoucher.value = normalizeVoucher(data.voucher)
    } else {
      shopVoucher.value = normalizeVoucher(data.voucher)
    }

    return { ok: true, voucher: normalizeVoucher(data.voucher), discount: data.discount ?? 0 }
  }

  function applyVoucher(voucher, type = 'shop') {
    if (!voucher) return
    const normalizedVoucher = normalizeVoucher(voucher)
    if (type === 'ship') shippingVoucher.value = normalizedVoucher
    else shopVoucher.value = normalizedVoucher
  }

  function removeVoucher(type = 'shop') {
    if (type === 'ship') shippingVoucher.value = null
    else shopVoucher.value = null
  }

  async function placeOrder(payload) {
    placing.value = true
    try {
      const response = await ordersApi.createOrder(payload)
      lastOrder.value = response?.data ?? null
      return lastOrder.value
    } finally {
      placing.value = false
    }
  }

  async function createVnpayPaymentAction(payload) {
    try {
      const response = await ordersApi.createVnpayPayment(payload)
      const ok = response?.status === 200
      const data = response?.data
      return {
        ok,
        status: response?.status ?? 500,
        paymentUrl: typeof data === 'string' ? data : data?.paymentUrl ?? '',
        transactionRef: data?.transactionRef ?? '',
        message: data?.message ?? '',
      }
    } catch (error) {
      return {
        ok: false,
        status: error?.response?.status ?? 500,
        paymentUrl: '',
        transactionRef: '',
        message: error?.response?.data?.message || error.message || 'Không thể khởi tạo VNPAY.',
      }
    }
  }

  function resetCheckoutState() {
    shopVoucher.value = null
    shippingVoucher.value = null
    sellerNote.value = ''
    hasInsurance.value = false
    agreedTerms.value = true
    lastOrder.value = null
  }

  function rememberPendingPayment(payload = {}) {
    const next = {
      paymentMethod: payload.paymentMethod || selectedPaymentId.value,
      orderCode: payload.orderCode || '',
      orderId: payload.orderId || '',
      lineIds: Array.isArray(payload.lineIds) ? payload.lineIds : [],
      createdAt: Date.now(),
    }

    pendingPayment.value = next
    writePendingPayment(next)
    return next
  }

  function clearPendingPayment() {
    pendingPayment.value = null
    writePendingPayment(null)
  }

  return {
    loading,
    placing,
    hydrated,
    shippingOptions,
    paymentMethods,
    shopVouchers,
    shippingVouchers,
    insuranceOption,
    codNote,
    selectedShippingId,
    selectedPaymentId,
    sellerNote,
    hasInsurance,
    agreedTerms,
    shopVoucher,
    shippingVoucher,
    lastOrder,
    pendingPayment,
    selectedShipping,
    shipFee,
    hydrateSession,
    buildSummary,
    applyVoucherByCode,
    applyVoucher,
    removeVoucher,
    placeOrder,
    createVnpayPayment: createVnpayPaymentAction,
    rememberPendingPayment,
    clearPendingPayment,
    resetCheckoutState,
  }
})
