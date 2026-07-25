import { ref } from 'vue'
import { productsApi } from '@shared/lib/api/services'
import { useAdminConversationStore } from '../../store/adminConversationStore'

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

  async function sendProductToChat(product) {
    const store = useAdminConversationStore()
    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? product.thumbnail ?? product.images?.[0] ?? '',
      category: product.category?.name ?? product.category ?? '',
      slug: product.slug || '',
    }
    
    const content = `PRODUCT_DATA:${JSON.stringify(productData)}`
    
    try {
      await store.sendCustomerReply(content, [])
      uiStore.showToast({ icon: 'armchair', title: 'Đã gửi sản phẩm', subtitle: product.name })
    } catch (e) {
      uiStore.showToast({ icon: 'alert', title: 'Lỗi gửi sản phẩm', subtitle: 'Không thể gửi sản phẩm này.' })
    }
    
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
