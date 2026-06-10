<script setup>
import ProductCard3D from './ProductCard3D.vue'
import Room3DCartSection from './Room3DCartSection.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
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
</script>

<template>
  <aside class="panel">
    <div class="panel-top">
      <div class="search-wrap">
        <span class="search-icon"><AppIcon name="search" :size="16" /></span>
        <input
          class="search-input"
          :value="searchKeyword"
          placeholder="Tìm kiếm nội thất..."
          @input="$emit('search-change', $event.target.value)"
        />
      </div>

      <div class="filters">
        <button
          v-for="filter in productFilters"
          :key="filter.value"
          type="button"
          class="filter-btn"
          :class="{ active: selectedCategory === filter.value }"
          @click="$emit('category-change', filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div v-if="filteredProducts.length > 0" class="ai-strip">
        <p class="ai-label">GỢI Ý NỘI THẤT <span class="smart">PHÙ HỢP</span></p>
        <p class="ai-text">
          Chọn sản phẩm để thêm vào giỏ hàng hoặc kéo vào không gian 3D.
        </p>
      </div>
    </div>

    <div class="products-scroll">
      <div v-if="filteredProducts.length === 0" class="products-empty">
        Chưa có sản phẩm nào phù hợp.
      </div>
      <div v-else class="grid" :style="{ '--product-columns': productColumns }">
        <ProductCard3D
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :added="placedProductIds.includes(String(product.id))"
          :suggested="
            selectedRoom && Array.isArray(product.roomTypes)
              ? product.roomTypes.includes(selectedRoom.type)
              : false
          "
          :format-currency="formatCurrency"
          :shape-step="productCardStep"
          @add="$emit('add-product', $event)"
          @open-detail="$emit('open-product', $event)"
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

<style scoped>
.panel {
  border-left: 1px solid #e6ded1;
  height: 100%;
  overflow: hidden;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  background: #ffffff;
}

.panel-top {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 0 0 auto;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #0f3f5c;
  border-radius: 0.8rem;
  padding: 0 0.7rem;
  min-height: 2.35rem;
  transition: box-shadow 0.18s ease;
}

.search-wrap:focus-within {
  box-shadow: 0 0 0 2px rgba(246, 178, 47, 0.36);
}

.search-icon {
  opacity: 0.75;
  color: #d7e8f7;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  color: #eef6ff;
  width: 100%;
  font: inherit;
  font-size: 0.86rem;
}

.search-input::placeholder {
  color: rgba(221, 235, 247, 0.55);
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.filter-btn {
  border: 1px solid #d8cec1;
  border-radius: 0.7rem;
  background: #f3f0eb;
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
  border-color: #0f3f5c;
  background: #0f3f5c;
  color: #ffba45;
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
  background: #f6b22f;
  color: #0f3f5c;
  border-radius: 0.7rem;
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

.panel-cart {
  flex: 0 0 auto;
  border-top: 1px solid #ece5da;
  padding-top: 0.45rem;
  background: #ffffff;
}
</style>
