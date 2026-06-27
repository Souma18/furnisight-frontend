import { ref } from 'vue'
import { productsApi, ProductResponse } from '@shared/lib/api/services'

export function useRoom3dProduct() {
  const loading = ref(false)

  async function fetchProduct(productId) {
    loading.value = true
    try {
      const res = await productsApi.getProductDetail(productId)
      return new ProductResponse(res.data ?? res)
    } finally {
      loading.value = false
    }
  }

  return { loading, fetchProduct }
}
