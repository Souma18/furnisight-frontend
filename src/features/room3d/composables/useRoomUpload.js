import { ref } from 'vue'
import { room3dApi } from '@shared/lib/api/services'
const { classifyRoomImage, predictRoomModel, mapLabelToRoomType } = room3dApi

const QUALITY_TO_MESH_RESOLUTION = {
  128: 128,
  256: 256,
  512: 512,
  1024: 1024,
}

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const UNSUPPORTED_IMAGE_MESSAGE = 'Sai định dạng ảnh. Vui lòng upload JPG, PNG hoặc WEBP.'

function isSupportedImageFile(file) {
  const mimeType = String(file?.type ?? '').toLowerCase()
  const extension = String(file?.name ?? '').split('.').pop()?.toLowerCase() ?? ''

  return SUPPORTED_IMAGE_TYPES.has(mimeType) || SUPPORTED_IMAGE_EXTENSIONS.has(extension)
}

function normalizeUploadError(error, fallback = 'Không thể nhận diện phòng từ ảnh này.') {
  const message = String(
    error?.response?.data?.detail ??
      error?.response?.data?.message ??
      error?.message ??
      fallback,
  )
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('cannot identify image file') ||
    lowerMessage.includes('cannot read image file') ||
    lowerMessage.includes('unsupported image') ||
    lowerMessage.includes('invalid image') ||
    lowerMessage.includes('sai dinh dang') ||
    lowerMessage.includes('định dạng')
  ) {
    return UNSUPPORTED_IMAGE_MESSAGE
  }

  return message
}

export function useRoomUpload({ store, state }) {
  const uploadError = ref('')

  async function handleUploadImage(file) {
    if (!file) return

    uploadError.value = ''

    if (!isSupportedImageFile(file)) {
      uploadError.value = UNSUPPORTED_IMAGE_MESSAGE
      return
    }

    store.setPredictionLoading()
    store.setUploadedModelUrl('')
    store.showPredictionRoom(null)
    store.setCategory('all')
    store.setAnalyzing(true)

    try {
      const meshResolution = QUALITY_TO_MESH_RESOLUTION[state.quality.value] ?? 512

      const [predictionResult, meshResult] = await Promise.allSettled([
        classifyRoomImage(file, state.imageType.value),
        predictRoomModel(file, {
          imageType: state.imageType.value,
          meshResolution,
          meshQuality: state.meshQuality.value,
        }),
      ])

      if (predictionResult.status === 'fulfilled') {
        const prediction = predictionResult.value
        const detectedRoomType = mapLabelToRoomType(prediction?.label)
        
        store.applyPredictionResult(prediction)

        if (meshResult.status === 'fulfilled') {
          const meshData = meshResult.value
          const modelUrl = meshData?.model_url

          if (modelUrl) {
            store.applyAiGeneratedModel({
              roomType: detectedRoomType,
              modelUrl,
            })
          } else {
            store.setUploadedModelUrl('')
            store.showPredictionRoom(null)
          }
        }

        if (meshResult.status === 'rejected') {
          store.setUploadedModelUrl('')
          store.showPredictionRoom(null)
          uploadError.value = normalizeUploadError(meshResult.reason, 'Không có kết quả trực quan 3D.')
        }
      } else {
        store.setPredictionError()
        store.showPredictionRoom(null)
        uploadError.value = normalizeUploadError(predictionResult.reason, 'Không thể nhận diện phòng từ ảnh này.')

        if (meshResult.status === 'fulfilled') {
          const meshData = meshResult.value
          const modelUrl = meshData?.model_url

          if (modelUrl) {
            store.applyAiGeneratedModel({
              roomType: null,
              modelUrl,
            })
          }
        }
      }

      if (predictionResult.status === 'fulfilled' && meshResult.status === 'fulfilled') {
        const meshData = meshResult.value
        const modelUrl = meshData?.model_url
        if (!modelUrl) {
          store.setUploadedModelUrl('')
          store.showPredictionRoom(null)
          uploadError.value = 'Không có kết quả trực quan 3D.'
        }
      }
    } catch (error) {
      uploadError.value = normalizeUploadError(error, 'Không thể nhận diện phòng từ ảnh này.')
      store.setPredictionError()
      store.setUploadedModelUrl('')
      store.showPredictionRoom(null)
    } finally {
      store.setAnalyzing(false)
    }
  }

  return {
    uploadError,
    handleUploadImage,
  }
}
