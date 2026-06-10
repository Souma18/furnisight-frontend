import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoom3DStore } from '../store/room3DStore'
import { classifyRoomImage, getRoomTemplates, mapLabelToRoomType, predictRoomModel } from '../api/roomApi'
import { PRODUCTS_3D } from '../core/mockData'
import { useCartStore } from '@features/cart/store/cartStore'
import { formatCurrency } from '@shared/utils'

export function useRoom3D() {
  const route = useRoute()
  const router = useRouter()
  const store = useRoom3DStore()
  const cartStore = useCartStore()
  const state = storeToRefs(store)
  const cartState = storeToRefs(cartStore)
  const roomTemplates = ref([])
  const isLoadingTemplates = ref(false)
  const orderCode = ref('')
  const uploadError = ref('')
  const appliedDeepLinkKey = ref('')
  const cartItems = computed(() => cartState.items.value)
  const placedProductIds = computed(() => cartState.room3dProductIds.value)
  const cartProductIds = computed(() =>
    cartState.items.value
      .map((item) => String(item.productId ?? item.id ?? '').split('::')[0])
      .filter(Boolean),
  )
  const cartTotal = computed(() => cartState.totalAmount.value)
  const cartCount = computed(() => cartState.lineCount.value)

  const QUALITY_TO_MESH_RESOLUTION = {
    '128': 128,
    '256': 256,
    '512': 512,
    '1024': 1024,
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

  const productFilters = computed(() => {
    const categoriesBySlug = new Map()
    for (const item of state.recommendations.value) {
      const slug = String(item.categorySlug ?? '').trim().toLowerCase()
      if (!slug || categoriesBySlug.has(slug)) continue
      categoriesBySlug.set(slug, item.categoryName || slug)
    }

    return [
      { label: 'Tất cả', value: 'all' },
      ...Array.from(categoriesBySlug, ([slug, label]) => ({
        label,
        value: slug,
      })),
    ]
  })

  const filteredProducts = computed(() => {
    if (state.predictionResponseType.value !== 'full') return []

    let result = state.recommendations.value

    if (state.selectedCategory.value !== 'all') {
      result = result.filter(
        (item) => item.categorySlug === state.selectedCategory.value,
      )
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
      await cartStore.ensureHydrated()
      const { data } = await getRoomTemplates()
      roomTemplates.value = data
    } finally {
      isLoadingTemplates.value = false
    }
  }

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

      // Gọi song song: nhận diện cho giao diện/gợi ý và tạo mô hình 3D từ ảnh tải lên.
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

  function selectRoomType(type) {
    // Chọn phòng mẫu thì chủ động chuyển sang mô hình có sẵn trong catalog.
    store.selectTemplateRoom(type)
  }

  function addProductToCart(productOrId) {
    const product =
      typeof productOrId === 'number'
        ? PRODUCTS_3D.find((item) => item.id === productOrId)
        : typeof productOrId === 'string'
          ? state.recommendations.value.find((item) => String(item.id) === productOrId)
        : productOrId
    if (!product) return
    cartStore.addItem(product)
  }

  function openProductDetail(product) {
    const detailId = product?.detailId || product?.slug || product?.id
    if (!detailId) return
    router.push({
      name: 'product-detail',
      params: { id: detailId },
    })
  }

  function addProductToScene(payload) {
    if (!payload) return
    if (typeof payload === 'number') {
      store.addToScene(payload)
      return
    }

    if (typeof payload === 'object') {
      store.addToScene(payload.productId ?? payload.id, {
        initialPosition: payload.initialPosition ?? null,
      })
    }
  }

  function removeProductFromCart(lineId) {
    cartStore.removeItem(lineId)
  }

  function updateCartQty(lineId, nextQty) {
    cartStore.updateQty(lineId, nextQty)
  }

  function goCheckout() {
    router.push('/checkout')
  }

  function removeProductFromScene(instanceId) {
    store.removeFromScene(instanceId)
  }

  function submitCheckoutMock() {
    orderCode.value = `LN${Date.now().toString().slice(-6)}`
    store.closeCheckout()
    store.openSuccess()
    cartStore.clearCart()
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
        // "Xem 3D" tu trang chi tiet se dua san pham vao scene, khong tu dong dua vao gio.
        store.addToScene(target.id)
        if (!roomType && Array.isArray(target.roomTypes) && target.roomTypes.length > 0) {
          store.selectTemplateRoom(target.roomTypes[0])
        }
        // Van reset filter de user thay day du san pham sau khi dieu huong.
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
    cartItems,
    placedProductIds,
    cartProductIds,
    cartTotal,
    cartCount,
    roomTemplates,
    isLoadingTemplates,
    productFilters,
    filteredProducts,
    orderCode,
    uploadError,
    formatCurrency,
    setImageType: store.setImageType,
    setMeshQuality: store.setMeshQuality,
    setMode: store.setMode,
    setQuality: store.setQuality,
    setSearchKeyword: store.setSearchKeyword,
    setCategory: store.setCategory,
    toggleCart: store.toggleCart,
    openCheckout: goCheckout,
    goCheckout,
    closeCheckout: store.closeCheckout,
    closeSuccess: store.closeSuccess,
    initRoomTemplates,
    handleUploadImage,
    selectRoomType,
    addProductToCart,
    openProductDetail,
    addProductToScene,
    removeProductFromCart,
    updateCartQty,
    removeProductFromScene,
    submitCheckoutMock,
  }
}
