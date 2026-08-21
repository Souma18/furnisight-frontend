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
  const showAllRooms = ref(false)

  function restorePersistedState() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return

      if (typeof parsed.mode === 'string') mode.value = parsed.mode
      if (parsed.selectedRoomType !== undefined) selectedRoomType.value = parsed.selectedRoomType
      if (typeof parsed.projectName === 'string') projectName.value = parsed.projectName
      if (typeof parsed.imageType === 'string') imageType.value = parsed.imageType
      if (typeof parsed.meshQuality === 'string') meshQuality.value = parsed.meshQuality
      if (typeof parsed.quality === 'string') quality.value = parsed.quality
      if (typeof parsed.uploadedModelUrl === 'string') uploadedModelUrl.value = parsed.uploadedModelUrl
      if (typeof parsed.roomRenderSource === 'string') roomRenderSource.value = parsed.roomRenderSource
      if (typeof parsed.predictionStatus === 'string') {
        predictionStatus.value = parsed.predictionStatus === 'loading' ? 'idle' : parsed.predictionStatus
      }
      if (parsed.predictionResponseType !== undefined) predictionResponseType.value = parsed.predictionResponseType
      if (parsed.recommendationMeta !== undefined) recommendationMeta.value = parsed.recommendationMeta
      if (Array.isArray(parsed.recommendations)) recommendations.value = parsed.recommendations
      if (typeof parsed.aiRecognitionLabel === 'string') aiRecognitionLabel.value = parsed.aiRecognitionLabel
      if (parsed.aiRecognitionConfidence !== undefined) aiRecognitionConfidence.value = parsed.aiRecognitionConfidence
      if (typeof parsed.searchKeyword === 'string') searchKeyword.value = parsed.searchKeyword
      if (typeof parsed.selectedCategory === 'string') selectedCategory.value = parsed.selectedCategory
      if (Array.isArray(parsed.sceneItems)) sceneItems.value = parsed.sceneItems
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
          mode: mode.value,
          selectedRoomType: selectedRoomType.value,
          projectName: projectName.value,
          imageType: imageType.value,
          meshQuality: meshQuality.value,
          quality: quality.value,
          uploadedModelUrl: uploadedModelUrl.value,
          roomRenderSource: roomRenderSource.value,
          predictionStatus: predictionStatus.value === 'loading' ? 'idle' : predictionStatus.value,
          predictionResponseType: predictionResponseType.value,
          recommendationMeta: recommendationMeta.value,
          recommendations: recommendations.value,
          aiRecognitionLabel: aiRecognitionLabel.value,
          aiRecognitionConfidence: aiRecognitionConfidence.value,
          searchKeyword: searchKeyword.value,
          selectedCategory: selectedCategory.value,
          sceneItems: sceneItems.value,
        }),
      )
    } catch {
      // Ignore storage write errors.
    }
  }

  function resetRoomStore() {
    mode.value = 'upload'
    isAnalyzing.value = false
    selectedRoomType.value = null
    projectName.value = ''
    imageType.value = 'normal'
    meshQuality.value = 'medium'
    quality.value = '512'
    uploadedModelUrl.value = ''
    roomRenderSource.value = 'none'
    predictionStatus.value = 'idle'
    predictionResponseType.value = null
    recommendationMeta.value = null
    recommendations.value = []
    aiRecognitionLabel.value = ''
    aiRecognitionConfidence.value = null
    searchKeyword.value = ''
    selectedCategory.value = 'all'
    sceneItems.value = []
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore storage write errors.
      }
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
    sceneItems.value = []
  }

  function showPredictionRoom(roomType) {
    selectedRoomType.value = roomType ?? null
    uploadedModelUrl.value = ''
    roomRenderSource.value = 'prediction'
    sceneItems.value = []
  }

  function selectTemplateRoom(roomType) {
    selectedRoomType.value = roomType
    roomRenderSource.value = 'template'
    sceneItems.value = []
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
    [
      mode,
      selectedRoomType,
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
    ],
    () => {
      persistState()
    },
    { deep: true },
  )

  function toggleCart() {
    isCartExpanded.value = !isCartExpanded.value
  }

  function toggleShowAllRooms() {
    showAllRooms.value = !showAllRooms.value
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
    showAllRooms,
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
    toggleShowAllRooms,
    resetRoomStore,
  }
})
