import { apiClient } from '@shared/lib/api/client'
import { PRODUCTS_3D, ROOM_TEMPLATES } from '../core/mockData'

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

/**
 * Chuan hoa label API thanh `selectedRoomType` hop le.
 * Neu khong khop, tra ve `bedroom` lam mac dinh.
 */
export function mapLabelToRoomType(label) {
  if (!label || typeof label !== 'string') return 'bedroom'
  const key = label.trim().toLowerCase()
  if (ROOM_TEMPLATES.some((r) => r.type === key)) return key
  return LABEL_TO_ROOM_TYPE[key] ?? 'bedroom'
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

// API nhan dien loai phong tu anh (label + confidence).
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

  return response.data
}

// API sinh mesh 3D tu anh (model_url).
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

export async function getSuggestedProducts(roomType) {
  await delay(450)
  const products = PRODUCTS_3D.filter((product) =>
    roomType ? product.roomTypes.includes(roomType) : true,
  )
  return { data: products }
}
