<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PriceFormatter } from '@shared/lib/formatters'
import AppIcon from '@shared/ui/AppIcon.vue'
import { resolveStockLimit } from '../lib/stockGuards'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['open-cart', 'update-qty', 'remove'])
const { t } = useI18n()

const visibleLines = computed(() => props.items.slice(0, 3))

function lineMeta(line) {
  return [line.selectedColor, line.selectedSize].filter(Boolean).join(' / ') || t('account.cart.defaultVariant')
}

function hideBrokenImage(event) {
  event.currentTarget.style.display = 'none'
}

function cannotIncrease(line) {
  const stockLimit = resolveStockLimit(line)
  return stockLimit != null && Number(line.qty || 1) >= stockLimit
}
</script>

<template>
  <div v-if="!items.length" class="cart-empty">
    <div class="cart-empty-icon">
      <AppIcon name="cart" :size="18" />
    </div>
    <div>
      <div class="cart-empty-title">{{ t('account.cart.emptyTitle') }}</div>
      <p>{{ t('account.cart.emptySub') }}</p>
    </div>
  </div>

  <div v-else>
    <div class="cart-list">
      <div
        v-for="line in visibleLines"
        :key="line.id"
        class="cart-item"
        role="link"
        tabindex="0"
        @click="$emit('open-cart')"
        @keydown.enter="$emit('open-cart')"
      >
        <div class="cart-thumb">
          <AppIcon name="image" :size="20" />
          <img
            v-if="line.imageUrl"
            :src="line.imageUrl"
            alt=""
            class="cart-thumb-image"
            @error="hideBrokenImage"
          >
        </div>

        <div class="cart-content">
          <div class="cart-item-name">{{ line.name }}</div>
          <div class="cart-item-meta">{{ lineMeta(line) }}</div>
        </div>

        <div class="cart-item-price">{{ PriceFormatter.format((Number(line.price) || 0) * (Number(line.qty) || 0)) }}</div>

        <div class="cart-item-controls" @click.stop @keydown.stop>
          <div class="cart-item-qty-stepper">
            <button type="button" :aria-label="t('account.cart.decreaseQty')" :disabled="Number(line.qty || 1) <= 1" @click="$emit('update-qty', line.id, Number(line.qty || 1) - 1)">−</button>
            <span>{{ line.qty }}</span>
            <button type="button" :aria-label="t('account.cart.increaseQty')" :disabled="cannotIncrease(line)" @click="$emit('update-qty', line.id, Number(line.qty || 1) + 1)">+</button>
          </div>
        </div>

        <button
          type="button"
          class="cart-item-remove"
          :aria-label="t('account.cart.removeItem')"
          :title="t('account.cart.removeItem')"
          @click.stop="$emit('remove', line.id)"
        >
          <AppIcon name="trash" :size="16" />
        </button>
      </div>
    </div>

    <div v-if="items.length > visibleLines.length" class="cart-more">
      {{ t('account.cart.moreItems', { count: items.length - visibleLines.length }) }}
    </div>

    <div class="cart-footer">
      <div class="cart-total">
        <span>{{ t('account.cart.total') }}</span>
        <strong>{{ PriceFormatter.format(totalAmount) }}</strong>
      </div>

      <div class="cart-actions">
        <button type="button" class="cart-secondary-btn" @click="$emit('open-cart')">{{ t('account.cart.viewCart') }}</button>
        <button type="button" class="cart-primary-btn" @click="$emit('open-cart')">
          {{ totalCount ? t('account.cart.checkoutWithCount', { count: totalCount }) : t('account.cart.checkout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  color: var(--app-text-muted, #666);
}

.cart-empty-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--app-surface-soft, #faf6f0);
  color: var(--app-gold, #c58d2f);
  flex-shrink: 0;
}

.cart-empty-title {
  color: var(--app-heading, #1a1a1a);
  font-size: 13px;
  font-weight: 600;
}

.cart-empty p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.cart-list {
  max-height: 304px;
  overflow-y: auto;
}

.cart-item {
  width: 100%;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) minmax(92px, auto);
  grid-template-areas:
    'thumb content price'
    'thumb controls remove';
  column-gap: 12px;
  row-gap: 7px;
  align-items: center;
  padding: 13px 16px;
  border: none;
  border-bottom: 1px solid var(--app-border, #f0e9dd);
  background: var(--app-surface, #fff);
  color: var(--app-text, #1a1a1a);
  cursor: pointer;
  text-align: left;
  transition: background 0.18s;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item:hover {
  background: var(--app-control-hover, #faf6f0);
}

.cart-thumb {
  grid-area: thumb;
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--app-surface-soft, #f7f1e8), var(--app-surface, #ffffff));
  border: 1px solid color-mix(in srgb, var(--app-gold, #c9922a) 18%, transparent);
  font-size: 24px;
  overflow: hidden;
  color: var(--app-gold, #b89b6d);
}

.cart-thumb-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--app-surface-soft, #f7f1e8);
}

.cart-content {
  grid-area: content;
  min-width: 0;
  align-self: end;
}

.cart-item-name {
  color: var(--app-heading, #1a1a1a);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-meta {
  color: var(--app-text-muted, #7a7a7a);
  font-size: 11px;
}

.cart-item-meta {
  margin-top: 4px;
}

.cart-item-controls {
  grid-area: controls;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  align-self: start;
}

.cart-item-qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--app-border, #e5dcca);
  border-radius: 999px;
  overflow: hidden;
  background: var(--app-control-bg, #f7f1e8);
  min-width: 72px;
}

.cart-item-qty-stepper button {
  width: 28px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--app-text-muted, #7a6a55);
  cursor: pointer;
}
.cart-item-qty-stepper button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.cart-item-qty-stepper span {
  min-width: 28px;
  text-align: center;
  color: var(--app-heading, #5f5243);
  font-size: 11px;
  font-weight: 700;
}

.cart-item-remove {
  grid-area: remove;
  width: 28px;
  height: 28px;
  justify-self: end;
  align-self: start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--app-gold, #8b7354);
  cursor: pointer;
  padding: 0;
}

.cart-item-remove:hover,
.cart-item-remove:focus-visible {
  border-color: color-mix(in srgb, var(--app-danger, #c0392b) 34%, transparent);
  background: color-mix(in srgb, var(--app-danger, #c0392b) 10%, var(--app-surface, #fdf0ee));
  color: var(--app-danger, #c0392b);
  outline: none;
}

.cart-item-price {
  grid-area: price;
  justify-self: end;
  align-self: end;
  color: var(--app-gold, #c58d2f);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.cart-more {
  padding: 10px 16px 0;
  color: var(--app-text-muted, #8a8a8a);
  font-size: 11px;
}

.cart-footer {
  display: grid;
  gap: 12px;
  padding: 14px 16px 16px;
  border-top: 1px solid var(--app-border, #f0e9dd);
  background: var(--app-surface, #fffdf9);
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cart-total span {
  color: var(--app-text-muted, #7a7a7a);
  font-size: 12px;
}

.cart-total strong {
  color: var(--app-heading, #12202e);
  font-size: 16px;
}

.cart-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cart-secondary-btn,
.cart-primary-btn {
  min-height: 38px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cart-secondary-btn {
  border: 1px solid color-mix(in srgb, var(--app-gold, #c58d2f) 34%, transparent);
  background: var(--app-control-bg, #fff);
  color: var(--app-gold, #c58d2f);
}

.cart-secondary-btn:hover,
.cart-secondary-btn:focus-visible {
  background: var(--app-control-hover, #faf6f0);
  outline: none;
}

.cart-primary-btn {
  border: none;
  background: var(--app-navy-soft, linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end)));
  color: var(--app-heading-inverse, #fff);
}

.cart-primary-btn:hover,
.cart-primary-btn:focus-visible {
  filter: brightness(1.08);
  outline: none;
}

[data-theme='dark'] .cart-item,
[data-theme='dark'] .cart-footer {
  background: var(--app-surface) !important;
  border-color: var(--app-border) !important;
}

[data-theme='dark'] .cart-item:hover {
  background: var(--app-control-hover) !important;
}

[data-theme='dark'] .cart-empty,
[data-theme='dark'] .cart-item-meta,
[data-theme='dark'] .cart-more,
[data-theme='dark'] .cart-total span {
  color: var(--app-text-muted) !important;
}

[data-theme='dark'] .cart-empty-title,
[data-theme='dark'] .cart-item-name,
[data-theme='dark'] .cart-total strong,
[data-theme='dark'] .cart-item-qty-stepper span {
  color: var(--app-heading) !important;
}

[data-theme='dark'] .cart-thumb,
[data-theme='dark'] .cart-empty-icon {
  background: var(--app-surface-soft) !important;
  border-color: var(--app-border) !important;
}

[data-theme='dark'] .cart-item-qty-stepper,
[data-theme='dark'] .cart-secondary-btn {
  background: var(--app-control-bg) !important;
  border-color: var(--app-border) !important;
}

[data-theme='dark'] .cart-secondary-btn:hover,
[data-theme='dark'] .cart-secondary-btn:focus-visible {
  background: var(--app-control-hover) !important;
  border-color: var(--app-border-strong) !important;
}

[data-theme='dark'] .cart-primary-btn {
  background: var(--app-navy-soft) !important;
  color: var(--app-heading-inverse) !important;
}
</style>
