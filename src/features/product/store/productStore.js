import { ref } from 'vue'
import { defineStore } from 'pinia'
import { productsApi, ProductResponse } from '@shared/lib/api/services'

export const useProductStore = defineStore('product', () => {
  const items = ref([])
  const total = ref(0)
  const facets = ref({})
  const loading = ref(false)
  const error = ref(null)
  const selectedProduct = ref(null)
  const productDetails = ref({})

  function mapProductList(data) {
    const rawItems = data?.products ?? data?.content ?? []
    return Array.isArray(rawItems) ? rawItems.map((item) => new ProductResponse(item)) : []
  }

  async function loadList(params) {
    loading.value = true
    error.value = null
    try {
      const { data } = await productsApi.getProducts(params)
      items.value = mapProductList(data)
      total.value = data?.total ?? data?.page?.totalElements ?? items.value.length
      facets.value = data?.facets ?? {}
    } catch (e) {
      error.value = e
      items.value = []
      total.value = 0
      facets.value = {}
    } finally {
      loading.value = false
    }
  }

  async function loadDetail(productId) {
    loading.value = true
    error.value = null
    selectedProduct.value = null

    try {
      const { data } = await productsApi.getProductDetail(productId)
      const product = new ProductResponse(data)
      selectedProduct.value = product
      productDetails.value = {
        ...productDetails.value,
        [productId]: product,
      }
      if (product.slug) {
        productDetails.value = {
          ...productDetails.value,
          [product.slug]: product,
        }
      }
      return product
    } catch (e) {
      error.value = e
      selectedProduct.value = null
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    total,
    facets,
    loading,
    error,
    selectedProduct,
    productDetails,
    loadList,
    loadDetail,
  }
})
