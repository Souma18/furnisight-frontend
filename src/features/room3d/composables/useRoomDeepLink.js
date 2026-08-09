import { ref, watch } from 'vue'
import { PRODUCTS_3D } from '../core/mockData'

export function useRoomDeepLink({
  route,
  store,
  roomTemplates,
  selectRoomType,
}) {
  const appliedDeepLinkKey = ref('')

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
        void selectRoomType(roomType)
        applied = true
      }
    }

    if (Number.isFinite(productId)) {
      const target = PRODUCTS_3D.find((item) => item.id === productId)
      if (target) {
        store.addToScene(target.id)
        if (!roomType && Array.isArray(target.roomTypes) && target.roomTypes.length > 0) {
          void selectRoomType(target.roomTypes[0])
        }
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
    applyDeepLinkProduct,
  }
}
