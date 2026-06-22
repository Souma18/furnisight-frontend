import { ordersApi, promotionsApi } from '@shared/lib/api/services'
import { normalizeCheckoutCombo, normalizeCheckoutVoucher } from '../lib/checkoutNormalizers'
import { comboMatchesLines, comboValidateItems } from '../lib/checkoutComboMatching'

export function useCheckoutSession(checkoutStore) {
  async function refreshVouchers() {
    const voucherResponse = await ordersApi.getVouchers().catch(() => ({ data: [] }))
    const vouchers = Array.isArray(voucherResponse?.data)
      ? voucherResponse.data.map(normalizeCheckoutVoucher).filter((voucher) => voucher.active !== false)
      : []

    checkoutStore.shopVouchers = vouchers.filter((voucher) => voucher.discountType !== 'shipping_cap')
    checkoutStore.shippingVouchers = vouchers.filter((voucher) => voucher.discountType === 'shipping_cap')
  }

  async function hydrateSession(options = {}) {
    const { loadCombos = true } = options
    if (checkoutStore.hydrated && (!loadCombos || checkoutStore.combosHydrated)) {
      await refreshVouchers()
      return
    }
    checkoutStore.loading = true

    try {
      // The backend currently does not implement /checkout/session, so we mock it.
      checkoutStore.shippingOptions = [
        { id: 'standard', name: 'Giao hàng tiêu chuẩn', fee: 30000, estimatedDays: '3-5 ngày', isFree: false },
        { id: 'express', name: 'Giao hàng hỏa tốc', fee: 50000, estimatedDays: '1-2 ngày', isFree: false },
      ]
      checkoutStore.paymentMethods = [
        { id: 'vnpay', name: 'Thanh toán qua VNPAY', description: 'Thanh toán an toàn qua ví VNPAY', icon: 'vnpay' },
        { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', description: 'Thanh toán tiền mặt khi nhận hàng', icon: 'cash' },
      ]
      await refreshVouchers()
      if (loadCombos) {
        const allCombos = []
        let page = 0
        let totalPages = 1
        while (page < totalPages) {
          const comboResponse = await ordersApi.getActiveCombos({ page }).catch(() => ({ data: { items: [] } }))
          const payload = comboResponse?.data ?? {}
          allCombos.push(...(Array.isArray(payload) ? payload : payload.items ?? []))
          totalPages = Math.max(1, Number(payload.totalPages) || 1)
          page += 1
        }
        checkoutStore.activeCombos = allCombos.map(normalizeCheckoutCombo).filter((combo) => combo.active !== false && combo.available !== false)
        checkoutStore.combosHydrated = true
      } else {
        checkoutStore.activeCombos = []
        checkoutStore.combosHydrated = false
      }
      checkoutStore.insuranceOption = { price: 20000, label: 'Bảo hiểm hàng hóa (Bồi thường 100% nếu thất lạc/hư hỏng)' }
      checkoutStore.codNote = 'Quý khách vui lòng chuẩn bị số tiền tương ứng khi nhận hàng.'

      checkoutStore.selectedShippingId = 'standard'
      checkoutStore.selectedPaymentId = 'vnpay'
      checkoutStore.shopVoucher = null
      checkoutStore.shippingVoucher = null

      checkoutStore.hydrated = true
    } finally {
      checkoutStore.loading = false
    }
  }

  async function refreshApplicableCombo(lines = []) {
    checkoutStore.comboMessage = ''
    checkoutStore.selectedCombo = null
    if (!checkoutStore.activeCombos.length || !Array.isArray(lines) || !lines.length) return null

    const candidates = checkoutStore.activeCombos
      .filter((combo) => comboMatchesLines(combo, lines))
      .sort((a, b) => Number(b.savedAmount || b.appliedDiscount || 0) - Number(a.savedAmount || a.appliedDiscount || 0))

    if (!candidates.length) return null

    for (const combo of candidates) {
      try {
        const response = await ordersApi.validateCheckoutCombo({
          comboId: combo.id,
          items: comboValidateItems(lines),
        })
        const data = response?.data ?? {}
        if (data.valid) {
          checkoutStore.selectedCombo = normalizeCheckoutCombo({
            ...combo,
            ...data,
            appliedDiscount: data.comboDiscount ?? combo.savedAmount,
          })
          checkoutStore.comboMessage = data.message || ''
          return checkoutStore.selectedCombo
        }
        checkoutStore.comboMessage = data.message || checkoutStore.comboMessage
      } catch (error) {
        checkoutStore.comboMessage = error?.response?.data?.message || error.message || checkoutStore.comboMessage
      }
    }

    return null
  }

  async function validateRequestedCombo(comboId, lines = []) {
    checkoutStore.comboMessage = ''
    checkoutStore.selectedCombo = null
    if (!comboId || !Array.isArray(lines) || !lines.length) return null

    try {
      const response = await ordersApi.validateCheckoutCombo({
        comboId,
        items: comboValidateItems(lines),
      })
      const data = response?.data ?? {}
      checkoutStore.comboMessage = data.message || ''

      if (!data.valid) return null

      checkoutStore.selectedCombo = normalizeCheckoutCombo({
        ...data,
        id: data.comboId || comboId,
        name: data.comboName,
        appliedDiscount: data.comboDiscount,
      })
      return checkoutStore.selectedCombo
    } catch (error) {
      checkoutStore.comboMessage = error?.response?.data?.message || error.message || 'Không thể xác thực combo.'
      return null
    }
  }

  async function applyVoucherByCode(code, type, subtotal, shippingFee = 0) {
    const response = await ordersApi.validateCheckoutVoucher({ code, type, subtotal, shippingFee })
    const data = response?.data ?? {}

    if (!data.valid) {
      return { ok: false, message: data.message ?? 'Mã không hợp lệ.' }
    }

    const normalized = normalizeCheckoutVoucher({ ...(data.voucher || {}), appliedDiscount: data.discount ?? null })

    if (type === 'ship') {
      checkoutStore.shippingVoucher = normalized
    } else {
      checkoutStore.shopVoucher = normalized
    }

    return { ok: true, voucher: normalized, discount: data.discount ?? 0 }
  }

  async function recommendVouchers(subtotal, shippingFee, preferredVoucherCode = '') {
    const { data = {} } = await promotionsApi.recommendVouchers({
      subtotal,
      shippingFee,
      preferredVoucherCode: preferredVoucherCode || null,
    })
    return {
      shopVoucher: data.shopVoucher
        ? normalizeCheckoutVoucher({ ...data.shopVoucher, appliedDiscount: data.shopDiscount }) : null,
      shippingVoucher: data.shippingVoucher
        ? normalizeCheckoutVoucher({ ...data.shippingVoucher, appliedDiscount: data.shippingDiscount }) : null,
    }
  }

  async function revalidateVouchers({ subtotal, shippingFee, preferredVoucherCode = '' }) {
    if (preferredVoucherCode) {
      const recommended = await recommendVouchers(subtotal, shippingFee, preferredVoucherCode)
      checkoutStore.shopVoucher = recommended.shopVoucher
      checkoutStore.shippingVoucher = recommended.shippingVoucher
      return recommended
    }

    const validateSelected = async (voucher, type) => {
      if (!voucher?.code) return null
      try {
        const response = await ordersApi.validateCheckoutVoucher({
          code: voucher.code, type, subtotal, shippingFee,
        })
        const data = response?.data ?? {}
        return data.valid
          ? normalizeCheckoutVoucher({ ...(data.voucher || voucher), appliedDiscount: data.discount })
          : null
      } catch {
        return null
      }
    }

    const [shop, shipping] = await Promise.all([
      validateSelected(checkoutStore.shopVoucher, 'shop'),
      validateSelected(checkoutStore.shippingVoucher, 'ship'),
    ])
    if (shop && shipping) {
      checkoutStore.shopVoucher = shop
      checkoutStore.shippingVoucher = shipping
      return { shopVoucher: shop, shippingVoucher: shipping }
    }
    const recommended = await recommendVouchers(subtotal, shippingFee)
    checkoutStore.shopVoucher = shop || recommended.shopVoucher
    checkoutStore.shippingVoucher = shipping || recommended.shippingVoucher
    return { shopVoucher: checkoutStore.shopVoucher, shippingVoucher: checkoutStore.shippingVoucher }
  }

  return {
    refreshVouchers,
    hydrateSession,
    refreshApplicableCombo,
    validateRequestedCombo,
    applyVoucherByCode,
    revalidateVouchers,
  }
}
