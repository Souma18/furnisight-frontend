<script setup>
import ProductGrid from '@shared/ui/ProductGrid.vue'

defineProps({
  products: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  activeTags: { type: Array, default: () => [] },
  sortBy: { type: String, default: 'popular' },
  viewMode: { type: String, default: 'grid' },
  loading: { type: Boolean, default: false },
  wishedProductIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:sortBy', 'toggle-wish'])
</script>

<template>
  <div class="pl-body">
    <div class="pl-top-row">
      <p>Tìm thấy <strong>{{ total }}</strong> sản phẩm</p>
      <div class="pl-tags">
        <span v-for="tag in activeTags" :key="tag" class="pl-tag">{{ tag }}</span>
      </div>
      <select :value="sortBy" :disabled="!products.length" @change="emit('update:sortBy', $event.target.value)">
        <option value="popular">Phổ biến nhất</option>
        <option value="newest">Mới nhất</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
        <option value="rating">Đánh giá cao nhất</option>
      </select>
    </div>

    <ProductGrid
      :products="products"
      :view-mode="viewMode"
      :loading="loading"
      :wished-product-ids="wishedProductIds"
      empty-text="Không có sản phẩm phù hợp bộ lọc hiện tại."
      @toggle-wish="emit('toggle-wish', $event)"
    />
  </div>
</template>
