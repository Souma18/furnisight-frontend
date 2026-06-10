<script setup>
import { useRouter } from 'vue-router'
import CartPreviewList from '@features/cart/components/CartPreviewList.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const router = useRouter()

defineProps({
  selectedRoom: {
    type: Object,
    default: null,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
  cartItems: {
    type: Array,
    default: () => [],
  },
  cartTotal: {
    type: Number,
    default: 0,
  },
})

defineEmits(['open-checkout', 'toggle-fullscreen', 'update-cart-qty', 'remove-product'])

function goHome() {
  router.push('/')
}
</script>

<template>
  <header class="header">
    <div class="brand">
      <span class="brand-icon"><AppIcon name="sparkles" :size="15" /></span>
      <span class="brand-text">LUXNEST</span>
    </div>

    <div class="center-title">
      <span class="title">Trực quan hóa 3D</span>
      <span class="ai-pill">Gợi ý thông minh</span>
    </div>

    <div class="actions">
      <button type="button" class="action-btn ghost" @click="goHome">
        <AppIcon name="chevronLeft" :size="14" />
        <span>Trang chủ</span>
      </button>
      <button type="button" class="action-btn ghost" @click="$emit('toggle-fullscreen')">
        <AppIcon name="fullscreen" :size="14" />
        <span>Toàn màn hình</span>
      </button>
      <div class="checkout-wrap">
        <button type="button" class="action-btn gold checkout-trigger">
          <AppIcon name="cart" :size="14" />
          <span>Thanh toán</span>
          <span class="cart-badge">{{ cartCount }}</span>
        </button>

        <div class="checkout-dropdown">
          <div class="cart-header">
            <div class="cart-title">
              Giỏ hàng
              <span v-if="cartCount" class="cart-count">{{ cartCount }}</span>
            </div>
            <button type="button" class="cart-head-link" @click="$emit('open-checkout')">
              Thanh toán
            </button>
          </div>

          <CartPreviewList
            :items="cartItems"
            :total-count="cartCount"
            :total-amount="cartTotal"
            @open-cart="$emit('open-checkout')"
            @update-qty="(lineId, qty) => $emit('update-cart-qty', lineId, qty)"
            @remove="$emit('remove-product', $event)"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.7rem 1rem;
  background: linear-gradient(180deg, #133f5c 0%, #0c3148 100%);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
}

.brand-icon {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 178, 60, 0.2);
}

.brand-text {
  color: #efe6d7;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.center-title {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
}

.title {
  color: #e7f0f8;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.ai-pill {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #1f3f53;
  border-radius: 999px;
  padding: 0.24rem 0.72rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  justify-content: flex-end;
}

.checkout-wrap {
  position: relative;
}

.action-btn {
  border: none;
  cursor: pointer;
  border-radius: 0.55rem;
  min-height: 1.9rem;
  padding: 0.28rem 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 600;
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.16);
  color: #eef4f9;
}

.action-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.24);
}

.action-btn.gold {
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #ffffff;
}

.action-btn.gold:hover {
  filter: brightness(1.06);
}

.cart-badge {
  min-width: 1.05rem;
  height: 1.05rem;
  border-radius: 999px;
  background: #f7b94c;
  color: #233f53;
  font-size: 0.62rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.28rem;
}

.checkout-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(396px, 92vw);
  overflow: hidden;
  border: 1px solid #ece2cf;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(18, 32, 46, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.97);
  transition: all 0.22s cubic-bezier(0.22, 0.68, 0, 1.2);
  z-index: 600;
}

.checkout-wrap:hover .checkout-dropdown,
.checkout-wrap:focus-within .checkout-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.checkout-dropdown::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 22px;
  width: 12px;
  height: 12px;
  transform: rotate(45deg);
  border-top: 1px solid #ece2cf;
  border-left: 1px solid #ece2cf;
  background: #fff;
  z-index: 1;
}

.cart-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #f0e9dd;
  background: #fff;
}

.cart-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.cart-count {
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 10px;
  background: #12202e;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.cart-head-link {
  border: none;
  background: none;
  color: #c58d2f;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cart-head-link:hover {
  color: #e5b84a;
}

@media (max-width: 980px) {
  .header {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
