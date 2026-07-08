<script setup>
import AppImage from "@shared/ui/AppImage.vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import AppIcon from "./AppIcon.vue";
import { PriceFormatter } from "@shared/lib/formatters";

const props = defineProps({
  products: { type: Array, default: () => [] },
  viewMode: { type: String, default: "grid" },
  wishedProductIds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: "" },
  loadingText: { type: String, default: "" },
  columns: { type: Number, default: 3 },
  showClearAction: { type: Boolean, default: false },
  clearActionText: { type: String, default: "" },
  layout: { type: String, default: "standard" },
});

const emit = defineEmits(["toggle-wish", "clear"]);
const { t } = useI18n();

function detailRoute(item) {
  const detailId = item.slug || item.detailId || item.id;
  return detailId ? `/products/${detailId}` : null;
}

function categoryLabel(item) {
  if (item.categoryName) return item.categoryName;
  if (item.category?.name || item.category?.label)
    return item.category.name || item.category.label;
  return "N/A";
}

function priceLabel(item) {
  return item.formattedPrice || PriceFormatter.format(item.price);
}

function roundedRating(rating) {
  return Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
}

function getDimensions(variant) {
  if (!variant) return "";
  return `${variant.length || 0} x ${variant.width || 0} x ${variant.height || 0} cm`;
}
</script>

<template>
  <div
    v-if="loading"
    class="shared-product-grid shared-product-grid--skeleton"
    :style="{ '--product-grid-columns': columns }"
    role="status"
    aria-live="polite"
  >
    <span class="sr-only">{{ loadingText || t("products.loading") }}</span>
    <article
      v-for="index in 6"
      :key="`product-skeleton-${index}`"
      class="shared-product-card shared-product-card--skeleton"
    >
      <div class="shared-product-card__media shared-skeleton-block"></div>
      <div class="shared-product-card__body">
        <span class="shared-skeleton-line short"></span>
        <span class="shared-skeleton-line"></span>
        <span class="shared-skeleton-line medium"></span>
        <span class="shared-skeleton-line price"></span>
      </div>
    </article>
  </div>

  <div v-else-if="!products.length" class="shared-product-empty">
    <AppIcon name="search" :size="26" />
    <p>{{ emptyText || t("products.emptyShort") }}</p>
    <button v-if="showClearAction" type="button" @click="emit('clear')">
      {{ clearActionText || t("products.clearFilters") }}
    </button>
  </div>

  <div
    v-else
    class="shared-product-grid"
    :class="[
      { 'shared-product-grid--list': viewMode === 'list' },
      `shared-product-grid--${layout}`,
    ]"
    :style="{ '--product-grid-columns': columns }"
  >
    <article
      v-for="item in products"
      :key="item.id"
      class="shared-product-card"
    >
      <RouterLink
        v-if="detailRoute(item)"
        :to="detailRoute(item)"
        class="shared-product-card__link"
      >
        <div class="shared-product-card__media">
          <AppImage
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
            class="shared-product-card__img"
          />
          <span v-else>{{ t("products.noImage") }}</span>

          <span v-if="item.supports3d" class="shared-product-card__badge-3d"
            >3D</span
          >
        </div>

        <div class="shared-product-card__body">
          <p class="shared-product-card__cat">{{ categoryLabel(item) }}</p>
          <div class="shared-product-card__name">{{ item.name }}</div>
          <p v-if="viewMode === 'list'" class="shared-product-card__desc">
            {{ item.description || "" }}
          </p>

          <div class="shared-product-card__rating">
            <span
              class="shared-product-card__stars"
              :aria-label="t('products.ratingAria')"
            >
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
            <span class="shared-product-card__sold">{{
              t("products.sold", { count: item.soldCount ?? 0 })
            }}</span>
          </div>

          <div class="shared-product-card__meta" v-if="item.variants?.length">
            <span class="meta-item">
              <AppIcon name="cube" :size="13" />
              {{ getDimensions(item.variants[0]) }}
            </span>
            <span class="meta-item">
              <AppIcon name="shield" :size="13" />
              {{ item.variants[0].warranty }}
            </span>
          </div>
        </div>
      </RouterLink>

      <button
        type="button"
        class="shared-product-card__wish"
        :class="{ active: wishedProductIds.includes(item.id) }"
        :aria-label="t('products.wishlist')"
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
  gap: 16px;
  grid-template-columns: repeat(var(--product-grid-columns), minmax(0, 1fr));
}

.shared-product-grid--list {
  grid-template-columns: 1fr;
}

