<script setup>
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCart } from '@features/cart/composables/useCart'
import CartPreviewList from '@features/cart/components/CartPreviewList.vue'
import { getApiErrorMessage } from '@shared/lib/api'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['require-auth'])

const isHovered = ref(false)

const router = useRouter()
const { t } = useI18n()
const { items, itemCount, totalAmount, ensureHydrated, updateQty, removeItem } = useCart()

function ensureCartLoaded() {
  if (!props.isAuthenticated) return
  ensureHydrated().catch((error) => {
    console.warn('[CartDropdown] hydrate failed:', getApiErrorMessage(error))
  })
}

function openCart() {
  if (!props.isAuthenticated) {
    emit('require-auth')
    return
  }

  router.push({ path: '/account', query: { view: 'cart' } })
}

async function handleUpdateQty(lineId, nextQty) {
  if (!props.isAuthenticated) {
    emit('require-auth')
    return
  }

  try {
    await updateQty(lineId, nextQty)
  } catch (error) {
    console.error('Failed to update cart quantity from header:', error)
  }
}

async function handleRemove(lineId) {
  if (!props.isAuthenticated) {
    emit('require-auth')
    return
  }

  try {
    await removeItem(lineId)
  } catch (error) {
    console.error('Failed to remove cart item from header:', error)
  }
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
  <div class="cart-wrap" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <slot name="trigger" :item-count="itemCount" :open-cart="openCart" :is-hovered="isHovered">
      <button class="cart-trigger" type="button" :aria-label="t('cart.open')" @click="openCart">
        <AppIcon name="cart" :size="14" />
        <span v-if="itemCount" class="cart-badge">{{ itemCount }}</span>
      </button>
    </slot>

    <div class="cart-dropdown">
      <div class="cart-header">
        <div class="cart-title">
          {{ t('cart.title') }}
          <span v-if="itemCount" class="cart-count">{{ itemCount }}</span>
        </div>
        <button type="button" class="cart-head-link" @click="openCart">{{ t('cart.view') }}</button>
      </div>

      <CartPreviewList
        :items="items"
        :total-count="itemCount"
        :total-amount="totalAmount"
        @open-cart="openCart"
        @update-qty="handleUpdateQty"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

<style scoped>
.cart-wrap {
  position: relative;
}

.cart-trigger {
  border: 1px solid rgba(255, 250, 241, 0.12);
  cursor: pointer;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 250, 241, 0.07);
  color: rgba(255, 250, 241, 0.9);
  position: relative;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.cart-trigger:hover,
.cart-trigger:focus-visible {
  border-color: var(--header-cream, var(--app-surface));
  background: var(--header-cream, var(--app-surface));
  color: var(--header-ink, var(--app-heading));
  outline: none;
}

.cart-trigger:active {
  transform: translateY(1px);
}

.cart-badge {
  position: absolute;
  top: -0.15rem;
  right: -0.15rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.22rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand-gold-400), var(--app-gold));
  color: var(--brand-navy-900);
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
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
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
  border-top: 1px solid var(--app-border);
  border-left: 1px solid var(--app-border);
  background: var(--app-surface);
  z-index: 1;
}

.cart-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 16px 12px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
}

.cart-title {
  font-size: 14px;
  font-weight: 760;
  color: var(--app-heading);
}

.cart-count {
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 8px;
  background: var(--app-navy);
  color: var(--app-heading-inverse);
  font-size: 10px;
  font-weight: 700;
}

.cart-head-link {
  border: none;
  background: none;
  color: var(--app-gold);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: color 0.18s ease, text-decoration-color 0.18s ease;
}

.cart-head-link:hover,
.cart-head-link:focus-visible {
  color: var(--brand-gold-400);
  outline: none;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 980px) {
  .cart-dropdown {
    width: min(92vw, 396px);
    right: 0;
  }

  .cart-trigger {
    width: 2rem;
    height: 2rem;
  }
}
</style>
