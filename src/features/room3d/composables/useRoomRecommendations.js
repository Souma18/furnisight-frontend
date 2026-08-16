import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { room3dApi } from '@shared/lib/api/services'
const { getRoomRecommendations } = room3dApi

export function useRoomRecommendations({ store, state }) {
  const { t } = useI18n()
  const recommendationError = ref('')
  let manualRecommendationRequestId = 0

  // Tự động sinh danh mục Bộ lọc (Filter Tabs) dựa trên danh sách sản phẩm thực tế trả về
  const productFilters = computed(() => {
    const categoriesBySlug = new Map()
    for (const item of state.recommendations.value) {
      const slug = String(item.categorySlug ?? '').trim().toLowerCase()
      if (!slug || categoriesBySlug.has(slug)) continue
      categoriesBySlug.set(slug, item.categoryName || slug)
    }

    return [
      { label: t('room3d.products.all'), value: 'all' },
      ...Array.from(categoriesBySlug, ([slug, label]) => ({
        label,
        value: slug,
      })),
    ]
  })

    // Lọc danh sách sản phẩm để hiển thị dựa trên Tab đang được chọn (Tất cả, Sofa, Giường,...)
    const filteredProducts = computed(() => {
      if (state.predictionResponseType.value !== 'full') return []
      let result = state.recommendations.value
      if (state.selectedCategory.value !== 'all') {
        result = result.filter(item => item.categorySlug === state.selectedCategory.value)
      }
      return result
    })

  async function fetchRecommendations() {
    // Biến đếm requestId giúp ngăn chặn lỗi Race Condition (khi user click liên tục)
    const requestId = ++manualRecommendationRequestId
    recommendationError.value = ''
    
    const targetRoomType = state.showAllRooms.value ? 'all' : state.selectedRoomType.value
    if (!targetRoomType) return

    try {
      // Gọi API lấy gợi ý từ Backend
      const result = await getRoomRecommendations(targetRoomType)
      
      // Nếu có request mới hơn vừa được tạo ra thì bỏ qua kết quả cũ trả về muộn
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

  watch(() => state.selectedRoomType.value, (newVal) => {
    if (newVal) {
      fetchRecommendations()
    }
  }, { immediate: true })

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
