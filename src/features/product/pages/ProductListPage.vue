<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductListFiltersSidebar from '../components/ProductListFiltersSidebar.vue'
import ProductListGrid from '../components/ProductListGrid.vue'
import ProductListHeroSection from '../components/ProductListHeroSection.vue'
import ProductListToolbar from '../components/ProductListToolbar.vue'
import { useProducts } from '../composables/useProducts'
import { PRODUCT_CATEGORY_HERO, PRODUCT_QUICK_FILTERS } from '../mock/productListMockData'
import '../styles/productList.css'

const route = useRoute()
const { items, total, loading, loadList } = useProducts()
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
  const qBreadcrumb = String(route.query.breadcrumb ?? '').trim().toLowerCase()
  if (!qBreadcrumb || qBreadcrumb === 'sản phẩm') return
  const map = {
    'phòng ngủ': 'giường ngủ',
    ghế: 'ghế',
    sofa: 'sofa',
    'bàn trà': 'bàn trà',
  }
  selectedCategory.value = map[qBreadcrumb] ?? 'all'
}

const CHIP_CATEGORY = {
  'giường ngủ': 'giường ngủ',
  'tủ quần áo': 'tủ quần áo',
  'đầu tủ': 'đầu tủ & kệ',
  'bàn trang điểm': 'bàn trang điểm',
  'đèn ngủ': 'đèn & phụ kiện',
}

function toggleCategory(chip) {
  const key = chip.toLowerCase()
  if (key.includes('sale')) {
    saleOnly.value = !saleOnly.value
    return
  }
  const cat = CHIP_CATEGORY[key] ?? key
  selectedCategory.value = selectedCategory.value === cat ? 'all' : cat
}

function selectSidebarCategory(id) {
  selectedCategory.value = String(id).toLowerCase()
}

function onApplySidebar(payload) {
  appliedFilters.value = { ...defaultAppliedFilters(), ...payload }
}

function onClearFilters() {
  appliedFilters.value = defaultAppliedFilters()
  saleOnly.value = false
  selectedCategory.value = 'all'
  searchKeyword.value = ''
}

function requestList() {
  const f = appliedFilters.value
  loadList({
    q: searchKeyword.value,
    category: selectedCategory.value,
    sort: sortBy.value,
    priceBands: f.priceBands,
    priceSliderPct: f.priceSliderPct,
    materials: f.materials,
    colors: f.colors,
    minStar: f.minStar,
    saleOnly: saleOnly.value,
  })
}

const suppressListWatch = ref(false)

watch([searchKeyword, selectedCategory, sortBy, appliedFilters, saleOnly], () => {
  if (suppressListWatch.value) return
  requestList()
}, { deep: true })

onMounted(() => {
  suppressListWatch.value = true
  parseQueryPreset()
  suppressListWatch.value = false
  requestList()
})
</script>

<template>
  <section class="products-page">
    <ProductListHeroSection
      :breadcrumb="PRODUCT_CATEGORY_HERO.breadcrumb"
      :collection="PRODUCT_CATEGORY_HERO.collection"
      :title="PRODUCT_CATEGORY_HERO.title"
      :subtitle="PRODUCT_CATEGORY_HERO.subtitle"
      :stats="PRODUCT_CATEGORY_HERO.stats"
    />

    <ProductListToolbar
      v-model="searchKeyword"
      :quick-filters="PRODUCT_QUICK_FILTERS"
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
