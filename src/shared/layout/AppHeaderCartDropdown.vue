<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@features/cart/composables/useCart'
import CartPreviewList from '@features/cart/components/CartPreviewList.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['require-auth'])

const router = useRouter()
const { items, itemCount, totalAmount, ensureHydrated } = useCart()

function ensureCartLoaded() {
  if (!props.isAuthenticated) return
  ensureHydrated()
}

function openCart() {
  if (!props.isAuthenticated) {
    emit('require-auth')
    return
  }

  router.push({ path: '/account', query: { view: 'cart' } })
}

onMounted(() => {
  ensureCartLoaded()
})

watch(
  () => props.isAuthenticated,
  (nextValue) => {
    if (nextValue) ensureCartLoaded()
  },
)
</script>

<template>
  <div class="cart-wrap">
    <button class="cart-trigger" type="button" aria-label="Giỏ hàng" @click="openCart">
      <AppIcon name="cart" :size="14" />
      <span v-if="itemCount" class="cart-badge">{{ itemCount }}</span>
    </button>

    <div class="cart-dropdown">
      <div class="cart-header">
        <div class="cart-title">
          Giỏ hàng
          <span v-if="itemCount" class="cart-count">{{ itemCount }}</span>
        </div>
        <button type="button" class="cart-head-link" @click="openCart">Xem giỏ</button>
      </div>

      <CartPreviewList
        :items="items"
        :total-count="itemCount"
        :total-amount="totalAmount"
        @open-cart="openCart"
      />
    </div>
  </div>
</template>

<style scoped>
.cart-wrap {
  position: relative;
}

.cart-trigger {
  border: none;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: #f5f7f8;
  position: relative;
}

.cart-trigger:hover {
  background: rgba(255, 255, 255, 0.16);
}

.cart-badge {
  position: absolute;
  top: -0.15rem;
  right: -0.15rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.22rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #e5b84a, #c9922a);
  color: #12202e;
  font-size: 0.62rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.cart-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: -10px;
  width: 396px;
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

.cart-wrap:hover .cart-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.cart-dropdown::before {
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
  font-weight: 500;
  cursor: pointer;
}

.cart-head-link:hover {
  color: #e5b84a;
}

@media (max-width: 980px) {
  .cart-dropdown {
    width: min(92vw, 396px);
    right: 0;
  }
}
</style>
