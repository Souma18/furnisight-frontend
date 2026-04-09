import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchProducts } from '../api/productApi'

export const useProductStore = defineStore('product', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadList(params) {
    loading.value = true
    error.value = null
    try {
      const { data } = await fetchProducts(params)
      items.value = data?.items ?? data ?? []
    } catch (e) {
      error.value = e
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, loadList }
})
