import { PriceFormatter } from '@shared/lib/formatters'

export function formatCheckoutMoney(value) {
  return PriceFormatter.format(value)
}

export function calcLineTotal(line) {
  return (Number(line.price) || 0) * (Number(line.qty) || 0)
}

export function calcShopDiscount(subtotal, voucher) {
  if (!voucher) return 0
  const discountType = String(voucher.discountType || '').toLowerCase()
  if (discountType === 'shipping_cap') return 0
  if (voucher.appliedDiscount != null) return Math.max(0, Number(voucher.appliedDiscount) || 0)

  if (discountType === 'percent') {
    const raw = Math.round(subtotal * (Number(voucher.discountValue) / 100))
    const cap = Number(voucher.maxDiscount) || raw
    return Math.min(raw, cap)
  }

  if (discountType === 'fixed') {
    return Number(voucher.discountValue) || 0
  }

  return 0
}

export function calcShippingDiscount(shipFee, voucher) {
  if (!voucher || !shipFee) return 0
  if (voucher.appliedDiscount != null) return Math.min(shipFee, Math.max(0, Number(voucher.appliedDiscount) || 0))
  const discountType = String(voucher.discountType || '').toLowerCase()
  if (discountType === 'shipping_cap' || discountType === 'fixed') {
    return Math.min(shipFee, Number(voucher.discountValue) || shipFee)
  }
  if (discountType === 'percent') {
    const raw = Math.round(shipFee * (Number(voucher.discountValue) / 100))
    const cap = Number(voucher.maxDiscount) || raw
    return Math.min(shipFee, Math.min(raw, cap))
  }
  return 0
}

export function buildCheckoutSummary({
  lines = [],
  shipFee = 0,
  shopVoucher = null,
  shippingVoucher = null,
  combo = null,
  hasInsurance = false,
  insurancePrice = 0,
}) {
  const subtotal = lines.reduce((sum, line) => sum + calcLineTotal(line), 0)
  const insuranceAmount = hasInsurance ? Number(insurancePrice) || 0 : 0
  const merchandiseSubtotal = subtotal + insuranceAmount
  const shopDiscount = calcShopDiscount(merchandiseSubtotal, shopVoucher)
  const shippingDiscount = calcShippingDiscount(shipFee, shippingVoucher)
  const comboDiscount = Math.min(
    merchandiseSubtotal,
    Math.max(0, Number(combo?.appliedDiscount ?? combo?.comboDiscount ?? combo?.savedAmount) || 0),
  )
  const total = Math.max(0, merchandiseSubtotal + shipFee - comboDiscount - shopDiscount - shippingDiscount)
  const itemQty = lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0)

  return {
    subtotal: merchandiseSubtotal,
    voucherSubtotal: subtotal,
    shipFee,
    comboDiscount,
    shopDiscount,
    shippingDiscount,
    insuranceAmount,
    total,
    itemQty,
    saved: Math.max(0, shopDiscount + shippingDiscount),
  }
}
