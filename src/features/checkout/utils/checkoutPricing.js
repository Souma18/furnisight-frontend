export function formatCheckoutMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

export function calcLineTotal(line) {
  return (Number(line.price) || 0) * (Number(line.qty) || 0)
}

export function calcShopDiscount(subtotal, voucher) {
  if (!voucher) return 0
  if (voucher.appliedDiscount != null) return Math.max(0, Number(voucher.appliedDiscount) || 0)
  const discountType = String(voucher.discountType || '').toLowerCase()

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
  if (discountType === 'shipping_cap') {
    return Math.min(shipFee, Number(voucher.discountValue) || shipFee)
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

  const originalTotal = lines.reduce((sum, line) => {
    const unitOld = Number(line.oldPrice) || Number(line.price) || 0
    return sum + unitOld * (Number(line.qty) || 0)
  }, 0)
  const saved = Math.max(0, originalTotal + shipFee - total)

  return {
    subtotal: merchandiseSubtotal,
    shipFee,
    comboDiscount,
    shopDiscount,
    shippingDiscount,
    insuranceAmount,
    total,
    itemQty,
    saved,
  }
}
