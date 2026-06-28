<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountSidebar from '../components/AccountSidebar.vue'
import ProfileView from '../components/views/ProfileView.vue'
import OrdersView from '../components/views/OrdersView.vue'
import OrderDetailView from '../components/views/OrderDetailView.vue'
import CartView from '../components/views/CartView.vue'
import WishlistView from '../components/views/WishlistView.vue'
import NotificationsView from '../components/views/NotificationsView.vue'
import SettingsView from '../components/views/SettingsView.vue'
import { useAccountPage } from '../composables/useAccountPage'
import { useAuth } from '@features/auth/composables/useAuth'

import '../assets/account-shared.css'

import { defineAsyncComponent } from 'vue'

const { logout: authLogout } = useAuth()
const { t } = useI18n()

const {
  activeView,
  profile,
  stats,
  setView,
  showToast,
} = useAccountPage()

const notificationCategory = computed(() => {
  const map = {
    bell: 'all',
    'bell-order': 'order',
    'bell-promo': 'promo',
    'bell-system': 'system',
    'bell-review': 'review',
  }

  return map[activeView.value] ?? 'all'
})

async function handleLogout() {
  showToast(t('account.toast.logoutSuccess'))
  await authLogout({ name: 'home' })
}
</script>

<template>
  <div class="account-page">
    <AccountSidebar
      :active-view="activeView"
      :profile="profile"
      :stats="stats"
      @change-view="setView"
      @logout="handleLogout"
    />

    <main class="account-content">
      <ProfileView
        v-if="activeView === 'profile'"
        @notify="showToast"
      />
      <NotificationsView
        v-else-if="String(activeView).startsWith('bell')"
        :notification-category="notificationCategory"
        @notify="showToast"
      />
      <OrdersView v-else-if="activeView === 'orders'" @notify="showToast" />
      <OrderDetailView v-else-if="activeView === 'order-detail'" @notify="showToast" />
      <CartView v-else-if="activeView === 'cart'" @notify="showToast" />
      <WishlistView
        v-else-if="activeView === 'wishlist'"
        @notify="showToast"
      />
      <SettingsView v-else-if="activeView === 'settings'" />
    </main>

  </div>
</template>

<style scoped>
.account-page {
  --acc-ink: var(--app-heading);
  --acc-muted: var(--app-text-muted);
  --acc-line: var(--app-border);
  --acc-surface: var(--app-surface);
  --acc-soft: var(--app-surface-soft);
  --acc-gold: var(--app-gold);
  --acc-danger: var(--app-danger);
  --account-bg: var(--app-bg);
  --account-surface: var(--app-surface);
  --account-text-strong: var(--app-heading);
  --account-text-muted: var(--app-text-muted);
  --account-field-bg: var(--app-surface);
  --account-field-text: var(--app-text);
  --account-field-border: var(--app-border);
  --account-badge: var(--app-gold);
  --account-upload-bg: var(--app-navy);
  --account-upload-hover: var(--app-navy-soft);
  --account-upload-text: var(--app-heading-inverse);
  --account-stat-default: var(--app-gold);
  --account-stat-delivering: var(--app-gold);
  --account-stat-success: var(--app-success);
  --account-stat-danger: var(--app-danger);
  --auth-border: var(--app-border);
  --auth-text-primary: var(--app-heading);
  --auth-text-secondary: var(--app-text-muted);
  --auth-brand-start: var(--app-gold);
  --auth-brand-end: var(--brand-gold-700);
  --color-white: var(--app-surface);
  --color-error: var(--app-danger);
  background:
    radial-gradient(circle at 4% 0%, var(--app-gold-soft), transparent 24rem),
    linear-gradient(180deg, color-mix(in srgb, var(--app-surface) 82%, transparent), color-mix(in srgb, var(--app-surface-soft) 88%, transparent)),
    var(--account-bg);
  align-content: start;
  color: var(--acc-ink);
  display: grid;
  gap: 14px;
  grid-auto-rows: max-content;
  margin: 0 auto;
  max-width: 1180px;
  min-height: calc(100svh - 62px - 44px);
  width: 100%;
}
</style>
