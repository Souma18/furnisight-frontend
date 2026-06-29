import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWishlistStore } from '@features/account/store/wishlistStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { productsApi, CategoryResponse } from '@shared/lib/api/services'
import { useLocaleStore } from '@shared/stores/localeStore'
import {
  buildActiveProductTags,
  buildProductListParams,
  createDefaultProductFilters,
  parseProductListQueryPreset,
} from './productListFilters'
import { useProducts } from './useProducts'
import { useToast } from '@shared/composables/useToast'

function mapCategoryToOption(raw = {}) {
  const category = new CategoryResponse(raw)
  const productCount = Number(category.productCount || 0)

  return {
    id: category.id,
    slug: category.slug || category.id,
    label: category.name,
    name: category.name,
    parentId: category.parentId,
    path: category.path,
    productCount,
    count: productCount,
  }
}

export function useProductListPage() {
  const route = useRoute()
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  const localeStore = useLocaleStore()
  const { locale } = storeToRefs(localeStore)
  const { items, total, facets, loading, loadList } = useProducts()
  const { show: showToast } = useToast()
  const searchKeyword = ref('')
  const selectedCategory = ref('all')
  const selectedSubcategory = ref('all')
  const sortBy = ref('popular')
  const viewMode = ref('grid')
  const saleOnly = ref(false)
  const apiError = ref(false)
  const wishedProductIds = computed(() => wishlistStore.wishlistProductIds)
  const dynamicQuickFilters = ref([])
  const sidebarCategories = ref([])
  const allCategories = ref([])

  const appliedFilters = ref(createDefaultProductFilters())

  function categoryDisplayName(slug) {
    const key = String(slug ?? '').toLowerCase()
    if (!key || key === 'all') return ''
    const source = [...dynamicQuickFilters.value, ...sidebarCategories.value, ...allCategories.value]
    const category = source.find((item) => String(item.slug ?? item.id ?? '').toLowerCase() === key)
    return category?.label || category?.name || ''
  }

  const activeTags = computed(() => {
    const categoryTags = [
      categoryDisplayName(selectedCategory.value),
      categoryDisplayName(selectedSubcategory.value),
    ].filter(Boolean)

    return [
      ...categoryTags,
      ...buildActiveProductTags({
        appliedFilters: appliedFilters.value,
        saleOnly: saleOnly.value,
        searchKeyword: searchKeyword.value,
        selectedCategory: 'all',
        selectedSubcategory: 'all',
      }),
    ]
  })

  function parseQueryPreset() {
    const preset = parseProductListQueryPreset(route.query)
    applyCategorySelection(preset.selectedCategory)
    searchKeyword.value = preset.searchKeyword
  }

  function applyCategorySelection(slug) {
    const key = String(slug || 'all').trim().toLowerCase()
    if (!key || key === 'all') {
      selectedCategory.value = 'all'
      selectedSubcategory.value = 'all'
      return
    }

    const category = findCategory(key)
    if (category?.parentId) {
      const parent = findCategory(category.parentId)
      selectedCategory.value = parent?.slug || parent?.id || 'all'
      selectedSubcategory.value = category.slug || category.id || key
      return
    }

    selectedCategory.value = category?.slug || category?.id || key
    selectedSubcategory.value = 'all'
  }

  function findCategory(key) {
    const normalized = String(key ?? '').trim().toLowerCase()
    return allCategories.value.find((item) =>
      [item.slug, item.id, item.name, item.label]
        .filter(Boolean)
        .some((value) => String(value).trim().toLowerCase() === normalized),
    )
  }

  async function loadAllCategories() {
    try {
      const { data } = await productsApi.getCategories()
      allCategories.value = (Array.isArray(data) ? data : []).map(mapCategoryToOption)
    } catch (e) {
      allCategories.value = []
      apiError.value = true
    }
  }

  async function loadQuickFilters() {
    try {
      const { data } = await productsApi.getRootCategories()
      const chips = data.map((item) => {
        const category = new CategoryResponse(item)
        return { label: category.name, slug: category.slug ?? category.id }
      })
      dynamicQuickFilters.value = [{ label: 'Tất cả', slug: 'all' }, ...chips]
    } catch (e) {
      dynamicQuickFilters.value = [{ label: 'Tất cả', slug: 'all' }]
    }
  }

  async function loadSidebarCategories(rootSlug) {
    try {
      if (!rootSlug || rootSlug === 'all') {
        sidebarCategories.value = allCategories.value.filter((category) => category.parentId)
        return
      }

      const { data } = await productsApi.getSubcategories(rootSlug)
      sidebarCategories.value = (Array.isArray(data) ? data : []).map(mapCategoryToOption)
    } catch (e) {
      sidebarCategories.value = []
    }
  }

  // Always use API-loaded sidebar categories, never change them based on search results
  const enrichedFacets = computed(() => {
    const base = facets.value || {}
    return { ...base, categories: sidebarCategories.value }
  })

  function toggleCategory(chip) {
    suppressCategoryWatch.value = true
    selectedCategory.value = selectedCategory.value === chip.slug ? 'all' : chip.slug
    selectedSubcategory.value = 'all'
    loadSidebarCategories(selectedCategory.value).finally(() => {
      suppressCategoryWatch.value = false
    })
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
      showToast('Không thể cập nhật danh sách yêu thích', 'error')
    }
  }

  const suppressListWatch = ref(false)
  const suppressCategoryWatch = ref(false)

  // Watch root category changes to load subcategories
  watch(selectedCategory, (newCat) => {
    if (suppressCategoryWatch.value) return
    selectedSubcategory.value = 'all'
    loadSidebarCategories(newCat)
  })

  watch([searchKeyword, sortBy, saleOnly], () => {
    if (suppressListWatch.value) return
    requestList()
  })

  watch(() => route.query, async () => {
    suppressListWatch.value = true
    suppressCategoryWatch.value = true
    parseQueryPreset()
    await loadSidebarCategories(selectedCategory.value)
    suppressCategoryWatch.value = false
    suppressListWatch.value = false
    requestList()
  }, { deep: true })

  watch(locale, async () => {
    suppressListWatch.value = true
    suppressCategoryWatch.value = true
    await loadAllCategories()
    applyCategorySelection(selectedSubcategory.value !== 'all' ? selectedSubcategory.value : selectedCategory.value)
    await loadQuickFilters()
    await loadSidebarCategories(selectedCategory.value)
    suppressCategoryWatch.value = false
    suppressListWatch.value = false
    requestList()
  })

  const dynamicHero = computed(() => {
    if (selectedCategory.value === 'all') {
      const categoryCount = sidebarCategories.value.length || facets.value.categories?.length || 0

      return {
        breadcrumb: ['Trang chủ', 'Sản phẩm'],
        title: 'Bộ sưu tập nội thất',
        subtitle: facets.value.description ?? 'Khám phá danh mục nội thất đa dạng của chúng tôi',
        stats: [
          { label: 'Sản phẩm', value: total.value },
          { label: 'Danh mục', value: categoryCount },
          { label: 'Đánh giá', value: facets.value.avgRating ? Number(facets.value.avgRating).toFixed(1) : '—' }
        ]
      }
    }
    
    const rootLabel = categoryDisplayName(selectedCategory.value) || 'Sản phẩm'
    const subLabel = categoryDisplayName(selectedSubcategory.value)
    const label = subLabel || rootLabel
    
    return {
      breadcrumb: ['Trang chủ', 'Sản phẩm', rootLabel, ...(subLabel ? [subLabel] : [])],
      title: label,
      subtitle: `${label} tinh tế và hiện đại`,
      stats: [
        { label: 'Sản phẩm', value: total.value },
        { label: 'Màu sắc', value: facets.value.colors?.length || 0 },
        { label: 'Chất liệu', value: facets.value.materials?.length || 0 }
      ]
    }
  })

  onMounted(async () => {
    suppressListWatch.value = true
    suppressCategoryWatch.value = true
    apiError.value = false
    await loadAllCategories()
    parseQueryPreset()
    await loadQuickFilters()
    await loadSidebarCategories(selectedCategory.value)
    suppressCategoryWatch.value = false
    suppressListWatch.value = false
    requestList()

    if (authStore.isAuthenticated) {
      wishlistStore.loadWishlist().catch(() => [])
    }
  })

  function reloadPage() {
    apiError.value = false
    loadAllCategories().then(() => {
      loadQuickFilters()
      loadSidebarCategories(selectedCategory.value)
      requestList()
    })
  }

  return {
    items,
    total,
    facets: enrichedFacets,
    loading,
    searchKeyword,
    selectedRootCategory: computed(() => selectedCategory.value),
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
    apiError,
    toggleCategory,
    selectSidebarCategory,
    onApplySidebar,
    onClearFilters,
    favoriteProduct,
    reloadPage,
  }
}
