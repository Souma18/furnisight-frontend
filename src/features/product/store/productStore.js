import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchProductsMock } from '../api/productApi'

export const useProductStore = defineStore('product', () => {
  const items = ref([])
  const total = ref(0)
  const facets = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function loadList(params) {
    loading.value = true
    error.value = null
    try {
      // TODO(BE): switch to fetchProducts(params) when backend endpoint is ready.
      const { data } = await fetchProductsMock(params)
      items.value = data?.items ?? data ?? []
      total.value = data?.total ?? items.value.length
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

  return { items, total, facets, loading, error, loadList }
})
