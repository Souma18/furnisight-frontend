<script setup>
import { getProductDetailById } from '../mock/productDetailMockData'
import { formatVnd } from '../mock/productListMockData'

defineProps({
  products: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  activeTags: { type: Array, default: () => [] },
  sortBy: { type: String, default: 'popular' },
  viewMode: { type: String, default: 'grid' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:sortBy'])

function hasDetail(item) {
  return Boolean(item.detailId && getProductDetailById(item.detailId))
}

function detailRoute(item) {
  return hasDetail(item) ? `/products/${item.detailId}` : null
}

function stars(rating) {
  if (rating >= 4.8) return '★★★★★'
  if (rating >= 3.8) return '★★★★☆'
  if (rating >= 2.8) return '★★★☆☆'
  if (rating >= 1.8) return '★★☆☆☆'
  return '★☆☆☆☆'
}
</script>

<template>
  <div class="pl-body">
    <div class="pl-top-row">
      <p>Tìm thấy <strong>{{ total }}</strong> sản phẩm</p>
      <div class="pl-tags">
        <span v-for="tag in activeTags" :key="tag" class="pl-tag">{{ tag }}</span>
      </div>
      <select :value="sortBy" @change="emit('update:sortBy', $event.target.value)">
        <option value="popular">Phổ biến nhất</option>
        <option value="newest">Mới nhất</option>
        <option value="price-asc">Giá tăng dần</option>
        <option value="price-desc">Giá giảm dần</option>
        <option value="rating">Đánh giá cao nhất</option>
      </select>
    </div>

    <div v-if="loading" class="pl-empty">Đang tải sản phẩm...</div>
    <div v-else-if="!products.length" class="pl-empty">Không có sản phẩm phù hợp bộ lọc hiện tại.</div>

    <div v-else class="pl-grid" :class="{ list: viewMode === 'list' }">
      <article v-for="item in products" :key="item.id" class="pl-card">
        <RouterLink v-if="hasDetail(item)" :to="detailRoute(item)" class="pl-card-media">
          <span>{{ item.imageFallback }}</span>
        </RouterLink>
        <div v-else class="pl-card-media pl-card-media-disabled">
          <span>{{ item.imageFallback }}</span>
        </div>

        <div class="pl-card-body">
          <p class="pl-cat">{{ item.category }}</p>
          <RouterLink v-if="hasDetail(item)" :to="detailRoute(item)" class="pl-name">{{ item.name }}</RouterLink>
          <p v-else class="pl-name pl-name-disabled">{{ item.name }}</p>
          <p v-if="viewMode === 'list'" class="pl-desc">{{ item.description }}</p>

          <div class="pl-rating">
            <span>{{ stars(item.rating) }}</span>
            <strong>{{ item.rating }}</strong>
            <small>({{ item.ratingCount }})</small>
          </div>

          <div class="pl-price-row">
            <div>
              <p class="pl-price">{{ formatVnd(item.price) }}</p>
              <p v-if="item.oldPrice" class="pl-old">{{ formatVnd(item.oldPrice) }}</p>
            </div>
            <button type="button">+</button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
