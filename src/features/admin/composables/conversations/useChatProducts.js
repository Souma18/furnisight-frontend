import { ref } from 'vue'
import { productsApi } from '@shared/lib/api/services'

export function useChatProducts(uiStore) {
  const products = ref([])
  const productsLoading = ref(false)
  const selectedProdId = ref(null)

  async function loadProducts() {
    productsLoading.value = true
    try {
      const res = await productsApi.getProducts({ size: 100 })
      products.value = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.content ?? []
    } catch (error) {
      console.error('Failed to load products', error)
    } finally {
      productsLoading.value = false
    }
  }

  function selectProduct(id) {
    selectedProdId.value = id
  }

  function sendProductToChat(product) {
    uiStore.showToast({ icon: 'armchair', title: 'Đã gửi sản phẩm', subtitle: product.name })
    selectedProdId.value = null
  }

  return {
    products,
    productsLoading,
    selectedProdId,
    loadProducts,
    selectProduct,
    sendProductToChat,
  }
}
