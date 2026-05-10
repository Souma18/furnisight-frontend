import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRoom3DStore } from '../store/room3DStore'
import { classifyRoomImage, getRoomTemplates, mapLabelToRoomType, predictRoomModel } from '../api/roomApi'
import { PRODUCTS_3D, PRODUCT_FILTERS } from '../core/mockData'
import { formatCurrency } from '@shared/utils'

export function useRoom3D() {
  const route = useRoute()
  const store = useRoom3DStore()
  const state = storeToRefs(store)
  const roomTemplates = ref([])
  const isLoadingTemplates = ref(false)
  const orderCode = ref('')
  const uploadError = ref('')
  const appliedDeepLinkKey = ref('')

  const QUALITY_TO_MESH_RESOLUTION = {
    '128': 128,
    '256': 256,
    '512': 512,
    '1024': 1024,
  }

  const filteredProducts = computed(() => {
    let result = PRODUCTS_3D

    if (state.selectedCategory.value !== 'all') {
      result = result.filter((item) => item.category === state.selectedCategory.value)
    }

    const keyword = state.searchKeyword.value.trim().toLowerCase()
    if (keyword) {
      result = result.filter((item) => item.name.toLowerCase().includes(keyword))
    }

    return result
  })

  async function initRoomTemplates() {
    isLoadingTemplates.value = true
    try {
      const { data } = await getRoomTemplates()
      roomTemplates.value = data
    } finally {
      isLoadingTemplates.value = false
    }
  }

  async function handleUploadImage(file) {
    if (!file) return

    uploadError.value = ''
    store.clearAiRecognition()
    store.setUploadedModelUrl('')
    store.resetRenderSourceIfNoModel()
    store.setAnalyzing(true)

    try {
      // 1) Nhan dien loai phong: file + image_type=normal -> label, confidence
      let detectedRoomType = state.selectedRoomType.value ?? 'bedroom'
      let detectedLabel = ''
      let detectedConfidence = null
      try {
        const cls = await classifyRoomImage(file, 'normal')
        const label = cls?.label
        const confidence = cls?.confidence
        store.setAiRecognition(label, confidence)
        detectedLabel = label
        detectedConfidence = confidence
        detectedRoomType = mapLabelToRoomType(label)
      } catch {
        // Nhan dien loi: van sinh mesh duoc; mac dinh phong ngu de UI khong trong.
        store.clearAiRecognition()
      }

      // 2) Sinh mesh 3D: file + mesh_resolution -> model_url (endpoint khac, xem roomApi)
      const meshResolution = QUALITY_TO_MESH_RESOLUTION[state.quality.value] ?? 512
      const meshData = await predictRoomModel(file, meshResolution)
      const modelUrl = meshData?.model_url

      if (!modelUrl) {
        throw new Error('Khong nhan duoc model_url tu backend sinh mesh.')
      }

      store.applyAiGeneratedModel({
        roomType: detectedRoomType,
        modelUrl,
        label: detectedLabel,
        confidence: detectedConfidence,
      })
    } catch (error) {
      uploadError.value =
        error?.response?.data?.detail ?? error?.message ?? 'Upload / sinh mesh that bai.'
      store.setUploadedModelUrl('')
      store.resetRenderSourceIfNoModel()
    } finally {
      store.setAnalyzing(false)
    }
  }

  function selectRoomType(type) {
    // Chon phong o => chu dong chuyen qua model phong mau.
    store.selectTemplateRoom(type)
  }

  function addProductToCart(productOrId) {
    const product =
      typeof productOrId === 'number'
        ? PRODUCTS_3D.find((item) => item.id === productOrId)
        : productOrId
    if (!product) return
    store.addToCart(product)
  }

  function removeProductFromCart(productId) {
    store.removeFromCart(productId)
  }

  function submitCheckoutMock() {
    orderCode.value = `LN${Date.now().toString().slice(-6)}`
    store.closeCheckout()
    store.openSuccess()
    store.clearCart()
  }

  function applyDeepLinkProduct() {
    const roomTypeRaw = route.query.roomType
    const productIdRaw = route.query.productId
    const roomType = typeof roomTypeRaw === 'string' ? roomTypeRaw.trim() : ''
    const productId = Number.parseInt(String(productIdRaw ?? ''), 10)
    const deepLinkKey = `${roomType || 'none'}:${Number.isFinite(productId) ? productId : 'none'}`
    if (appliedDeepLinkKey.value === deepLinkKey) return

    let applied = false

    if (roomType) {
      const templateExists = roomTemplates.value.some((item) => item.type === roomType)
      if (templateExists) {
        store.selectTemplateRoom(roomType)
        applied = true
      }
    }

    if (Number.isFinite(productId)) {
      const target = PRODUCTS_3D.find((item) => item.id === productId)
      if (target) {
        store.addToCart(target)
        // Ensure users can still see all cards after deep-link add.
        store.setCategory('all')
        store.setSearchKeyword('')
        applied = true
      }
    }

    if (applied) {
      appliedDeepLinkKey.value = deepLinkKey
    }
  }

  watch(
    () => [route.query.roomType, route.query.productId, roomTemplates.value.length],
    () => {
      applyDeepLinkProduct()
    },
    { immediate: true },
  )

  return {
    ...state,
    roomTemplates,
    isLoadingTemplates,
    productFilters: PRODUCT_FILTERS,
    filteredProducts,
    orderCode,
    uploadError,
    formatCurrency,
    setMode: store.setMode,
    setQuality: store.setQuality,
    setSearchKeyword: store.setSearchKeyword,
    setCategory: store.setCategory,
    toggleCart: store.toggleCart,
    openCheckout: store.openCheckout,
    closeCheckout: store.closeCheckout,
    closeSuccess: store.closeSuccess,
    initRoomTemplates,
    handleUploadImage,
    selectRoomType,
    addProductToCart,
    removeProductFromCart,
    submitCheckoutMock,
  }
}
