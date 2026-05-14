import { PRODUCT_LIST_MOCK_ITEMS } from '@features/product/mock/productListMockData'
import { productDetailMap } from '@features/product/mock/productDetailMockData'
import { PRODUCTS_3D } from '@features/room3d/core/mockData'

const listByDetailId = new Map(
  PRODUCT_LIST_MOCK_ITEMS.filter((item) => item.detailId).map((item) => [item.detailId, item]),
)
const listById = new Map(PRODUCT_LIST_MOCK_ITEMS.map((item) => [item.id, item]))
const room3dById = new Map(PRODUCTS_3D.map((item) => [item.id, item]))

const DETAIL_TO_ROOM3D_PRODUCT_ID = {
  'ergonomic-chair': 1,
  'agape-bed': 2,
  'nordic-sofa': 3,
}

const ROOM3D_ID_TO_DETAIL_ID = Object.fromEntries(
  Object.entries(DETAIL_TO_ROOM3D_PRODUCT_ID).map(([detailId, room3dId]) => [room3dId, detailId]),
)

const ROOM3D_CATEGORY_LABELS = {
  chair: 'Ghế',
  bed: 'Giường ngủ',
  sofa: 'Sofa',
  table: 'Bàn',
  shelf: 'Kệ',
}

function createLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeLineId(candidate) {
  if (typeof candidate === 'string' && (candidate.startsWith('cart-') || candidate.startsWith('line-'))) {
    return candidate
  }

  return createLineId()
}

function resolveDetailId(input, room3dProductId) {
  if (typeof input?.detailId === 'string' && input.detailId) return input.detailId
  if (typeof input?.productId === 'string' && productDetailMap[input.productId]) return input.productId
  if (Number.isFinite(room3dProductId) && ROOM3D_ID_TO_DETAIL_ID[room3dProductId]) {
    return ROOM3D_ID_TO_DETAIL_ID[room3dProductId]
  }

  return null
}

function resolveRoom3dProductId(input, detailId) {
  if (Number.isFinite(input?.room3dProductId)) return input.room3dProductId
  if (Number.isFinite(input?.id) && room3dById.has(input.id)) return input.id
  if (typeof detailId === 'string' && Number.isFinite(DETAIL_TO_ROOM3D_PRODUCT_ID[detailId])) {
    return DETAIL_TO_ROOM3D_PRODUCT_ID[detailId]
  }

  return null
}

function resolveProductKey(input, detailId, room3dProductId) {
  if (typeof input?.productKey === 'string' && input.productKey) return input.productKey
  if (typeof detailId === 'string' && detailId) return detailId
  if (Number.isFinite(room3dProductId)) return `room3d:${room3dProductId}`
  if (typeof input?.productId === 'string' && input.productId) return input.productId
  if (typeof input?.productId === 'number' && Number.isFinite(input.productId)) return `id:${input.productId}`
  if (
    typeof input?.id === 'string' &&
    input.id &&
    !input.id.startsWith('cart-') &&
    !input.id.startsWith('line-') &&
    !input.id.startsWith('wish-')
  ) {
    return input.id
  }
  if (typeof input?.id === 'number' && Number.isFinite(input.id)) return `id:${input.id}`

  return createLineId()
}

function resolveCategoryLabel(input, detail, listItem, room3dProduct) {
  if (typeof input?.categoryLabel === 'string' && input.categoryLabel) return input.categoryLabel

  const breadcrumb = detail?.breadcrumb ?? []
  if (breadcrumb.length > 0) return breadcrumb[breadcrumb.length - 1]
  if (typeof listItem?.category === 'string' && listItem.category) return listItem.category
  if (typeof input?.category === 'string' && input.category) {
    return ROOM3D_CATEGORY_LABELS[input.category] ?? input.category
  }
  if (typeof room3dProduct?.category === 'string' && room3dProduct.category) {
    return ROOM3D_CATEGORY_LABELS[room3dProduct.category] ?? room3dProduct.category
  }

  return 'Sản phẩm'
}

function cloneOptions(options, fallback) {
  return Array.isArray(options) && options.length > 0 ? [...options] : [...fallback]
}

export function buildCartLine(input = {}, overrides = {}) {
  const room3dProductId = resolveRoom3dProductId(input, input.detailId)
  const detailId = resolveDetailId(input, room3dProductId)
  const listItem =
    (detailId ? listByDetailId.get(detailId) : null) ||
    (typeof input?.id === 'string' ? listById.get(input.id) : null) ||
    null
  const detail = detailId ? productDetailMap[detailId] ?? null : null
  const room3dProduct = Number.isFinite(room3dProductId) ? room3dById.get(room3dProductId) ?? null : null

  const defaultColors = cloneOptions(input.colors, detail?.colors ?? ['Mặc định'])
  const defaultSizes = cloneOptions(
    input.sizes,
    detail?.sizes ?? [room3dProduct ? 'Tiêu chuẩn' : 'Mặc định'],
  )

  return {
    id: normalizeLineId(input.id),
    productKey: resolveProductKey(input, detailId, room3dProductId),
    productId: detailId ?? input.productId ?? input.id ?? null,
    detailId,
    room3dProductId,
    name: input.name ?? detail?.name ?? listItem?.name ?? room3dProduct?.name ?? 'Sản phẩm',
    categoryLabel: resolveCategoryLabel(input, detail, listItem, room3dProduct),
    imageFallback: input.imageFallback ?? listItem?.imageFallback ?? room3dProduct?.emoji ?? '🛍️',
    emoji: input.emoji ?? input.imageFallback ?? listItem?.imageFallback ?? room3dProduct?.emoji ?? '🛍️',
    price: Number(input.price ?? listItem?.price ?? room3dProduct?.price ?? 0),
    oldPrice: input.oldPrice ?? listItem?.oldPrice ?? null,
    qty: Math.max(1, Number(input.qty ?? 1) || 1),
    colors: defaultColors,
    sizes: defaultSizes,
    selectedColor: input.selectedColor ?? defaultColors[0] ?? '',
    selectedSize:
      input.selectedSize ??
      defaultSizes[Math.min(1, Math.max(defaultSizes.length - 1, 0))] ??
      '',
    outOfStock: Boolean(input.outOfStock),
  }
}

export function cloneCartLine(line) {
  return {
    ...line,
    colors: Array.isArray(line.colors) ? [...line.colors] : [],
    sizes: Array.isArray(line.sizes) ? [...line.sizes] : [],
  }
}
