import { ref } from 'vue'
import { productsApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminProductReviews() {
  const ui = useAdminUiStore()

  const isOpen = ref(false)
  const selectedProduct = ref(null)
  const reviews = ref([])
  const loading = ref(false)
  const sentimentFilter = ref('NEGATIVE')

  async function _fetch() {
    if (!selectedProduct.value) return
    loading.value = true
    try {
      const params = { page: 0, size: 50 }
      if (sentimentFilter.value) params.sentiment = sentimentFilter.value
      const res = await productsApi.getReviews(selectedProduct.value.productId, params)
      reviews.value = Array.isArray(res.data) ? res.data : (res.data?.content ?? [])
    } catch {
      ui.showToast({ icon: 'alertTriangle', title: 'Lỗi', subtitle: 'Không thể tải đánh giá' })
    } finally {
      loading.value = false
    }
  }

  async function open(product) {
    selectedProduct.value = product
    sentimentFilter.value = 'NEGATIVE'
    isOpen.value = true
    await _fetch()
  }

  function close() {
    isOpen.value = false
    selectedProduct.value = null
    reviews.value = []
  }

  async function changeSentiment(value) {
    sentimentFilter.value = value
    await _fetch()
  }

  return {
    isOpen,
    selectedProduct,
    reviews,
    loading,
    sentimentFilter,
    open,
    close,
    changeSentiment,
  }
}
