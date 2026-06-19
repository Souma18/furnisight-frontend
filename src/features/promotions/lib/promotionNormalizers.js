import { imageLikeUrl } from './comboProductImages'
import { comboStockIssue } from './comboStock'
import { i18n } from '@shared/i18n'

function t(key) {
  return i18n.global.t(key)
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function normalizeVoucher(raw = {}) {
  return {
    ...raw,
    id: raw.id || raw.code,
    code: raw.code || '',
    name: raw.name || raw.code || 'Voucher',
    description: raw.description || raw.desc || '',
    discountType: String(raw.discountType || '').toUpperCase(),
    discountValue: Number(raw.discountValue) || 0,
    maxDiscount: raw.maxDiscount ?? null,
    minOrder: raw.minOrder ?? null,
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
    voucherType: raw.voucherType || raw.type || '',
    active: raw.active !== false,
    saved: Boolean(raw.saved),
    used: Boolean(raw.used),
  }
}

export function normalizeCombo(raw = {}) {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => ({
        ...item,
        imageUrl: imageLikeUrl(item.imageUrl)
          ? item.imageUrl
          : imageLikeUrl(item.image)
            ? item.image
            : '',
        stockQuantity: item.stockQuantity ?? item.stock ?? item.availableStock ?? null,
        outOfStock: Boolean(item.outOfStock),
      }))
    : []
  const normalized = {
    ...raw,
    id: raw.id,
    name: raw.name || t('promotions.combo.defaultName'),
    description: raw.description || '',
    imageUrl: raw.imageUrl || '',
    items,
    itemCount: raw.itemCount ?? items.length,
    originalAmount: Number(raw.originalAmount) || 0,
    finalAmount: Number(raw.finalAmount) || 0,
    savedAmount: Number(raw.savedAmount) || 0,
    roomLabel: items[0]?.categoryName || t('promotions.combo.defaultRoom'),
  }

  return {
    ...normalized,
    stockIssue: comboStockIssue(normalized),
  }
}
