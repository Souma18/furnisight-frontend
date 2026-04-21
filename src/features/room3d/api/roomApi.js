import axios from 'axios'
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
// Sau nay co the doi qua env VITE_ROOM3D_CLASSIFY_URL; hien dung URL truc tiep theo yeu cau.
const CLASSIFY_ENDPOINT =
  import.meta.env.VITE_ROOM3D_CLASSIFY_URL ?? 'http://10.96.157.6:8000/predict'

/**
 * Goi backend nhan dien: multipart file + image_type.
 * Response: { label: "bedroom", confidence: 0.9231 }
 */
export async function classifyRoomImage(file, imageType = '360') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('image_type', imageType)

  const response = await axios.post(CLASSIFY_ENDPOINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60_000,
  })

  return response.data
}

// API sinh mesh 3D tu anh (model_url).
// Co the doi URL qua env VITE_ROOM3D_PREDICT_URL neu can.
const PREDICT_ENDPOINT = import.meta.env.VITE_ROOM3D_PREDICT_URL ?? 'http://localhost:8000/predict'

export async function predictRoomModel(file, meshResolution = 512) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mesh_resolution', String(meshResolution))

  // Dung axios direct de tranh xung dot default JSON header.
  const response = await axios.post(PREDICT_ENDPOINT, formData, {
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
