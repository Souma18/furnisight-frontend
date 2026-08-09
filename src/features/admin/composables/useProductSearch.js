import { ref, watch, onUnmounted } from 'vue'
import { productsApi } from '@shared/lib/api/services'

export function useProductSearch() {
  const searchQuery = ref('')
  const activeCat = ref('all')
  const categories = ref([{ id: 'all', name: 'Tất cả' }])
  
  const products = ref([])
  const page = ref(0)
  const loading = ref(false)
  const hasMore = ref(true)

  let searchTimeout = null

  async function loadCategories() {
    try {
      const res = await productsApi.getRootCategories()
      const list = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.content ?? []
      categories.value = [
        { id: 'all', name: 'Tất cả' },
        ...list.map(c => ({ id: c.slug || c.id, name: c.name }))
      ]
    } catch (error) {
      console.error('Failed to load categories', error)
    }
  }

  async function fetchProducts(reset = false) {
    if (loading.value) return
    if (reset) {
      page.value = 0
      products.value = []
      hasMore.value = true
    }

    if (!hasMore.value) return
    loading.value = true

    try {
      const params = { size: 20, page: page.value }
      if (activeCat.value !== 'all') {
        params.category = activeCat.value
      }
      if (searchQuery.value) {
        params.q = searchQuery.value
      }

      const res = await productsApi.getProducts(params)
      const data = res.data
      const items = Array.isArray(data) ? data : data?.items ?? data?.content ?? []
      const totalPages = data?.totalPages ?? 1
      const currentPage = data?.currentPage ?? (page.value + 1)

      if (currentPage >= totalPages) {
        hasMore.value = false
      }

      products.value = reset ? items : [...products.value, ...items]
      page.value++
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      loading.value = false
    }
  }

  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchProducts(true)
    }, 500)
  })

  watch(activeCat, () => {
    fetchProducts(true)
  })

  onUnmounted(() => {
    clearTimeout(searchTimeout)
  })

  function resetSearch() {
    searchQuery.value = ''
    activeCat.value = 'all'
    page.value = 0
    products.value = []
    hasMore.value = true
  }

  return {
    searchQuery,
    activeCat,
    categories,
    products,
    loading,
    hasMore,
    loadCategories,
    fetchProducts,
    resetSearch
  }
}
