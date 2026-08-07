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
      name: product.name.length > 50 ? product.name.substring(0, 50) + '...' : product.name,
      price: product.price,
      // image is moved to attachmentUrl to save characters
      category: (product.category?.name ?? product.category ?? '').substring(0, 30),
      slug: product.slug?.substring(0, 40) || '',
    }
    
    const content = `PRODUCT_DATA:${JSON.stringify(productData)}`
    
    try {
      const image = product.image ?? product.thumbnail ?? product.images?.[0] ?? ''
      const attachments = image ? [{
        url: image,
        name: productData.name,
        type: 'product/image', // Using custom type so it doesn't render as a normal image message
        isImage: true
      }] : []
      await store.sendCustomerReply(content, attachments, 'PRODUCT_LINK')
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
