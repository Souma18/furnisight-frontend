import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { productsApi, CategoryResponse } from '@shared/lib/api/services'
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

  function defaultAppliedFilters() {
    return {
      priceBands: [],
      priceSliderPct: 100,
      materials: [],
      colors: [],
      minStar: null,
    }
  }

  const appliedFilters = ref(defaultAppliedFilters())

  const activeTags = computed(() => {
    const tags = []
    if (selectedCategory.value !== 'all') tags.push(selectedCategory.value)
    if (selectedSubcategory.value !== 'all') tags.push(selectedSubcategory.value)
    if (searchKeyword.value.trim()) tags.push(`"${searchKeyword.value.trim()}"`)
    if (saleOnly.value) tags.push('Sale')
    const f = appliedFilters.value
    if (f.materials?.length) tags.push(`${f.materials.length} chất liệu`)
    if (f.colors?.length) tags.push(`${f.colors.length} màu`)
    if (f.minStar != null) tags.push(`${f.minStar}+ sao`)
    if (f.priceBands?.length) tags.push('Khoảng giá')
    return tags
  })

  function parseQueryPreset() {
    const qCategory = String(route.query.category ?? '').trim()
    const qBreadcrumb = String(route.query.breadcrumb ?? '').trim()
    const qKeyword = String(route.query.q ?? '').trim()

    if (qCategory && qCategory !== 'all') {
      selectedCategory.value = qCategory
    } else if (qBreadcrumb && qBreadcrumb !== 'sản phẩm') {
      selectedCategory.value = qBreadcrumb || 'all'
    } else {
      selectedCategory.value = 'all'
    }

    if (qKeyword) {
      searchKeyword.value = qKeyword
    } else {
      searchKeyword.value = ''
    }
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
    appliedFilters.value = { ...defaultAppliedFilters(), ...payload }
    requestList()
  }

  function onClearFilters() {
    appliedFilters.value = defaultAppliedFilters()
    saleOnly.value = false
    selectedCategory.value = 'all'
    selectedSubcategory.value = 'all'
    searchKeyword.value = ''
    requestList()
  }

  function requestList() {
    const f = appliedFilters.value

    // Determine which category slug to send to the API
    let categorySlug = ''
    if (selectedSubcategory.value !== 'all') {
      categorySlug = selectedSubcategory.value
    } else if (selectedCategory.value !== 'all') {
      categorySlug = selectedCategory.value
    }

    loadList({
      ...(searchKeyword.value ? { q: searchKeyword.value } : {}),
      ...(categorySlug ? { category: categorySlug } : {}),
      sort: sortBy.value,
      ...(f.priceBands?.length ? { priceBands: f.priceBands } : {}),
      ...(f.priceSliderPct < 100 ? { priceSliderPct: f.priceSliderPct } : {}),
      ...(f.materials?.length ? { materials: f.materials } : {}),
      ...(f.colors?.length ? { colors: f.colors } : {}),
      ...(f.minStar != null ? { minStar: f.minStar } : {}),
      ...(saleOnly.value ? { saleOnly: true } : {}),
    })
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
