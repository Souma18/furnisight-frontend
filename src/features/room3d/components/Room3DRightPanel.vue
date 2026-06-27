<script setup>
import AppInput from '@shared/ui/AppInput.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import ProductCard3D from './ProductCard3D.vue'
import Room3DCartSection from './Room3DCartSection.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  selectedRoom: {
    type: Object,
    default: null,
  },
  selectedCategory: {
    type: String,
    default: 'all',
  },
  searchKeyword: {
    type: String,
    default: '',
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
    default: '',
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
})

defineEmits([
  'search-change',
  'category-change',
  'add-product',
  'open-product',
  'remove-product',
  'open-checkout',
])

const { t } = useI18n()

const searchKeywordLower = computed(() => (props.searchKeyword || '').trim().toLowerCase())

const searchResults = computed(() => {
  if (!searchKeywordLower.value) return []
  return props.filteredProducts.filter(p => p.name.toLowerCase().includes(searchKeywordLower.value))
})

const subCategories = computed(() => {
  const groups = new Map()
  for (const product of props.filteredProducts) {
    const cat = product.categoryName || 'Khác'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat).push(product)
  }
  return Array.from(groups, ([name, items]) => ({ name, items }))
})

const openGroups = ref(['search', 'all'])

function toggleGroup(id) {
  if (openGroups.value.includes(id)) {
    openGroups.value = openGroups.value.filter(g => g !== id)
  } else {
    openGroups.value.push(id)
  }
}

function isGroupOpen(id) {
  return openGroups.value.includes(id)
}

function getCartQty(productId) {
  return props.cartItems
    .filter((item) => String(item.productId ?? item.id ?? '').split('::')[0] === String(productId))
    .reduce((sum, item) => sum + (item.quantity || 1), 0)
}
</script>

<template>
  <aside class="panel">
    <div class="panel-top">
      <div class="panel-heading">
        <div>
          <span>{{ t('room3d.products.kicker') }}</span>
          <strong>{{ t('room3d.products.title') }}</strong>
        </div>
        <small>{{ t('room3d.products.count', { count: filteredProducts.length }) }}</small>
      </div>

      <div class="search-wrap">
        <span class="search-icon"><AppIcon name="search" :size="16" /></span>
        <AppInput
          class="search-input"
          :value="searchKeyword"
          :placeholder="t('room3d.products.search')"
          @input="$emit('search-change', $event.target.value)"
        />
      </div>

      <!-- Filters removed as per new accordion design -->

      <div v-if="filteredProducts.length > 0" class="ai-strip">
        <p class="ai-label">{{ t('room3d.products.aiLabel') }} <span class="smart">{{ t('room3d.products.aiSmart') }}</span></p>
        <p class="ai-text">
          {{ t('room3d.products.aiText') }}
        </p>
      </div>
    </div>

    <div class="products-scroll">
      <div v-if="recommendationError" class="products-empty products-empty--error">
        {{ recommendationError }}
      </div>
      <div v-else-if="filteredProducts.length === 0" class="products-empty">
        {{ t('room3d.products.empty') }}
      </div>
      <div v-else class="accordion-container">
        
        <!-- Nhóm 1: Kết quả tìm kiếm -->
        <div v-if="searchKeywordLower" class="product-group">
          <div class="group-header" @click="toggleGroup('search')">
            <div class="group-title">
              <AppIcon name="search" :size="16" />
              <strong>Sản phẩm khớp với tìm kiếm</strong>
              <small>({{ searchResults.length }})</small>
            </div>
            <AppIcon :name="isGroupOpen('search') ? 'chevronUp' : 'chevronDown'" :size="16" class="toggle-icon" />
          </div>
          <div v-show="isGroupOpen('search')" class="group-content grid" :style="{ '--product-columns': productColumns }">
            <div v-if="searchResults.length === 0" class="products-empty" style="min-height: 4rem;">
              Không tìm thấy sản phẩm nào khớp.
            </div>
            <ProductCard3D
              v-for="product in searchResults"
              :key="product.id"
              :product="product"
              :added="placedProductIds.includes(String(product.id))"
              :suggested="selectedRoom && Array.isArray(product.roomTypes) ? product.roomTypes.includes(selectedRoom.type) : false"
              :shape-step="productCardStep"
              :cart-qty="getCartQty(product.id)"
              @add="$emit('add-product', $event)"
              @open-detail="$emit('open-product', $event)"
            />
          </div>
        </div>

        <!-- Nhóm 2: Tất cả -->
        <div class="product-group">
          <div class="group-header" @click="toggleGroup('all')">
            <div class="group-title">
              <AppIcon name="box" :size="16" />
              <strong>Tất cả</strong>
              <small>({{ filteredProducts.length }})</small>
            </div>
            <AppIcon :name="isGroupOpen('all') ? 'chevronUp' : 'chevronDown'" :size="16" class="toggle-icon" />
          </div>
          <div v-show="isGroupOpen('all')" class="group-content grid" :style="{ '--product-columns': productColumns }">
            <ProductCard3D
              v-for="product in filteredProducts"
              :key="'all-' + product.id"
              :product="product"
              :added="placedProductIds.includes(String(product.id))"
              :suggested="selectedRoom && Array.isArray(product.roomTypes) ? product.roomTypes.includes(selectedRoom.type) : false"
              :shape-step="productCardStep"
              :cart-qty="getCartQty(product.id)"
              @add="$emit('add-product', $event)"
              @open-detail="$emit('open-product', $event)"
            />
          </div>
        </div>

        <!-- Nhóm 3: Danh mục con -->
        <div v-for="group in subCategories" :key="group.name" class="product-group">
          <div class="group-header" @click="toggleGroup('cat-' + group.name)">
            <div class="group-title">
              <AppIcon name="folder" :size="16" />
              <strong>{{ group.name }}</strong>
              <small>({{ group.items.length }})</small>
            </div>
            <AppIcon :name="isGroupOpen('cat-' + group.name) ? 'chevronUp' : 'chevronDown'" :size="16" class="toggle-icon" />
          </div>
          <div v-show="isGroupOpen('cat-' + group.name)" class="group-content grid" :style="{ '--product-columns': productColumns }">
            <ProductCard3D
              v-for="product in group.items"
              :key="'sub-' + product.id"
              :product="product"
              :added="placedProductIds.includes(String(product.id))"
              :suggested="selectedRoom && Array.isArray(product.roomTypes) ? product.roomTypes.includes(selectedRoom.type) : false"
              :shape-step="productCardStep"
              :cart-qty="getCartQty(product.id)"
              @add="$emit('add-product', $event)"
              @open-detail="$emit('open-product', $event)"
            />
          </div>
        </div>

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