.shared-product-grid--catalog {
  gap: 16px;
}

.shared-product-grid--catalog .shared-product-card__media {
  aspect-ratio: 1 / 1;
}

.shared-product-grid--catalog .shared-product-card__body {
  min-height: 120px;
  padding: 12px;
}

.shared-product-grid--catalog .shared-product-card__cat {
  font-size: 10px;
  margin-bottom: 5px;
}

.shared-product-grid--catalog .shared-product-card__name {
  font-size: 13px;
  line-height: 1.35;
  margin-bottom: 7px;
  min-height: 38px;
}

.shared-product-grid--catalog .shared-product-card__rating {
  gap: 5px;
  margin-bottom: 10px;
}

.shared-product-grid--catalog .shared-product-card__rating strong,
.shared-product-grid--catalog .shared-product-card__rating small {
  font-size: 11px;
}

.shared-product-grid--catalog .shared-product-card__price {
  font-size: 15px;
}

.shared-product-grid--catalog .shared-product-card__sold {
  font-size: 11px;
}

.shared-product-grid--catalog .shared-product-card__wish {
  height: 32px;
  right: 10px;
  top: 10px;
  width: 32px;
}

.shared-product-grid--catalog.shared-product-grid--list
  .shared-product-card__link {
  grid-template-columns: minmax(180px, 23%) 1fr;
}

.shared-product-grid--catalog.shared-product-grid--list
  .shared-product-card__media {
  min-height: 150px;
}

.shared-product-grid--catalog.shared-product-grid--list
  .shared-product-card__body {
  min-height: 0;
  padding: 14px 16px;
}

.shared-product-grid--catalog.shared-product-grid--list
  .shared-product-card__desc {
  font-size: 12px;
  line-height: 1.5;
}

.shared-product-grid--editorial:not(.shared-product-grid--list) {
  gap: clamp(18px, 2vw, 26px);
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.shared-product-grid--editorial:not(.shared-product-grid--list)
  .shared-product-card {
  grid-column: span 4;
}

.shared-product-grid--editorial:not(.shared-product-grid--list)
  .shared-product-card:nth-child(8n + 1),
.shared-product-grid--editorial:not(.shared-product-grid--list)
  .shared-product-card:nth-child(8n + 6) {
  grid-column: span 6;
}

.shared-product-grid--editorial:not(.shared-product-grid--list)
  .shared-product-card:nth-child(8n + 1)
  .shared-product-card__media,
.shared-product-grid--editorial:not(.shared-product-grid--list)
  .shared-product-card:nth-child(8n + 6)
  .shared-product-card__media {
  aspect-ratio: 16 / 10;
}

.shared-product-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  box-shadow: var(--app-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.25s ease;
}

.shared-product-card:hover,
.shared-product-card:focus-within {
  border-color: var(--brand-gold-400, #c99538);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.shared-product-card__link {
  color: inherit;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  text-decoration: none;
}

.shared-product-card__link:hover,
.shared-product-card__link:focus,
.shared-product-card__link:focus-visible {
  color: inherit;
  outline: none;
  outline-offset: 0;
  text-decoration: none;
}

.shared-product-card__link:hover .shared-product-card__name,
.shared-product-card__link:focus .shared-product-card__name,
.shared-product-card__link:focus-visible .shared-product-card__name {
  text-decoration: none;
}

.shared-product-grid--list .shared-product-card__link {
  display: grid;
  grid-template-columns: minmax(220px, 28%) 1fr;
}

.shared-product-card__media {
  align-items: center;
  aspect-ratio: 16 / 11;
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--app-surface) 76%, transparent),
      color-mix(in srgb, var(--app-surface-muted) 82%, transparent)
    ),
    var(--app-surface-soft);
  display: grid;
  font-size: 72px;
  justify-items: center;
  overflow: hidden;
  position: relative;
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
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.shared-product-card:hover .shared-product-card__img,
.shared-product-card:focus-within .shared-product-card__img {
  transform: scale(1.02);
}

.shared-product-card__body {
  display: flex;
  flex: none;
  flex-direction: column;
  padding: 10px 12px 12px;
}

.shared-product-card__cat {
  color: var(--app-text-muted);
  font-size: 11px;
  letter-spacing: 0.08em;
  margin: 0 0 3px;
  text-transform: uppercase;
}

