<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductListFiltersSidebar from '../components/ProductListFiltersSidebar.vue'
import ProductListGrid from '../components/ProductListGrid.vue'
import ProductListHeroSection from '../components/ProductListHeroSection.vue'
import ProductListToolbar from '../components/ProductListToolbar.vue'
import { useProducts } from '../composables/useProducts'
import { PRODUCT_CATEGORY_HERO } from '../mock/productListMockData'
import { fetchCategories } from '../api/productApi'
import '../styles/productList.css'

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

// Maps various display names / breadcrumb labels to their BE category slug
const CATEGORY_SLUG_MAP = {
  // Vietnamese
  'phòng khách': 'living-room',
  'phòng ngủ': 'bedroom',
  'phòng ăn': 'dining-room',
  'phòng bếp': 'dining-room',
  'không gian làm việc': 'workspace',
  'làm việc': 'workspace',
  'sofa': 'sofa',
  'bàn trà': 'coffee-table',
  'giường ngủ': 'bed',
  'tủ quần áo': 'wardrobe',
  'bàn ăn': 'dining-table',
  'ghế ăn': 'dining-chair',
  'bàn làm việc': 'desk',
  'ghế văn phòng': 'office-chair',
  // English (breadcrumb or URL)
  'living room': 'living-room',
  'living-room': 'living-room',
  'bedroom': 'bedroom',
  'dining room': 'dining-room',
  'dining-room': 'dining-room',
  'workspace': 'workspace',
  'sofa': 'sofa',
  'coffee table': 'coffee-table',
  'coffee-table': 'coffee-table',
  'bed': 'bed',
  'wardrobe': 'wardrobe',
  'dining table': 'dining-table',
  'dining-table': 'dining-table',
  'dining chair': 'dining-chair',
  'dining-chair': 'dining-chair',
  'desk': 'desk',
  'office chair': 'office-chair',
  'office-chair': 'office-chair',
}

function toSlug(value) {
  if (!value || value === 'all') return ''
  const key = String(value).trim().toLowerCase()
  return CATEGORY_SLUG_MAP[key] ?? key // if already a slug like 'living-room', return as-is
}

function parseQueryPreset() {
  // ?category=slug takes priority (set by sidebar navigation / HomeRoomsSection)
  const qCategory = String(route.query.category ?? '').trim()
  if (qCategory && qCategory !== 'all') {
    selectedCategory.value = qCategory
    return
  }
  // ?breadcrumb=display-name (legacy – set by older navigation)
  const qBreadcrumb = String(route.query.breadcrumb ?? '').trim().toLowerCase()
  if (qBreadcrumb && qBreadcrumb !== 'sản phẩm') {
    selectedCategory.value = toSlug(qBreadcrumb) || 'all'
  }
  // ?q=keyword
  const qKeyword = String(route.query.q ?? '').trim()
  if (qKeyword) searchKeyword.value = qKeyword
}

const dynamicQuickFilters = ref([])

async function loadQuickFilters() {
  try {
    const { data } = await fetchCategories()
    // Filter for top-level categories (parentId is null)
    const topLevel = data.filter(c => !c.parentId)
    const chips = topLevel.map(c => c.name)
    chips.push('Sale -30%')
    dynamicQuickFilters.value = chips
  } catch (e) {
    console.error('Failed to load quick filters', e)
    // Fallback to something reasonable
    dynamicQuickFilters.value = ['Phòng khách', 'Phòng ngủ', 'Phòng ăn', 'Làm việc', 'Sale -30%']
  }
}

const CHIP_CATEGORY = {
  'giường ngủ': 'bed',
  'tủ quần áo': 'wardrobe',
  'phòng khách': 'living-room',
  'phòng ngủ': 'bedroom',
  'phòng ăn': 'dining-room',
  'phòng bếp': 'dining-room',
  'làm việc': 'workspace',
  'workspace': 'workspace'
}

function toggleCategory(chip) {
  const key = chip.toLowerCase()
  if (key.includes('sale')) {
    saleOnly.value = !saleOnly.value
    requestList() // immediate update
    return
  }
  const slug = toSlug(key)
  selectedCategory.value = selectedCategory.value === slug ? 'all' : slug
  requestList() // immediate update
}

function selectSidebarCategory(id) {
  selectedCategory.value = String(id).toLowerCase()
}

function onApplySidebar(payload) {
  appliedFilters.value = { ...defaultAppliedFilters(), ...payload }
  requestList() // explicit call to avoid watch timing issues
}

function onClearFilters() {
  appliedFilters.value = defaultAppliedFilters()
  saleOnly.value = false
  selectedCategory.value = 'all'
  searchKeyword.value = ''
  requestList() // explicit call
}

function requestList() {
  const f = appliedFilters.value
  const categorySlug = toSlug(selectedCategory.value) // '' means no filter
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

// Watch for simple value changes (category, sort, keyword, saleOnly)
// appliedFilters is handled explicitly in onApplySidebar/onClearFilters
watch([searchKeyword, selectedCategory, sortBy, saleOnly], () => {
  if (suppressListWatch.value) return
  requestList()
})

const dynamicHero = computed(() => {
  if (selectedCategory.value === 'all') {
    return {
      breadcrumb: ['Trang chủ', 'Sản phẩm'],
      title: 'Tất cả sản phẩm',
      subtitle: 'Khám phá bộ sưu tập nội thất đa dạng của chúng tôi',
      collection: 'Bộ sưu tập 2026',
      stats: [
        { label: 'Sản phẩm', value: total.value },
        { label: 'Danh mục', value: facets.value.categories?.length || 0 },
        { label: 'Đánh giá', value: '4.8' }
      ]
    }
  }
  
  const cat = facets.value.categories?.find(c => c.slug === selectedCategory.value)
  const label = cat ? cat.label : selectedCategory.value
  
  return {
    breadcrumb: ['Trang chủ', 'Sản phẩm', label],
    title: label,
    subtitle: `Bộ sưu tập ${label} tinh tế và hiện đại`,
    collection: 'Interior Design',
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
</script>

<template>
  <section class="products-page">
    <ProductListHeroSection
      :breadcrumb="dynamicHero.breadcrumb"
      :collection="dynamicHero.collection"
      :title="dynamicHero.title"
      :subtitle="dynamicHero.subtitle"
      :stats="dynamicHero.stats"
    />

    <ProductListToolbar
      v-model="searchKeyword"
      :quick-filters="dynamicQuickFilters"
      :selected-category="selectedCategory"
      :sale-only="saleOnly"
      :view-mode="viewMode"
      @toggle-category="toggleCategory"
      @update:view-mode="viewMode = $event"
    />

    <div class="pl-inner pl-page-body">
      <ProductListFiltersSidebar
        :selected-category="selectedCategory"
        :applied="appliedFilters"
        :facets="facets"
        @select-category="selectSidebarCategory"
        @apply="onApplySidebar"
        @clear="onClearFilters"
      />
      <div class="pl-products-panel">
        <ProductListGrid
          :products="items"
          :total="total"
          :active-tags="activeTags"
          :sort-by="sortBy"
          :view-mode="viewMode"
          :loading="loading"
          @update:sort-by="sortBy = $event"
        />
      </div>
    </div>
  </section>
</template>
