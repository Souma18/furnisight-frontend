<script setup>


defineProps({
  products: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  activeTags: { type: Array, default: () => [] },
  sortBy: { type: String, default: 'popular' },
  viewMode: { type: String, default: 'grid' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:sortBy'])

function detailRoute(item) {
  return `/products/${item.slug || item.id}`
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
      <RouterLink
        v-for="item in products"
        :key="item.id"
        :to="detailRoute(item)"
        class="pl-card"
      >
        <div class="pl-card-media">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="pl-img" />
          <span v-else>No Image</span>
        </div>

        <div class="pl-card-body">
          <p class="pl-cat">{{ item.categoryName || 'N/A' }}</p>
          <div class="pl-name">{{ item.name }}</div>
          <p v-if="viewMode === 'list'" class="pl-desc">{{ item.description || '' }}</p>

          <div class="pl-rating">
            <span>{{ stars(item.rating) }}</span>
            <strong>{{ item.rating }}</strong>
            <small>({{ item.ratingCount }})</small>
          </div>

          <div class="pl-price-row">
            <div>
              <p class="pl-price">{{ item.formattedPrice }}</p>
              <p v-if="item.hasDiscount" class="pl-old">{{ item.formattedOldPrice }}</p>
            </div>
            <button type="button" @click.prevent.stop="">+</button>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
