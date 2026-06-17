import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoom3DStore } from '../store/room3DStore'
import { room3dApi } from '@shared/lib/api/services'
const { getRoomTemplates } = room3dApi
import { useCartStore } from '@features/cart/store/cartStore'
import { formatCurrency } from '@shared/utils'
import { useRoomCartBridge } from './useRoomCartBridge'
import { useRoomDeepLink } from './useRoomDeepLink'
import { useRoomRecommendations } from './useRoomRecommendations'
import { useRoomUpload } from './useRoomUpload'

export function useRoom3D() {
  const route = useRoute()
  const router = useRouter()
  const store = useRoom3DStore()
  const cartStore = useCartStore()
  const state = storeToRefs(store)
  const cartState = storeToRefs(cartStore)
  const roomTemplates = ref([])
  const isLoadingTemplates = ref(false)

  const { uploadError, handleUploadImage } = useRoomUpload({ store, state })
  const {
    recommendationError,
    productFilters,
    filteredProducts,
    selectRoomType,
  } = useRoomRecommendations({ store, state })
  const {
    orderCode,
    cartItems,
    placedProductIds,
    cartProductIds,
    cartTotal,
    cartCount,
    addProductToCart,
    openProductDetail,
    removeProductFromCart,
    updateCartQty,
    goCheckout,
    submitCheckoutMock,
  } = useRoomCartBridge({
    store,
    state,
    cartStore,
    cartState,
    router,
  })
  useRoomDeepLink({
    route,
    store,
    roomTemplates,
    selectRoomType,
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

  function removeProductFromScene(instanceId) {
    store.removeFromScene(instanceId)
  }

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
    recommendationError,
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
