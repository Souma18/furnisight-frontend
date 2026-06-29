<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@features/auth/store/authStore'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import AppHeaderCartDropdown from '@shared/layout/AppHeaderCartDropdown.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ThemeToggle from '@shared/ui/ThemeToggle.vue'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

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

    <div class="room3d-actions">
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
        <AppHeaderCartDropdown :is-authenticated="isAuthenticated" @require-auth="openAuthModal">
          <template #trigger="{ openCart, itemCount }">
            <AppButton type="button" class="action-btn gold checkout-trigger" variant="unstyled" @click="openCart">
              <AppIcon name="cart" :size="20" />
              <span>{{ t('room3d.cart.checkout') }}</span>
              <span v-if="itemCount > 0" class="topbar-cart-badge">{{ itemCount }}</span>
            </AppButton>
          </template>
        </AppHeaderCartDropdown>
      </div>
    </div>
  </header>
</template>