<style scoped>
.panel {
  border-left: 1px solid #e6ded1;
  height: 100%;
  overflow: hidden;
  padding: 0.9rem 0.8rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  background: #fbf8f3;
}

.panel-top {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  flex: 0 0 auto;
}

.panel-heading {
  align-items: end;
  display: flex;
  justify-content: space-between;
  min-width: 0;
}

.panel-heading div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.panel-heading span {
  color: #a07320;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-heading strong {
  color: #172532;
  font-size: 1rem;
}

.panel-heading small {
  color: #81786e;
  flex: 0 0 auto;
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #fffdf9;
  border: 1px solid #d8cec1;
  border-radius: 8px;
  padding: 0 0.7rem;
  min-height: 2.35rem;
  transition: box-shadow 0.18s ease;
}

.search-wrap:focus-within {
  box-shadow: 0 0 0 2px rgba(246, 178, 47, 0.36);
}

.search-icon {
  opacity: 0.75;
  color: #8b775e;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  color: #172532;
  width: 100%;
  font: inherit;
  font-size: 0.86rem;
}

.search-input::placeholder {
  color: #9a9288;
}

.filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
}

.filter-btn {
  border: 1px solid #d8cec1;
  border-radius: 6px;
  background: #fffdf9;
  color: #5f5d58;
  min-height: 2.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.filter-btn:hover {
  border-color: #c9b49a;
  background: #f8f5f0;
  color: #29465a;
  transform: translateY(-1px);
}

.filter-btn.active {
  border-color: #12202e;
  background: #12202e;
  color: #e5b84a;
}

.filter-btn:focus-visible,
.search-input:focus-visible {
  outline: 2px solid rgba(201, 146, 42, 0.55);
  outline-offset: 2px;
}

.ai-strip {
  border-top: 1px solid #e3dbcf;
  border-bottom: 1px solid #e3dbcf;
  padding: 0.65rem 0.1rem 0.55rem;
}

.ai-label {
  margin: 0;
  color: #9a744f;
  font-weight: 700;
  letter-spacing: 0.09em;
  font-size: 0.76rem;
}

.smart {
  background: rgba(201, 146, 42, 0.14);
  color: #8d641d;
  border-radius: 4px;
  padding: 0.08rem 0.42rem;
  margin-left: 0.25rem;
}

.ai-text {
  margin: 0.3rem 0 0;
  color: #1f4964;
  font-size: 0.88rem;
  line-height: 1.35;
}

.products-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 0.1rem;
  /* An thanh scrollbar nhung van cho phep cuon noi dung */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.products-scroll::-webkit-scrollbar {
  display: none;
}

.grid {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(var(--product-columns, 2), minmax(0, 1fr));
  align-items: start;
}

.products-empty {
  min-height: 8rem;
  display: grid;
  place-items: center;
  border: 1px dashed #d8cec1;
  border-radius: 0.8rem;
  color: #7b7369;
  font-size: 0.84rem;
  text-align: center;
  padding: 1rem;
}

.products-empty--error {
  color: #9a5b22;
  background: #fff8e8;
  border-color: #efd7a5;
}

.panel-cart {
  flex: 0 0 auto;
  border-top: 1px solid #ece5da;
  padding-top: 0.45rem;
  background: #fbf8f3;
}

/* Accordion Styles */
.accordion-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 1rem;
}

.product-group {
  background: #fffdf9;
  border: 1px solid #d8cec1;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.8rem;
  cursor: pointer;
  user-select: none;
  background: #fdfbf7;
  transition: background 0.2s;
}

.group-header:hover {
  background: #f4efeb;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #172532;
}

.group-title strong {
  font-size: 0.85rem;
}

.group-title small {
  color: #8b775e;
  font-size: 0.75rem;
}

.toggle-icon {
  color: #8b775e;
  opacity: 0.8;
}

.group-content {
  padding: 0.6rem;
  border-top: 1px solid #efeae2;
  background: #fffdf9;
}
</style>
