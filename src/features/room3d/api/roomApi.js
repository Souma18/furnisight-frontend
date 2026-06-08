import { apiClient } from '@shared/lib/api/client'
import { ROOM_TEMPLATES } from '../core/mockData'

/** Map nhan backend (label) -> type trong ROOM_TEMPLATES */
const LABEL_TO_ROOM_TYPE = {
  bedroom: 'bedroom',
  living: 'living',
  'living room': 'living',
  dining: 'dining',
  'dining room': 'dining',
  office: 'office',
  'home office': 'office',
}

function normalizeRecommendation(item = {}) {
  const product = item.product && typeof item.product === 'object' ? item.product : {}
  const variants = Array.isArray(item.variants)
    ? item.variants
    : Array.isArray(product.variants)
      ? product.variants
      : []
  const primaryVariant = variants[0] ?? null
  const id = item.productId ?? item.id ?? product.id ?? ''
  const variantId = item.variantId ?? item.defaultVariantId ?? primaryVariant?.id ?? null
  const price = resolveProductPrice(item, product, primaryVariant)

  return {
    ...item,
    id,
    productId: id,
    variantId,
    detailId: item.detailId ?? item.slug ?? product.slug ?? id,
    slug: item.slug ?? product.slug ?? '',
    name: item.name ?? product.name ?? '',
    categoryName: resolveCategoryName(item, product),
    price,
    oldPrice: resolveFirstNumber(
      item.oldPrice,
      item.originalPrice,
      item.compareAtPrice,
      item.listPrice,
      product.oldPrice,
      product.originalPrice,
      primaryVariant?.oldPrice,
    ),
    image: resolveProductImage(item, product),
    imageUrl: resolveProductImage(item, product),
    rating: resolveFirstNumber(item.rating, product.rating) ?? 0,
    ratingCount: resolveFirstNumber(item.ratingCount, product.ratingCount) ?? 0,
    soldCount: resolveFirstNumber(item.soldCount, item.soldQuantity, item.sold, product.soldCount) ?? 0,
    tags: normalizeStringArray(item.tags ?? product.tags),
    modelUrl: item.modelUrl ?? item.model3dUrl ?? item.glbUrl ?? product.modelUrl ?? '',
    roomTypes: normalizeStringArray(item.roomTypes ?? item.roomTypeHints ?? product.roomTypes),
    variants,
  }
}

function resolveProductPrice(item = {}, product = {}, primaryVariant = null) {
  return resolveFirstNumber(
    item.price,
    item.salePrice,
    item.sellingPrice,
    item.discountedPrice,
    item.currentPrice,
    item.minPrice,
    item.basePrice,
    product.price,
    product.salePrice,
    product.sellingPrice,
    product.minPrice,
    primaryVariant?.price,
  ) ?? 0
}

function resolveFirstNumber(...values) {
  const normalized = values.map(parsePriceNumber).filter((value) => value != null)
  return normalized.find((value) => value > 0) ?? normalized[0] ?? null
}

function parsePriceNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const direct = Number(trimmed.replace(/,/g, ''))
  if (Number.isFinite(direct)) return direct

  const digitsOnly = trimmed.replace(/[^\d]/g, '')
  const parsed = Number(digitsOnly)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveProductImage(item = {}, product = {}) {
  const imageCandidates = [
    item.imageUrl,
    item.productImageUrl,
    item.image,
    item.thumbnail,
    item.thumbnailUrl,
    item.coverImage,
    item.coverImageUrl,
    product.imageUrl,
    product.image,
    product.thumbnail,
    product.thumbnailUrl,
  ]

  for (const gallery of [item.gallery, item.images, product.gallery, product.images]) {
    if (!Array.isArray(gallery)) continue
    imageCandidates.push(...gallery.map((entry) => {
      if (typeof entry === 'string') return entry
      return entry?.url || entry?.imageUrl || entry?.src || ''
    }))
  }

  return imageCandidates.find(Boolean) || ''
}

function resolveCategoryName(item = {}, product = {}) {
  const category = (
    item.categoryName ??
    item.category?.name ??
    item.category?.label ??
    product.categoryName ??
    product.category?.name ??
    product.category?.label ??
    item.category ??
    ''
  )
  return typeof category === 'string' ? category : ''
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export function normalizePredictionResponse(data = {}) {
  const hasConfidence = typeof data.confidence === 'number' && Number.isFinite(data.confidence)
  const hasRecommendations = Array.isArray(data.recommendations)

  return {
    label: typeof data.label === 'string' ? data.label.trim() : '',
    responseType: hasConfidence || hasRecommendations || data.recommendationMeta ? 'full' : 'legacy',
    confidence: hasConfidence ? data.confidence : null,
    recommendations: hasRecommendations ? data.recommendations.map(normalizeRecommendation) : [],
    recommendationMeta: data.recommendationMeta ?? null,
  }
}

/**
 * Chuẩn hóa nhãn nhận diện thành `selectedRoomType` hợp lệ.
 * Nếu không khớp, trả về null để không mượn mô hình của loại phòng khác.
 */
export function mapLabelToRoomType(label) {
  if (!label || typeof label !== 'string') return null
  const key = label.trim().toLowerCase()
  if (ROOM_TEMPLATES.some((r) => r.type === key)) return key
  return LABEL_TO_ROOM_TYPE[key] ?? null
}

function delay(ms = 700) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function analyzeRoomImage() {
  await delay(1500)
  const room = ROOM_TEMPLATES[Math.floor(Math.random() * ROOM_TEMPLATES.length)]
  return { data: room }
}

// Nhận diện loại phòng từ ảnh tải lên.
// Goi qua microservices gateway cua apiClient, url='/ai-classifier/predict'
const CLASSIFY_ENDPOINT = import.meta.env.VITE_ROOM3D_CLASSIFY_URL ?? '/ai-classifier/predict'

/**
 * Goi backend nhan dien: multipart file + image_type.
 * Response: { label: "bedroom", confidence: 0.9231 }
 */
export async function classifyRoomImage(file, imageType = 'normal') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('image_type', imageType)

  const response = await apiClient.post(CLASSIFY_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60_000,
  })

  return normalizePredictionResponse(response.data)
}

// Tạo mô hình 3D từ ảnh tải lên.
// Goi qua microservices gateway cua apiClient, url='/ai-reconstruction/predict'
const PREDICT_ENDPOINT = import.meta.env.VITE_ROOM3D_PREDICT_URL ?? '/ai-reconstruction/predict'

export async function predictRoomModel(file, options = {}) {
  const { imageType = 'normal', meshResolution = 512, meshQuality = 'medium' } = options
  const formData = new FormData()
  formData.append('file', file)
  formData.append('image_type', imageType)
  
  if (imageType === '360') {
    formData.append('mesh_resolution', String(meshResolution))
  } else {
    formData.append('mesh_quality', String(meshQuality))
  }

  // Thay the axios direct bang apiClient, uu tien timeout lon (2 phut) vi sinh 3D lau
  const response = await apiClient.post(PREDICT_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120_000,
  })

  return response.data
}

export async function getRoomTemplates() {
  await delay(350)
  return { data: ROOM_TEMPLATES }
}
