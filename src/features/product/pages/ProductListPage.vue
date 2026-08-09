<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ProductListFiltersSidebar from '../components/ProductListFiltersSidebar.vue'
import ProductListGrid from '../components/ProductListGrid.vue'
import ProductListHeroSection from '../components/ProductListHeroSection.vue'
import ProductListToolbar from '../components/ProductListToolbar.vue'
import AppPagination from '@shared/ui/AppPagination.vue'
import { useProductListPage } from '../composables/useProductListPage'
import { useI18n } from 'vue-i18n'
import '../styles/productList.css'

const { t } = useI18n()

const {
  items,
  total,
  facets,
  loading,
  searchKeyword,
  currentPage,
  selectedRootCategory,
  selectedCategory,
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
  apiError,
  reloadPage,
} = useProductListPage()

const filterDrawerOpen = ref(false)
const activeFilterCount = computed(() => {
  const applied = appliedFilters.value || {}
  return [
    searchKeyword.value?.trim(),
    selectedCategory.value !== 'all',
    selectedRootCategory.value !== 'all',
    saleOnly.value,
    ...(applied.priceBands || []),
    ...(applied.materials || []),
    ...(applied.colors || []),
    applied.minStar,
  ].filter(Boolean).length
})

function closeFilters() {
  filterDrawerOpen.value = false
}

function applySidebarAndClose(payload) {
  onApplySidebar(payload)
  closeFilters()
}
</script>

<template>
  <section class="products-page">
    <ProductListHeroSection
      :breadcrumb="dynamicHero.breadcrumb"
      :title="dynamicHero.title"
      :subtitle="dynamicHero.subtitle"
      :stats="dynamicHero.stats"
    />

    <ProductListToolbar
      v-model="searchKeyword"
      :quick-filters="dynamicQuickFilters"
      :selected-category="selectedRootCategory"
      :sale-only="saleOnly"
      :view-mode="viewMode"
      :active-filter-count="activeFilterCount"
      @toggle-category="toggleCategory"
      @update:view-mode="viewMode = $event"
      @open-filters="filterDrawerOpen = true"
    />

    <ProductListFiltersSidebar
      mode="drawer"
      :open="filterDrawerOpen"
      :selected-category="selectedCategory"
      :applied="appliedFilters"
      :facets="facets"
      @select-category="selectSidebarCategory"
      @apply="applySidebarAndClose"
      @clear="onClearFilters"
      @close="closeFilters"
    />

    <main class="pl-inner pl-page-body">
      <div class="pl-products-panel">
        <div v-if="apiError" class="pl-api-error">
          <AppIcon name="alert" :size="18" />
          <span>{{ t('products.errors.apiConn') }}</span>
          <AppButton type="button" class="pl-api-error-retry" @click="reloadPage">{{ t('products.errors.retry') }}</AppButton>
        </div>
        <ProductListGrid
          :products="items"
          :total="total"
          :active-tags="activeTags"
          :view-mode="viewMode"
          :loading="loading"
          :wished-product-ids="wishedProductIds"
          @toggle-wish="favoriteProduct"
          @clear="onClearFilters"
        />
        
        <AppPagination 
          v-model:current-page="currentPage" 
          :total="total" 
          :page-size="24"
        />
      </div>
    </main>
  </section>
</template>
