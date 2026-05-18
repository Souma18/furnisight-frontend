<script setup>
import ProductListFiltersSidebar from '../components/ProductListFiltersSidebar.vue'
import ProductListGrid from '../components/ProductListGrid.vue'
import ProductListHeroSection from '../components/ProductListHeroSection.vue'
import ProductListToolbar from '../components/ProductListToolbar.vue'
import { useProductListPage } from '../composables/useProductListPage'
import '../styles/productList.css'

const {
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
} = useProductListPage()
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