.shared-product-card__name {
  color: var(--app-heading);
  display: -webkit-box;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
  margin: 0 0 6px;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.shared-product-card__desc {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.shared-product-card__rating {
  align-items: center;
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
  font-variant-numeric: tabular-nums;
}

.shared-product-card__stars {
  align-items: center;
  color: var(--app-border-strong);
  display: inline-flex;
  gap: 1px;
}

.shared-product-card__stars .active {
  color: var(--app-gold);
  fill: currentColor;
}

.shared-product-card__rating strong,
.shared-product-card__rating small {
  font-size: 11px;
}

.shared-product-card__rating small {
  color: var(--app-text-muted);
}

.shared-product-card__price-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 5px;
  min-height: 24px;
}

.shared-product-card__price {
  color: var(--app-gold);
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-product-card__sold {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.shared-product-card__wish {
  align-items: center;
  background: color-mix(in srgb, var(--app-surface) 94%, transparent);
  border: 1px solid var(--app-border);
  border-radius: 999px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  height: 36px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  right: 14px;
  top: 14px;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
  width: 36px;
}

.shared-product-card__wish :is(svg) {
  display: block;
  fill: transparent;
}

.shared-product-card__wish.active {
  color: #e25555;
  border-color: rgba(226, 85, 85, 0.3);
  background: color-mix(in srgb, var(--app-danger) 12%, var(--app-surface));
}

.shared-product-card__wish.active :is(svg) {
  fill: currentColor;
}

.shared-product-card__wish:hover,
.shared-product-card__wish:focus-visible {
  border-color: var(--app-border-strong);
  color: var(--app-gold);
  outline: none;
  transform: translateY(-1px);
}

.shared-product-card__badge-3d {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #00875a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  line-height: 1;
  letter-spacing: 0.5px;
  z-index: 2;
}

.shared-product-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--app-border, #eee);
  font-size: 11px;
  color: var(--app-text-muted);
}

.shared-product-card__meta .meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.shared-product-empty {
  align-items: center;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text-muted);
  display: grid;
  gap: 14px;
  justify-items: center;
  min-height: 260px;
  padding: 32px 20px;
  text-align: center;
}

.shared-product-empty svg {
  color: var(--app-gold);
}

.shared-product-empty p {
  margin: 0;
}

.shared-product-empty button {
  border: 1px solid var(--app-navy);
  border-radius: 8px;
  background: var(--app-navy);
  color: var(--app-heading-inverse);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  min-height: 38px;
  padding: 0 16px;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.shared-product-empty button:hover,
.shared-product-empty button:focus-visible {
  background: var(--app-navy-soft);
  border-color: var(--app-navy-soft);
  outline: none;
  transform: translateY(-1px);
}

.shared-product-grid--skeleton .shared-product-card {
  pointer-events: none;
}

.shared-product-card--skeleton {
  transform: none;
}

.shared-skeleton-block,
.shared-skeleton-line {
  background: linear-gradient(
    90deg,
    var(--app-surface-muted) 0%,
    var(--app-surface-soft) 46%,
    var(--app-surface-muted) 100%
  );
  background-size: 220% 100%;
  animation: sharedSkeleton 1.2s ease-in-out infinite;
}

.shared-skeleton-line {
  border-radius: 999px;
  display: block;
  height: 12px;
  margin-bottom: 12px;
  width: 100%;
}

.shared-skeleton-line.short {
  width: 36%;
}

.shared-skeleton-line.medium {
  width: 68%;
}

.shared-skeleton-line.price {
  height: 18px;
  margin-top: auto;
  width: 46%;
}

.sr-only {
  clip: rect(0, 0, 0, 0);
  border: 0;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

@keyframes sharedSkeleton {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -120% 0;
  }
}

@media (max-width: 980px) {
  .shared-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shared-product-grid--catalog {
    gap: 14px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .shared-product-grid--editorial:not(.shared-product-grid--list) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shared-product-grid--editorial:not(.shared-product-grid--list)
    .shared-product-card,
  .shared-product-grid--editorial:not(.shared-product-grid--list)
    .shared-product-card:nth-child(8n + 1),
  .shared-product-grid--editorial:not(.shared-product-grid--list)
    .shared-product-card:nth-child(8n + 6) {
    grid-column: auto;
  }
}

@media (max-width: 680px) {
  .shared-product-grid,
  .shared-product-grid--list {
    grid-template-columns: 1fr;
  }

  .shared-product-grid--catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shared-product-grid--catalog.shared-product-grid--list {
    grid-template-columns: 1fr;
  }

  .shared-product-grid--list .shared-product-card__link {
    grid-template-columns: 1fr;
  }
}
</style>
