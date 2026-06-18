<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
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
        <div v-if="apiError" class="pl-api-error">
          <AppIcon name="alert" :size="18" />
          <span>Không thể kết nối máy chủ. Dữ liệu có thể không đầy đủ.</span>
          <button type="button" class="pl-api-error-retry" @click="reloadPage">Tải lại</button>
        </div>
        <ProductListGrid
          :products="items"
          :total="total"
          :active-tags="activeTags"
          :sort-by="sortBy"
          :view-mode="viewMode"
          :loading="loading"
          :wished-product-ids="wishedProductIds"
          @update:sort-by="sortBy = $event"
          @toggle-wish="favoriteProduct"
        />
      </div>
    </div>
  </section>
</template>
