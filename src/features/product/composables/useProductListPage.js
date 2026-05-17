import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from './useProducts'
import { fetchCategories } from '../api/productApi'

export function useProductListPage() {
  const route = useRoute()
  const { items, total, facets, loading, loadList } = useProducts()
  const searchKeyword = ref('')
  const selectedCategory = ref('all')
  const sortBy = ref('popular')
  const viewMode = ref('grid')
  const saleOnly = ref(false)

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
    if (qCategory && qCategory !== 'all') {
      selectedCategory.value = qCategory
      return
    }
    const qBreadcrumb = String(route.query.breadcrumb ?? '').trim()
    if (qBreadcrumb && qBreadcrumb !== 'sản phẩm') {
      selectedCategory.value = qBreadcrumb || 'all'
    }
    const qKeyword = String(route.query.q ?? '').trim()
    if (qKeyword) searchKeyword.value = qKeyword
  }

  const dynamicQuickFilters = ref([])

  async function loadQuickFilters() {
    try {
      const { data } = await fetchCategories()
      const topLevel = data.filter(c => !c.parentId)
      const chips = topLevel.map(c => ({ label: c.name, slug: c.slug ?? c.id }))
      chips.push({ label: 'Sale -30%', slug: 'sale' })
      dynamicQuickFilters.value = chips
    } catch (e) {
      console.error('Failed to load quick filters', e)
      dynamicQuickFilters.value = []
    }
  }

  function toggleCategory(chip) {
    if (chip.slug === 'sale') {
      saleOnly.value = !saleOnly.value
      requestList()
      return
    }
    selectedCategory.value = selectedCategory.value === chip.slug ? 'all' : chip.slug
    requestList()
  }

  function selectSidebarCategory(id) {
    selectedCategory.value = String(id).toLowerCase()
  }

  function onApplySidebar(payload) {
    appliedFilters.value = { ...defaultAppliedFilters(), ...payload }
    requestList()
  }

  function onClearFilters() {
    appliedFilters.value = defaultAppliedFilters()
    saleOnly.value = false
    selectedCategory.value = 'all'
    searchKeyword.value = ''
    requestList()
  }

  function requestList() {
    const f = appliedFilters.value
    const categorySlug = selectedCategory.value === 'all' ? '' : selectedCategory.value
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

  const suppressListWatch = ref(false)

  watch([searchKeyword, selectedCategory, sortBy, saleOnly], () => {
    if (suppressListWatch.value) return
    requestList()
  })

  const dynamicHero = computed(() => {
    if (selectedCategory.value === 'all') {
      return {
        breadcrumb: ['Trang chủ', 'Sản phẩm'],
        title: 'Tất cả sản phẩm',
        subtitle: facets.value.description ?? 'Khám phá bộ sưu tập nội thất đa dạng của chúng tôi',
        collection: facets.value.collection ?? 'Bộ sưu tập 2026',
        stats: [
          { label: 'Sản phẩm', value: total.value },
          { label: 'Danh mục', value: facets.value.categories?.length || 0 },
          { label: 'Đánh giá', value: facets.value.avgRating ? Number(facets.value.avgRating).toFixed(1) : '5.0' }
        ]
      }
    }
    
    const catFromFacets = facets.value.categories?.find(c => c.slug === selectedCategory.value || c.id === selectedCategory.value)
    const catFromQuick = dynamicQuickFilters.value.find(c => c.slug === selectedCategory.value)
    
    const label = catFromFacets?.label ?? catFromFacets?.name ?? catFromQuick?.label ?? selectedCategory.value
    
    return {
      breadcrumb: ['Trang chủ', 'Sản phẩm', label],
      title: label,
      subtitle: catFromFacets?.description ?? `Bộ sưu tập ${label} tinh tế và hiện đại`,
      collection: catFromFacets?.collection ?? 'Interior Design',
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
    suppressListWatch.value = false
    requestList()
  })

  return {
    items,
    total,
    facets,
    loading,
    searchKeyword,
    selectedCategory,
    sortBy,
    viewMode,
    saleOnly,
    appliedFilters,
    activeTags,
    dynamicQuickFilters,
    dynamicHero,
    toggleCategory,
    selectSidebarCategory,
    onApplySidebar,
    onClearFilters,
  }
}
