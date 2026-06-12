<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'

const props = defineProps({
  products: { type: Array, default: () => [] },
  viewMode: { type: String, default: 'grid' },
  wishedProductIds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'Không có sản phẩm phù hợp.' },
  loadingText: { type: String, default: 'Đang tải sản phẩm...' },
  columns: { type: Number, default: 3 },
})

const emit = defineEmits(['toggle-wish'])

function detailRoute(item) {
  const detailId = item.slug || item.detailId || item.id
  return detailId ? `/products/${detailId}` : null
}

function categoryLabel(item) {
  return item.categoryName || item.category || 'N/A'
}

function priceLabel(item) {
  return item.formattedPrice || PriceFormatter.format(item.price)
}

function roundedRating(rating) {
  return Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))
}
</script>

<template>
  <div v-if="loading" class="shared-product-empty">{{ loadingText }}</div>
  <div v-else-if="!products.length" class="shared-product-empty">{{ emptyText }}</div>

  <div
    v-else
    class="shared-product-grid"
    :class="{ 'shared-product-grid--list': viewMode === 'list' }"
    :style="{ '--product-grid-columns': columns }"
  >
    <article
      v-for="item in products"
      :key="item.id"
      class="shared-product-card"
    >
      <RouterLink v-if="detailRoute(item)" :to="detailRoute(item)" class="shared-product-card__link">
        <div class="shared-product-card__media">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="shared-product-card__img" />
          <span v-else>No Image</span>
        </div>

        <div class="shared-product-card__body">
          <p class="shared-product-card__cat">{{ categoryLabel(item) }}</p>
          <div class="shared-product-card__name">{{ item.name }}</div>
          <p v-if="viewMode === 'list'" class="shared-product-card__desc">{{ item.description || '' }}</p>

          <div class="shared-product-card__rating">
            <span class="shared-product-card__stars" aria-label="Đánh giá sản phẩm">
              <AppIcon
                v-for="star in 5"
                :key="`${item.id}-product-star-${star}`"
                name="star"
                :size="13"
                :class="{ active: star <= roundedRating(item.rating) }"
              />
            </span>
            <strong>{{ item.rating ?? 0 }}</strong>
            <small>({{ item.ratingCount ?? 0 }})</small>
          </div>

          <div class="shared-product-card__price-row">
            <p class="shared-product-card__price">{{ priceLabel(item) }}</p>
            <span class="shared-product-card__sold">Đã bán {{ item.soldCount ?? 0 }}</span>
          </div>
        </div>
      </RouterLink>

      <button
        type="button"
        class="shared-product-card__wish"
        :class="{ active: wishedProductIds.includes(item.id) }"
        aria-label="Yêu thích"
        @click="emit('toggle-wish', item.id)"
      >
        <AppIcon name="heart" :size="17" :stroke-width="1.9" />
      </button>
    </article>
  </div>
</template>

<style scoped>
.shared-product-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(var(--product-grid-columns), minmax(0, 1fr));
}

.shared-product-grid--list {
  grid-template-columns: 1fr;
}

.shared-product-card {
  background: #fff;
  border: 1px solid #ece2cf;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
}

.shared-product-card__link {
  color: inherit;
  display: grid;
  min-width: 0;
  text-decoration: none;
}

.shared-product-card__link:hover,
.shared-product-card__link:focus,
.shared-product-card__link:focus-visible {
  color: inherit;
  outline: none;
  text-decoration: none;
}

.shared-product-card__link:hover .shared-product-card__name,
.shared-product-card__link:focus .shared-product-card__name,
.shared-product-card__link:focus-visible .shared-product-card__name {
  text-decoration: none;
}

.shared-product-grid--list .shared-product-card__link {
  grid-template-columns: 210px 1fr;
}

.shared-product-card__media {
  align-items: center;
  background: #f0e9dd;
  display: grid;
  font-size: 72px;
  height: 210px;
  justify-items: center;
  overflow: hidden;
  text-decoration: none;
}

.shared-product-grid--list .shared-product-card__media {
  height: 100%;
  min-height: 180px;
}

.shared-product-card__img {
  display: block;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.35s ease;
  width: 100%;
}

.shared-product-card:hover .shared-product-card__img,
.shared-product-card:focus-within .shared-product-card__img {
  transform: scale(1.025);
}

.shared-product-card__body {
  padding: 16px;
}

.shared-product-card__cat {
  color: #888;
  font-size: 11px;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.shared-product-card__name {
  color: #1a1a1a;
  display: block;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 8px;
  text-decoration: none;
}

.shared-product-card__desc {
  color: #555;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 10px;
}

.shared-product-card__rating {
  align-items: center;
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.shared-product-card__stars {
  align-items: center;
  color: #cfc6b9;
  display: inline-flex;
  gap: 1px;
}

.shared-product-card__stars .active {
  color: #c9922a;
  fill: currentColor;
}

.shared-product-card__rating strong,
.shared-product-card__rating small {
  font-size: 12px;
}

.shared-product-card__rating small {
  color: #888;
}

.shared-product-card__price-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.shared-product-card__price {
  color: #c9922a;
  font-family: var(--sans);
  font-size: 19px;
  font-weight: 700;
  margin: 0;
}

.shared-product-card__sold {
  color: #7e7c77;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.shared-product-card__wish {
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 0;
  border-radius: 999px;
  color: #55606e;
  cursor: pointer;
  display: inline-flex;
  height: 36px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  right: 14px;
  top: 14px;
  width: 36px;
}

.shared-product-card__wish :is(svg) {
  display: block;
  fill: transparent;
}

.shared-product-card__wish.active {
  color: #e25555;
}

.shared-product-card__wish.active :is(svg) {
  fill: currentColor;
}

.shared-product-empty {
  background: #fff;
  border: 1px solid #ece2cf;
  border-radius: 14px;
  color: #888;
  padding: 50px 20px;
  text-align: center;
}

@media (max-width: 980px) {
  .shared-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .shared-product-grid,
  .shared-product-grid--list {
    grid-template-columns: 1fr;
  }

  .shared-product-grid--list .shared-product-card__link {
    grid-template-columns: 1fr;
  }
}
</style>
