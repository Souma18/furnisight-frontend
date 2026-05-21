import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchProducts } from '../api/productApi'

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
      const { data } = await fetchProducts(params)
      items.value = data?.products ?? data?.content ?? []
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

  return { items, total, facets, loading, error, loadList }
})
