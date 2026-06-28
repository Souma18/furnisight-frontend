<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CartPreviewList from '@features/cart/components/CartPreviewList.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ThemeToggle from '@shared/ui/ThemeToggle.vue'

const router = useRouter()
const { t } = useI18n()

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
  <header class="room3d-header">
    <div class="room3d-brand" @click="goHome" style="cursor: pointer;">
      <span class="room3d-brand-icon" aria-hidden="true">
        <AppImage src="/brand/furnisight-logo-mark.png" alt=""  />
      </span>
      <span class="room3d-brand-text">FurniSight</span>
    </div>

    <div class="center-title">
      <span class="title">{{ t('room3d.topbar.title') }}</span>
      <span class="ai-pill">{{ t('room3d.topbar.smart') }}</span>
    </div>

    <div class="actions">
      <AppButton type="button" class="action-btn ghost" variant="unstyled" @click="goHome">
        <AppIcon name="chevronLeft" :size="14" />
        <span>{{ t('nav.home') }}</span>
      </AppButton>
      <AppButton type="button" class="action-btn ghost" variant="unstyled" @click="$emit('toggle-fullscreen')">
        <AppIcon name="fullscreen" :size="14" />
        <span>{{ t('room3d.topbar.fullscreen') }}</span>
      </AppButton>
      <ThemeToggle variant="icon" />
      <div class="checkout-wrap">
        <AppButton type="button" class="action-btn gold checkout-trigger" variant="unstyled">
          <AppIcon name="cart" :size="20" />
          <span>{{ t('room3d.cart.checkout') }}</span>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </AppButton>

        <div class="checkout-dropdown">
          <div class="cart-header">
            <div class="cart-title">
              {{ t('cart.title') }}
              <span v-if="cartCount" class="cart-count">{{ cartCount }}</span>
            </div>
            <AppButton type="button" class="cart-head-link" @click="$emit('open-checkout')">
              {{ t('room3d.cart.checkout') }}
            </AppButton>
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
