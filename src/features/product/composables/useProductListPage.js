import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { productsApi, CategoryResponse } from '@shared/lib/api/services'
import {
  buildActiveProductTags,
  buildProductListParams,
  createDefaultProductFilters,
  parseProductListQueryPreset,
} from './productListFilters'
import { useProducts } from './useProducts'

export function useProductListPage() {
  const route = useRoute()
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  const { items, total, facets, loading, loadList } = useProducts()
  const searchKeyword = ref('')
  const selectedCategory = ref('all')
  const selectedSubcategory = ref('all')
  const sortBy = ref('popular')
  const viewMode = ref('grid')
  const saleOnly = ref(false)
  const wishedProductIds = computed(() => wishlistStore.wishlistProductIds)

  const appliedFilters = ref(createDefaultProductFilters())

  const activeTags = computed(() => buildActiveProductTags({
    appliedFilters: appliedFilters.value,
    saleOnly: saleOnly.value,
    searchKeyword: searchKeyword.value,
    selectedCategory: selectedCategory.value,
    selectedSubcategory: selectedSubcategory.value,
  }))

  function parseQueryPreset() {
    const preset = parseProductListQueryPreset(route.query)
    selectedCategory.value = preset.selectedCategory
    searchKeyword.value = preset.searchKeyword
  }

  const dynamicQuickFilters = ref([])
  const sidebarCategories = ref([])

  async function loadQuickFilters() {
    try {
      const { data } = await productsApi.getRootCategories()
      const chips = data.map((item) => {
        const category = new CategoryResponse(item)
        return { label: category.name, slug: category.slug ?? category.id }
      })
      chips.push({ label: 'Sale -30%', slug: 'sale' })
      dynamicQuickFilters.value = chips
    } catch (e) {
      console.error('Failed to load quick filters', e)
      dynamicQuickFilters.value = []
    }
  }

  async function loadSidebarCategories(rootSlug) {
    try {
      let data
      if (!rootSlug || rootSlug === 'all') {
        const res = await productsApi.getCategories()
        data = res.data.filter(c => c.parentId)
      } else {
        const res = await productsApi.getSubcategories(rootSlug)
        data = res.data
      }
      sidebarCategories.value = data.map((item) => {
        const category = new CategoryResponse(item)
        return {
          id: category.slug ?? category.id,
          slug: category.slug ?? category.id,
          label: category.name,
          count: category.productCount || 0,
        }
      })
    } catch (e) {
      console.error('Failed to load subcategories', e)
      sidebarCategories.value = []
    }
  }

  // Always use API-loaded sidebar categories, never change them based on search results
  const enrichedFacets = computed(() => {
    const base = facets.value || {}
    return { ...base, categories: sidebarCategories.value }
  })

  function toggleCategory(chip) {
    if (chip.slug === 'sale') {
      saleOnly.value = !saleOnly.value
      requestList()
      return
    }
    selectedCategory.value = selectedCategory.value === chip.slug ? 'all' : chip.slug
    selectedSubcategory.value = 'all'
    requestList()
  }

  function selectSidebarCategory(id) {
    const slug = String(id).toLowerCase()
    if (slug === 'all') {
      selectedSubcategory.value = 'all'
    } else {
      selectedSubcategory.value = slug
    }
    requestList()
  }

  function onApplySidebar(payload) {
    appliedFilters.value = { ...createDefaultProductFilters(), ...payload }
    requestList()
  }

  function onClearFilters() {
    appliedFilters.value = createDefaultProductFilters()
    saleOnly.value = false
    selectedCategory.value = 'all'
    selectedSubcategory.value = 'all'
    searchKeyword.value = ''
    requestList()
  }

  function requestList() {
    loadList(buildProductListParams({
      appliedFilters: appliedFilters.value,
      saleOnly: saleOnly.value,
      searchKeyword: searchKeyword.value,
      selectedCategory: selectedCategory.value,
      selectedSubcategory: selectedSubcategory.value,
      sortBy: sortBy.value,
    }))
  }

  async function favoriteProduct(productId) {
    if (!productId) return

    if (!authStore.isAuthenticated) {
      openAuthModal()
      return
    }

    try {
      if (wishlistStore.hasFavoriteProduct(productId)) {
        await wishlistStore.removeFavorite(productId)
      } else {
        await wishlistStore.addFavorite(productId)
      }
    } catch (e) {
      console.error('Failed to toggle favorite list product:', e)
    }
  }

  const suppressListWatch = ref(false)

  // Watch root category changes to load subcategories
  watch(selectedCategory, (newCat) => {
    selectedSubcategory.value = 'all'
    loadSidebarCategories(newCat)
  })

  watch([searchKeyword, sortBy, saleOnly], () => {
    if (suppressListWatch.value) return
    requestList()
  })

  watch(() => route.query, () => {
    suppressListWatch.value = true
    parseQueryPreset()
    suppressListWatch.value = false
    requestList()
  }, { deep: true })

  const dynamicHero = computed(() => {
    if (selectedCategory.value === 'all') {
      return {
        breadcrumb: ['Trang chủ', 'Sản phẩm'],
        title: 'Tất cả sản phẩm',
        subtitle: facets.value.description ?? 'Khám phá danh mục nội thất đa dạng của chúng tôi',
        stats: [
          { label: 'Sản phẩm', value: total.value },
          { label: 'Danh mục', value: facets.value.categories?.length || 0 },
          { label: 'Đánh giá', value: facets.value.avgRating ? Number(facets.value.avgRating).toFixed(1) : '5.0' }
        ]
      }
    }
    
    const catFromQuick = dynamicQuickFilters.value.find(c => c.slug === selectedCategory.value)
    const label = catFromQuick?.label ?? selectedCategory.value
    
    return {
      breadcrumb: ['Trang chủ', 'Sản phẩm', label],
      title: label,
      subtitle: `${label} tinh tế và hiện đại`,
      stats: [
        { label: 'Sản phẩm', value: total.value },
        { label: 'Màu sắc', value: facets.value.colors?.length || 0 },
        { label: 'Chất liệu', value: facets.value.materials?.length || 0 }
      ]
    }
  })

  onMounted(() => {
    suppressListWatch.value = true
    parseQueryPreset()
    loadQuickFilters()
    loadSidebarCategories(selectedCategory.value)
    suppressListWatch.value = false
    requestList()

    if (authStore.isAuthenticated) {
      wishlistStore.loadWishlist().catch(() => [])
    }
  })

  return {
    items,
    total,
    facets: enrichedFacets,
    loading,
    searchKeyword,
    selectedCategory: computed(() =>
      selectedSubcategory.value !== 'all' ? selectedSubcategory.value : selectedCategory.value
    ),
    sortBy,
    viewMode,
    saleOnly,
    appliedFilters,
    activeTags,
    dynamicQuickFilters,
    dynamicHero,
    wishedProductIds,
    toggleCategory,
    selectSidebarCategory,
    onApplySidebar,
    onClearFilters,
    favoriteProduct,
  }
}
