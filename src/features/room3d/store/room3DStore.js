import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ROOM_TEMPLATES } from '../core/mockData'

export const useRoom3DStore = defineStore('room3d', () => {
  const mode = ref('upload')
  const isAnalyzing = ref(false)
  const selectedRoomType = ref(null)
  const projectName = ref('')
  // Gia tri gui API mesh_resolution: 128 | 256 | 512 | 1024
  const quality = ref('512')
  const uploadedModelUrl = ref('')
  // Nguon model dang hien thi giua canvas:
  // - 'none': chua chon/tao model
  // - 'uploaded': model sinh tu AI upload
  // - 'template': model phong mau trong tab "Phong o"
  const roomRenderSource = ref('none')
  /** Ket qua API nhan dien: label goc + confidence 0..1 (de hien thi %) */
  const aiRecognitionLabel = ref('')
  const aiRecognitionConfidence = ref(null)
  const searchKeyword = ref('')
  const selectedCategory = ref('all')
  const placedProductIds = ref([])
  const cartItems = ref([])
  const isCartExpanded = ref(false)
  const isCheckoutOpen = ref(false)
  const isSuccessOpen = ref(false)

  const selectedRoom = computed(() => {
    if (roomRenderSource.value === 'none') return null

    const fallbackRoom = ROOM_TEMPLATES.find((item) => item.type === 'bedroom') ?? null
    const room =
      ROOM_TEMPLATES.find((item) => item.type === selectedRoomType.value) ??
      ROOM_TEMPLATES[0] ??
      fallbackRoom
    if (!room) return null

    // Model AI upload: duoc uu tien hien thi cho den khi user chu dong chon phong mau.
    if (roomRenderSource.value === 'uploaded' && uploadedModelUrl.value) {
      return {
        ...room,
        confidence:
          aiRecognitionConfidence.value != null && Number.isFinite(aiRecognitionConfidence.value)
            ? Math.round(aiRecognitionConfidence.value * 100)
            : room.confidence,
        modelUrl: uploadedModelUrl.value,
        isAvailable: true,
        statusText: 'Model duoc sinh tu anh upload.',
      }
    }

    // Model phong mau tu tab "Phong o".
    return room
  })

  const cartCount = computed(() => cartItems.value.length)
  const cartTotal = computed(() =>
    cartItems.value.reduce((total, item) => total + item.price * item.qty, 0),
  )

  function setMode(nextMode) {
    mode.value = nextMode
  }

  function setAnalyzing(nextValue) {
    isAnalyzing.value = nextValue
  }

  function setSelectedRoomType(roomType) {
    selectedRoomType.value = roomType
  }

  function setQuality(nextQuality) {
    quality.value = nextQuality
  }

  function setUploadedModelUrl(url) {
    uploadedModelUrl.value = url ?? ''
  }

  function applyAiGeneratedModel({ roomType, modelUrl, label, confidence }) {
    selectedRoomType.value = roomType ?? selectedRoomType.value ?? 'bedroom'
    uploadedModelUrl.value = modelUrl ?? ''
    aiRecognitionLabel.value = label ?? ''
    aiRecognitionConfidence.value =
      typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : null
    roomRenderSource.value = uploadedModelUrl.value ? 'uploaded' : 'none'
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

  function addToCart(product) {
    const existed = cartItems.value.some((item) => item.id === product.id)
    if (existed) {
      return
    }

    cartItems.value.push({ ...product, qty: 1 })
    placedProductIds.value.push(product.id)
  }

  function removeFromCart(productId) {
    cartItems.value = cartItems.value.filter((item) => item.id !== productId)
    placedProductIds.value = placedProductIds.value.filter((id) => id !== productId)
  }

  function clearCart() {
    cartItems.value = []
    placedProductIds.value = []
  }

  function toggleCart() {
    isCartExpanded.value = !isCartExpanded.value
  }

  function openCheckout() {
    isCheckoutOpen.value = true
  }

  function closeCheckout() {
    isCheckoutOpen.value = false
  }

  function openSuccess() {
    isSuccessOpen.value = true
  }

  function closeSuccess() {
    isSuccessOpen.value = false
  }

  return {
    mode,
    isAnalyzing,
    selectedRoomType,
    selectedRoom,
    projectName,
    quality,
    uploadedModelUrl,
    roomRenderSource,
    aiRecognitionLabel,
    aiRecognitionConfidence,
    searchKeyword,
    selectedCategory,
    placedProductIds,
    cartItems,
    cartCount,
    cartTotal,
    isCartExpanded,
    isCheckoutOpen,
    isSuccessOpen,
    setMode,
    setAnalyzing,
    setSelectedRoomType,
    setQuality,
    setUploadedModelUrl,
    applyAiGeneratedModel,
    selectTemplateRoom,
    setAiRecognition,
    clearAiRecognition,
    resetRenderSourceIfNoModel,
    setSearchKeyword,
    setCategory,
    addToCart,
    removeFromCart,
    clearCart,
    toggleCart,
    openCheckout,
    closeCheckout,
    openSuccess,
    closeSuccess,
  }
})
