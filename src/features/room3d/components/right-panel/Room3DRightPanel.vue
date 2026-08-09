<script setup>
import AppInput from "@shared/ui/AppInput.vue";
import { useI18n } from "vue-i18n";
import Room3DCartSection from "./Room3DCartSection.vue";
import Room3DProductGroup from "./Room3DProductGroup.vue";
import Room3DSearchPanel from "./Room3DSearchPanel.vue";
import AppIcon from "@shared/ui/AppIcon.vue";
import { useRoom3DRightPanel } from "../../composables/useRoom3DRightPanel";

const props = defineProps({
  selectedRoom: {
    type: Object,
    default: null,
  },
  selectedCategory: {
    type: String,
    default: "all",
  },
  searchKeyword: {
    type: String,
    default: "",
  },
  productFilters: {
    type: Array,
    default: () => [],
  },
  filteredProducts: {
    type: Array,
    default: () => [],
  },
  recommendationError: {
    type: String,
    default: "",
  },
  cartItems: {
    type: Array,
    default: () => [],
  },
  placedProductIds: {
    type: Array,
    default: () => [],
  },
  cartTotal: {
    type: Number,
    default: 0,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
  productColumns: {
    type: Number,
    default: 2,
  },
  productCardStep: {
    type: Number,
    default: 0,
  },
  showAllRooms: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "search-change",
  "category-change",
  "add-product",
  "open-product",
  "remove-product",
  "open-checkout",
  "toggle-show-all-rooms",
]);

const { t } = useI18n();
const { searchKeywordLower, searchResults, subCategories, openGroups, toggleGroup } = useRoom3DRightPanel(props);
</script>

<template>
  <aside class="panel">
    <Room3DSearchPanel
      :search-keyword="searchKeyword"
      :filtered-products-count="filteredProducts.length"
      :show-all-rooms="showAllRooms"
      @search-change="$emit('search-change', $event)"
      @toggle-show-all-rooms="$emit('toggle-show-all-rooms')"
    />

    <div class="products-scroll">
      <div
        v-if="recommendationError"
        class="products-empty products-empty--error"
      >
        {{ recommendationError }}
      </div>
      <div v-else-if="filteredProducts.length === 0" class="products-empty">
        {{ t("room3d.products.empty") }}
      </div>
      <div v-else class="accordion-container">
        <!-- Nhóm 1: Kết quả tìm kiếm -->
        <Room3DProductGroup
          v-if="searchKeywordLower"
          group-id="search"
          icon="search"
          :title="t('room3d.products.searchMatched')"
          :products="searchResults"
          :empty-message="t('room3d.products.searchEmpty')"
          :open-groups="openGroups"
          :product-columns="productColumns"
          :product-card-step="productCardStep"
          :placed-product-ids="placedProductIds"
          :selected-room="selectedRoom"
          :cart-items="cartItems"
          @toggle="toggleGroup"
          @add-product="$emit('add-product', $event)"
          @open-product="$emit('open-product', $event)"
        />

        <!-- Nhóm 2: Tất cả -->
        <Room3DProductGroup
          group-id="all"
          icon="box"
          :title="t('room3d.products.all')"
          :products="filteredProducts"
          :open-groups="openGroups"
          :product-columns="productColumns"
          :product-card-step="productCardStep"
          :placed-product-ids="placedProductIds"
          :selected-room="selectedRoom"
          :cart-items="cartItems"
          @toggle="toggleGroup"
          @add-product="$emit('add-product', $event)"
          @open-product="$emit('open-product', $event)"
        />

        <!-- Nhóm 3: Danh mục con -->
        <Room3DProductGroup
          v-for="group in subCategories"
          :key="group.name"
          :group-id="'cat-' + group.name"
          icon="folder"
          :title="group.name"
          :products="group.items"
          :open-groups="openGroups"
          :product-columns="productColumns"
          :product-card-step="productCardStep"
          :placed-product-ids="placedProductIds"
          :selected-room="selectedRoom"
          :cart-items="cartItems"
          @toggle="toggleGroup"
          @add-product="$emit('add-product', $event)"
          @open-product="$emit('open-product', $event)"
        />
      </div>
    </div>

    <div class="panel-cart">
      <Room3DCartSection
        :cart-items="cartItems"
        :cart-total="cartTotal"
        :format-currency="formatCurrency"
        @remove="$emit('remove-product', $event)"
        @checkout="$emit('open-checkout')"
      />
    </div>
  </aside>
</template>
