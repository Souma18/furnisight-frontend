<script setup>
import { computed } from 'vue'
import { PriceFormatter } from '@shared/lib/formatters'
import AppIcon from '@shared/ui/AppIcon.vue'

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

const visibleLines = computed(() => props.items.slice(0, 3))

function lineMeta(line) {
  return [line.selectedColor, line.selectedSize].filter(Boolean).join(' / ') || 'Phân loại mặc định'
}
</script>

<template>
  <div v-if="!items.length" class="cart-empty">
    <div class="cart-empty-icon">
      <AppIcon name="cart" :size="18" />
    </div>
    <div>
      <div class="cart-empty-title">Giỏ hàng đang trống</div>
      <p>Thêm vài món để xem nhanh tại đây.</p>
    </div>
  </div>

  <div v-else>
    <div class="cart-list">
      <button
        v-for="line in visibleLines"
        :key="line.id"
        type="button"
        class="cart-item"
        @click="$emit('open-cart')"
      >
        <div class="cart-thumb">
          <img v-if="line.imageUrl" :src="line.imageUrl" :alt="line.name" class="cart-thumb-image">
          <template v-else>{{ line.imageFallback ?? line.emoji ?? '🛍️' }}</template>
        </div>

        <div class="cart-content">
          <div class="cart-item-name">{{ line.name }}</div>
          <div class="cart-item-meta">{{ lineMeta(line) }}</div>
          <div class="cart-item-controls" @click.stop>
            <div class="cart-item-qty-stepper">
              <button type="button" aria-label="Giảm số lượng" @click="$emit('update-qty', line.id, Number(line.qty || 1) - 1)">−</button>
              <span>{{ line.qty }}</span>
              <button type="button" aria-label="Tăng số lượng" @click="$emit('update-qty', line.id, Number(line.qty || 1) + 1)">+</button>
            </div>
            <button type="button" class="cart-item-remove" @click="$emit('remove', line.id)">Xóa</button>
          </div>
        </div>

        <div class="cart-item-price">{{ PriceFormatter.format((Number(line.price) || 0) * (Number(line.qty) || 0)) }}</div>
      </button>
    </div>

    <div v-if="items.length > visibleLines.length" class="cart-more">
      +{{ items.length - visibleLines.length }} sản phẩm khác trong giỏ
    </div>

    <div class="cart-footer">
      <div class="cart-total">
        <span>Tổng cộng</span>
        <strong>{{ PriceFormatter.format(totalAmount) }}</strong>
      </div>

      <div class="cart-actions">
        <button type="button" class="cart-secondary-btn" @click="$emit('open-cart')">Xem giỏ hàng</button>
        <button type="button" class="cart-primary-btn" @click="$emit('open-cart')">
          Thanh toán {{ totalCount ? `(${totalCount})` : '' }}
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
  color: #666;
}

.cart-empty-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #faf6f0;
  color: #c58d2f;
  flex-shrink: 0;
}

.cart-empty-title {
  color: #1a1a1a;
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
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 13px 16px;
  border: none;
  border-bottom: 1px solid #f0e9dd;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item:hover {
  background: #faf6f0;
}

.cart-thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f7f1e8, #ffffff);
  border: 1px solid rgba(201, 146, 42, 0.15);
  font-size: 24px;
  overflow: hidden;
}

.cart-thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-content {
  min-width: 0;
}

.cart-item-name {
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-meta {
  color: #7a7a7a;
  font-size: 11px;
}

.cart-item-meta {
  margin-top: 4px;
}

.cart-item-controls {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cart-item-qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e5dcca;
  border-radius: 999px;
  overflow: hidden;
  background: #f7f1e8;
  min-width: 72px;
}

.cart-item-qty-stepper button {
  width: 28px;
  height: 26px;
  border: none;
  background: transparent;
  color: #7a6a55;
  cursor: pointer;
}

.cart-item-qty-stepper span {
  min-width: 28px;
  text-align: center;
  color: #5f5243;
  font-size: 11px;
  font-weight: 700;
}

.cart-item-remove {
  border: none;
  background: transparent;
  color: #a16e2a;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.cart-item-price {
  color: #c58d2f;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.cart-more {
  padding: 10px 16px 0;
  color: #8a8a8a;
  font-size: 11px;
}

.cart-footer {
  display: grid;
  gap: 12px;
  padding: 14px 16px 16px;
  border-top: 1px solid #f0e9dd;
  background: #fffdf9;
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cart-total span {
  color: #7a7a7a;
  font-size: 12px;
}

.cart-total strong {
  color: #12202e;
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
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cart-secondary-btn {
  border: 1px solid rgba(197, 141, 47, 0.32);
  background: #fff;
  color: #c58d2f;
}

.cart-secondary-btn:hover {
  background: #faf6f0;
}

.cart-primary-btn {
  border: none;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: #fff;
}
</style>
