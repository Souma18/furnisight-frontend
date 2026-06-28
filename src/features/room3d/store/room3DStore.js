import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { ROOM_TEMPLATES } from '../core/mockData'

export const useRoom3DStore = defineStore('room3d', () => {
  const STORAGE_KEY = 'room3d-store-v1'
  const mode = ref('upload')
  const isAnalyzing = ref(false)
  const selectedRoomType = ref(null)
  const projectName = ref('')
  // Loai anh upload: 'normal' | '360'
  const imageType = ref('normal')
  // Chat luong luoi cho anh thuong: 'low' | 'medium' | 'high'
  const meshQuality = ref('medium')
  // Giá trị gửi lên dịch vụ dựng ảnh 360: 128 | 256 | 512 | 1024.
  const quality = ref('512')
  const uploadedModelUrl = ref('')
  // Nguồn mô hình đang hiển thị giữa canvas:
  // - 'none': chưa chọn hoặc chưa tạo mô hình
  // - 'uploaded': mô hình được tạo từ ảnh tải lên
  // - 'template': mô hình có sẵn trong tab "Phòng mẫu"
  const roomRenderSource = ref('none')
  /** Trạng thái nhận diện: idle | loading | success | error */
  const predictionStatus = ref('idle')
  const predictionResponseType = ref(null)
  const recommendationMeta = ref(null)
  const recommendations = ref([])
  /** Kết quả nhận diện: nhãn gốc + độ tin cậy 0..1 để hiển thị phần trăm. */
  const aiRecognitionLabel = ref('')
  const aiRecognitionConfidence = ref(null)
  const searchKeyword = ref('')
  const selectedCategory = ref('all')
  const sceneItems = ref([])
  const isCartExpanded = ref(false)

  function restorePersistedState() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return

      if (typeof parsed.searchKeyword === 'string') searchKeyword.value = parsed.searchKeyword
      if (typeof parsed.selectedCategory === 'string') selectedCategory.value = parsed.selectedCategory
    } catch {
      // Ignore corrupted local storage data.
    }
  }

  function persistState() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          searchKeyword: searchKeyword.value,
          selectedCategory: selectedCategory.value,
        }),
      )
    } catch {
      // Ignore storage write errors.
    }
  }

  restorePersistedState()

  const selectedRoom = computed(() => {
    if (roomRenderSource.value === 'none') return null

    const room = selectedRoomType.value
      ? ROOM_TEMPLATES.find((item) => item.type === selectedRoomType.value) ?? null
      : null
    const label = aiRecognitionLabel.value || selectedRoomType.value || ''
    const placeholderRoom = label
      ? {
          id: label,
          type: label,
          name: label,
          icon: 'house',
          suggestText: '',
          tags: [],
          confidence: null,
          isAvailable: false,
          statusText: 'Phòng này đang được bổ sung mô hình 3D.',
          modelUrl: null,
        }
      : null

    // Mô hình từ ảnh tải lên được ưu tiên cho đến khi người dùng chọn phòng mẫu.
    if (roomRenderSource.value === 'uploaded' && uploadedModelUrl.value) {
      const baseRoom = room ?? placeholderRoom
      if (!baseRoom) return null
      return {
        ...baseRoom,
        confidence:
          aiRecognitionConfidence.value != null && Number.isFinite(aiRecognitionConfidence.value)
            ? Math.round(aiRecognitionConfidence.value * 100)
            : null,
        modelUrl: uploadedModelUrl.value,
        isAvailable: true,
        statusText: 'Không gian 3D đã sẵn sàng từ ảnh đã tải lên.',
      }
    }

    // Mô hình có sẵn từ tab "Phòng mẫu".
    if (roomRenderSource.value === 'template') return room

    if (roomRenderSource.value === 'prediction') return room ?? placeholderRoom

    return null
  })

  function setMode(nextMode) {
    mode.value = nextMode
  }

  function setAnalyzing(nextValue) {
    isAnalyzing.value = nextValue
  }

  function setSelectedRoomType(roomType) {
    selectedRoomType.value = roomType
  }

  function setImageType(type) {
    imageType.value = type
  }

  function setMeshQuality(qualityValue) {
    meshQuality.value = qualityValue
  }

  function setQuality(nextQuality) {
    quality.value = nextQuality
  }

  function setUploadedModelUrl(url) {
    uploadedModelUrl.value = url ?? ''
  }

  function setPredictionLoading() {
    predictionStatus.value = 'loading'
    predictionResponseType.value = null
    recommendationMeta.value = null
    recommendations.value = []
    aiRecognitionLabel.value = ''
    aiRecognitionConfidence.value = null
  }

  function applyPredictionResult(result = {}) {
    predictionStatus.value = 'success'
    predictionResponseType.value = result.responseType ?? 'legacy'
    recommendationMeta.value = result.recommendationMeta ?? null
    recommendations.value = Array.isArray(result.recommendations) ? result.recommendations : []
    aiRecognitionLabel.value = result.label ?? ''
    aiRecognitionConfidence.value =
      typeof result.confidence === 'number' && Number.isFinite(result.confidence)
        ? result.confidence
        : null
  }

  function applyManualRecommendations(result = {}) {
    predictionStatus.value = 'success'
    predictionResponseType.value = 'full'
    recommendationMeta.value = result.recommendationMeta ?? null
    recommendations.value = Array.isArray(result.recommendations) ? result.recommendations : []
  }

  function setPredictionError() {
    predictionStatus.value = 'error'
    predictionResponseType.value = null
    recommendationMeta.value = null
    recommendations.value = []
    aiRecognitionLabel.value = ''
    aiRecognitionConfidence.value = null
  }

  function applyAiGeneratedModel({ roomType, modelUrl }) {
    selectedRoomType.value = roomType ?? null
    uploadedModelUrl.value = modelUrl ?? ''
    roomRenderSource.value = uploadedModelUrl.value ? 'uploaded' : 'none'
  }

  function showPredictionRoom(roomType) {
    selectedRoomType.value = roomType ?? null
    uploadedModelUrl.value = ''
    roomRenderSource.value = 'prediction'
  }

  function selectTemplateRoom(roomType) {
    selectedRoomType.value = roomType
    roomRenderSource.value = 'template'
  }

  function setAiRecognition(label, confidence) {
    aiRecognitionLabel.value = label ?? ''
    aiRecognitionConfidence.value =
      typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : null
  }

  function clearAiRecognition() {
    predictionStatus.value = 'idle'
    predictionResponseType.value = null
    recommendationMeta.value = null
    recommendations.value = []
    aiRecognitionLabel.value = ''
    aiRecognitionConfidence.value = null
  }

  function resetRenderSourceIfNoModel() {
    if (!uploadedModelUrl.value && roomRenderSource.value === 'uploaded') {
      roomRenderSource.value = 'none'
    }
  }

  function setSearchKeyword(keyword) {
    searchKeyword.value = keyword
  }

  function setCategory(category) {
    selectedCategory.value = category
  }

  function addToScene(productOrId, options = {}) {
    const productId = typeof productOrId === 'object' ? productOrId?.id : productOrId
    if (!productId) return null

    const instanceId = `scene-${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const nextPlacementIndex = sceneItems.value.length
      ? Math.max(...sceneItems.value.map((item) => item.placementIndex ?? 0)) + 1
      : 0
    const sceneItem = {
      instanceId,
      productId,
      variantId: options.variantId ?? undefined,
      initialPosition: options.initialPosition ?? null,
      placementIndex: options.placementIndex ?? nextPlacementIndex,
    }
    sceneItems.value.push(sceneItem)
    return sceneItem
  }

  function removeFromScene(instanceId) {
    sceneItems.value = sceneItems.value.filter((item) => item.instanceId !== instanceId)
  }

  function updateSceneItemVariant(instanceId, variantId) {
    const item = sceneItems.value.find((i) => i.instanceId === instanceId)
    if (item) {
      item.variantId = variantId
    }
  }

  watch(
    [searchKeyword, selectedCategory],
    () => {
      persistState()
    },
    { deep: true },
  )

  function toggleCart() {
    isCartExpanded.value = !isCartExpanded.value
  }

  return {
    mode,
    isAnalyzing,
    selectedRoomType,
    selectedRoom,
    projectName,
    imageType,
    meshQuality,
    quality,
    uploadedModelUrl,
    roomRenderSource,
    predictionStatus,
    predictionResponseType,
    recommendationMeta,
    recommendations,
    aiRecognitionLabel,
    aiRecognitionConfidence,
    searchKeyword,
    selectedCategory,
    sceneItems,
    isCartExpanded,
    setMode,
    setAnalyzing,
    setSelectedRoomType,
    setImageType,
    setMeshQuality,
    setQuality,
    setUploadedModelUrl,
    setPredictionLoading,
    applyPredictionResult,
    applyManualRecommendations,
    setPredictionError,
    applyAiGeneratedModel,
    showPredictionRoom,
    selectTemplateRoom,
    setAiRecognition,
    clearAiRecognition,
    resetRenderSourceIfNoModel,
    setSearchKeyword,
    setCategory,
    addToScene,
    removeFromScene,
    updateSceneItemVariant,
    toggleCart,
  }
})
