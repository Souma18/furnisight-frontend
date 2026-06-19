<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  cartItems: {
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
})

defineEmits(['remove', 'checkout'])

const isOpen = ref(false)
const { t } = useI18n()

function itemIconName(item) {
  const raw = `${item.categoryName ?? ''} ${item.category ?? ''}`.toLowerCase()
  if (raw.includes('sofa')) return 'sofa'
  if (raw.includes('chair') || raw.includes('ghế')) return 'armchair'
  if (raw.includes('bed') || raw.includes('giường')) return 'bed'
  if (raw.includes('table') || raw.includes('bàn')) return 'table'
  return 'box'
}
</script>

<template>
  <section class="cart">
    <button type="button" class="cart-toggle" @click="isOpen = !isOpen">
      <span class="toggle-left">
        <span class="icon"><AppIcon name="cart" :size="14" /></span>
        <span class="title">{{ t('cart.title') }}</span>
        <span class="count">{{ cartItems.length }}</span>
      </span>
      <span class="toggle-right">
        <strong class="total">{{ formatCurrency(cartTotal) }}</strong>
        <span class="chevron" :class="{ open: isOpen }">
          <AppIcon name="chevronRight" :size="13" />
        </span>
      </span>
    </button>

    <div v-if="isOpen" class="cart-body">
      <div v-if="cartItems.length === 0" class="empty">{{ t('room3d.cart.empty') }}</div>
      <div v-else class="list">
        <article v-for="item in cartItems" :key="item.id" class="item">
          <div class="thumb">
            <img v-if="item.imageUrl || item.image" :src="item.imageUrl || item.image" :alt="item.name" />
            <span v-else class="thumb-icon"><AppIcon :name="itemIconName(item)" :size="16" /></span>
          </div>
          <div class="meta">
            <p class="name">{{ item.name }}</p>
            <p class="price">{{ formatCurrency(item.price) }}</p>
          </div>
          <button type="button" class="remove-btn" @click="$emit('remove', item.id)">
            <AppIcon name="close" :size="15" />
          </button>
        </article>
      </div>

      <button type="button" class="checkout" :disabled="cartItems.length === 0" @click="$emit('checkout')">
        <AppIcon name="creditCard" :size="15" />
        <span>{{ t('room3d.cart.checkoutNow') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.cart {
  border: 1px solid var(--app-border, #e6ded1);
  border-radius: 8px;
  overflow: hidden;
  background: var(--app-surface, #fff);
}

.cart-toggle {
  width: 100%;
  border: none;
  background: var(--app-surface, #fff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.62rem 0.7rem;
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.cart-toggle:hover {
  background: var(--app-control-hover, #f8f5ef);
}

.toggle-left {
  display: flex;
  align-items: center;
  gap: 0.38rem;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--app-gold, #133f5c);
}

.title {
  color: var(--app-heading, #133f5c);
  font-size: 0.95rem;
  font-weight: 700;
}

.count {
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: var(--app-gold, #f6b22f);
  color: var(--app-bg-deep, #0f3f5c);
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.35rem;
}

.toggle-right {
  display: flex;
  align-items: center;
  gap: 0.36rem;
}

.total {
  color: var(--app-gold, #9a744f);
  font-size: 0.88rem;
}

.chevron {
  color: var(--app-text-muted, #8f8f8f);
  font-size: 0.72rem;
  transition: transform 0.18s ease;
}

.chevron.open {
  transform: rotate(90deg);
}

.cart-body {
  border-top: 1px solid var(--app-border, #f0e7da);
  padding: 0.55rem 0.68rem 0.68rem;
}

.empty {
  color: var(--app-text-muted, #8f8f8f);
  font-size: 0.83rem;
  text-align: center;
  padding: 0.7rem 0 0.5rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.44rem;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--app-border, #f3ece1);
  padding-bottom: 0.42rem;
}

.item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.thumb {
  width: 2rem;
  height: 2rem;
  border-radius: 0.56rem;
  background: var(--app-surface-soft, #f2ece2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex: 0 0 auto;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-icon {
  color: var(--app-gold, #846640);
  display: inline-flex;
}

.meta {
  min-width: 0;
  flex: 1;
}

.name {
  margin: 0;
  color: var(--app-heading, #25313a);
  font-size: 0.77rem;
  line-height: 1.2;
}

.price {
  margin: 0.1rem 0 0;
  color: var(--app-gold, #9a744f);
  font-size: 0.77rem;
  font-weight: 700;
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--app-text-muted, #9a9a9a);
  font-size: 0.86rem;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 0.38rem;
  cursor: pointer;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.remove-btn:hover {
  background: color-mix(in srgb, var(--app-danger) 10%, var(--app-surface));
  color: var(--app-danger, #d14d4d);
}

.checkout {
  width: 100%;
  border: none;
  border-radius: 0.72rem;
  margin-top: 0.62rem;
  padding: 0.58rem 0.7rem;
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #fff;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.checkout:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(197, 141, 47, 0.3);
}

.checkout:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
