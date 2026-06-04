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
  return {
    id: item.id ?? item.productId ?? '',
    slug: item.slug ?? '',
    name: item.name ?? '',
    categoryName: item.categoryName ?? item.category?.name ?? '',
    price: Number(item.price) || 0,
    oldPrice: item.oldPrice ?? null,
    image: item.image ?? item.imageUrl ?? item.thumbnail ?? '',
    imageUrl: item.imageUrl ?? item.image ?? item.thumbnail ?? '',
    rating: Number(item.rating) || 0,
    ratingCount: Number(item.ratingCount) || 0,
    soldCount: Number(item.soldCount) || 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    modelUrl: item.modelUrl ?? '',
    roomTypes: Array.isArray(item.roomTypes) ? item.roomTypes : [],
  }
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
