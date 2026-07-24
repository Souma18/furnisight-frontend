import { computed, ref, watch } from 'vue'
import { room3dApi } from '@shared/lib/api/services'
const { getRoomRecommendations } = room3dApi

export function useRoomRecommendations({ store, state }) {
  const recommendationError = ref('')
  let manualRecommendationRequestId = 0

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
        result = result.filter(item => item.categorySlug === state.selectedCategory.value)
      }
      return result
    })

  async function fetchRecommendations() {
    const requestId = ++manualRecommendationRequestId
    recommendationError.value = ''
    
    const targetRoomType = state.showAllRooms.value ? 'all' : state.selectedRoomType.value
    if (!targetRoomType) return

    try {
      const result = await getRoomRecommendations(targetRoomType)
      if (requestId !== manualRecommendationRequestId) return
      store.applyManualRecommendations(result)
    } catch (error) {
      if (requestId !== manualRecommendationRequestId) return
      store.applyManualRecommendations({
        recommendations: [],
        recommendationMeta: {
          roomType: targetRoomType,
          source: 'manual',
          reason: 'catalog_unavailable',
        },
      })
      recommendationError.value = 'Không thể tải gợi ý sản phẩm.'
    }
  }

  async function selectRoomType(type) {
    store.selectTemplateRoom(type)
    store.setCategory('all')
    store.setSearchKeyword('')
    await fetchRecommendations()
  }

  watch(() => state.showAllRooms.value, () => {
    fetchRecommendations()
  })

  return {
    recommendationError,
    productFilters,
    filteredProducts,
    selectRoomType,
  }
}
