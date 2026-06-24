<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountSidebar from '../components/AccountSidebar.vue'
import AccountToast from '../components/AccountToast.vue'
import ProfileView from '../components/views/ProfileView.vue'
import OrdersView from '../components/views/OrdersView.vue'
import OrderDetailView from '../components/views/OrderDetailView.vue'
import CartView from '../components/views/CartView.vue'
import WishlistView from '../components/views/WishlistView.vue'
import NotificationsView from '../components/views/NotificationsView.vue'
import SettingsView from '../components/views/SettingsView.vue'
import { useAccountPage } from '../composables/useAccountPage'
import { useAuth } from '@features/auth/composables/useAuth'

const { logout: authLogout } = useAuth()
const { t } = useI18n()

const {
  activeView,
  profile,
  stats,
  toast,
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
      <CartView v-else-if="activeView === 'cart'" />
      <WishlistView
        v-else-if="activeView === 'wishlist'"
        @notify="showToast"
      />
      <SettingsView v-else-if="activeView === 'settings'" />
    </main>

    <AccountToast :show="toast.open" :message="toast.message" :type="toast.type" />
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

.account-content {
  min-width: 0;
  padding-bottom: 22px;
}

:deep(.card),
:deep(.detail-card),
:deep(.order-card),
:deep(.item),
:deep(.voucher-card),
:deep(.notification-item),
:deep(.security-card),
:deep(.row),
:deep(.select-all-row),
:deep(.variant-modal),
:deep(.modal) {
  background: var(--acc-surface);
  border: 1px solid var(--acc-line);
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(18, 32, 46, 0.045);
}

:deep(.card-head),
:deep(.variant-modal-head),
:deep(.detail-card-title),
:deep(.order-card-head),
:deep(.vouchers-head),
:deep(.review-form-head) {
  border-color: var(--acc-line);
}

:deep(.account-nav) {
  align-items: center;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--account-surface) 96%, transparent), color-mix(in srgb, var(--acc-soft) 88%, transparent)),
    var(--account-surface);
  border: 1px solid var(--acc-line);
  border-radius: 8px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 8px;
}

:deep(.nav-scroll) {
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

:deep(.nav-scroll::-webkit-scrollbar) {
  display: none;
}

:deep(.nav-tab),
:deep(.account-nav .logout-btn),
:deep(.edit-btn),
:deep(.avatar-action),
:deep(.ghost),
:deep(.primary) {
  appearance: none;
  -webkit-appearance: none;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 720;
  gap: 7px;
  justify-content: center;
  line-height: 1;
  min-height: 38px;
  white-space: nowrap;
}

:deep(.nav-tab) {
  background: transparent;
  border: 1px solid transparent;
  color: var(--acc-muted);
  flex: 0 0 auto;
  padding: 0 12px;
}

:deep(.nav-tab:hover),
:deep(.nav-tab:focus-visible) {
  background: color-mix(in srgb, var(--acc-gold) 10%, var(--acc-surface));
  border-color: color-mix(in srgb, var(--acc-gold) 24%, transparent);
  color: var(--acc-gold);
}

:deep(.nav-tab.active) {
  background: var(--app-navy-soft);
  border-color: var(--app-navy-soft);
  color: var(--app-heading-inverse);
}

:deep(.account-nav .logout-btn) {
  background: var(--app-control-bg);
  border: 1px solid color-mix(in srgb, var(--acc-danger) 26%, transparent);
  color: var(--acc-danger);
  padding: 0 12px;
}

:deep(.profile-simple) {
  display: grid;
  gap: 18px;
}

:deep(.profile-summary) {
  align-items: start;
  border-bottom: 1px solid rgba(224, 210, 184, 0.74);
  display: grid;
  gap: 18px;
  grid-template-columns: auto minmax(0, 1fr);
  padding-bottom: 18px;
}

:deep(.avatar-button) {
  appearance: none;
  -webkit-appearance: none;
  background: var(--acc-soft);
  border: 1px solid rgba(224, 210, 184, 0.92);
  border-radius: 8px;
  color: var(--acc-gold);
  cursor: pointer;
  display: grid;
  font: inherit;
  font-size: 1.35rem;
  font-weight: 780;
  height: 74px;
  overflow: hidden;
  padding: 0;
  place-items: center;
  position: relative;
  width: 74px;
}

:deep(.avatar-button img) {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

:deep(.avatar-camera) {
  align-items: center;
  background: rgba(18, 32, 46, 0.9);
  border: 1px solid rgba(255, 253, 249, 0.58);
  border-radius: 999px;
  bottom: 6px;
  color: #fffdf9;
  display: inline-flex;
  height: 24px;
  justify-content: center;
  position: absolute;
  right: 6px;
  width: 24px;
}

:deep(.profile-identity) {
  align-items: start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  min-width: 0;
}

:deep(.profile-summary .summary-copy) {
  display: grid;
  gap: 4px;
  min-width: 0;
}

:deep(.summary-kicker) {
  color: var(--acc-gold);
  font-size: 0.72rem;
  font-weight: 780;
  letter-spacing: 0.11em;
  margin: 0;
  text-transform: uppercase;
}

:deep(.profile-summary h4) {
  color: var(--acc-ink);
  font-size: clamp(1.28rem, 2.3vw, 1.8rem);
  line-height: 1.12;
  margin: 0;
}

:deep(.profile-summary p:not(.summary-kicker)) {
  color: var(--acc-muted);
  font-size: 0.9rem;
  margin: 0;
}

:deep(.avatar-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 3px;
}

:deep(.read-list) {
  display: grid;
  gap: 0;
}

:deep(.read-row) {
  align-items: baseline;
  border-bottom: 1px solid rgba(224, 210, 184, 0.58);
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(120px, 0.28fr) minmax(0, 1fr);
  padding: 15px 0;
}

:deep(.read-row span) {
  color: var(--acc-muted);
  font-size: 0.82rem;
  font-weight: 650;
}

:deep(.read-row strong) {
  color: var(--acc-ink);
  font-size: 0.95rem;
  font-weight: 680;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(.orders-title),
:deep(.voucher-title),
:deep(.order-detail-title),
:deep(.detail-card-title),
:deep(.item-title),
:deep(.name),
:deep(.cell-name) {
  color: var(--acc-ink);
  letter-spacing: 0;
}

:deep(.meta),
:deep(.email),
:deep(.item-desc),
:deep(.order-meta),
:deep(.timeline-sub),
:deep(.date),
:deep(.count),
:deep(.empty),
:deep(.empty-state),
:deep(.state-card) {
  color: var(--acc-muted);
}

:deep(.orders-view),
:deep(.order-detail),
:deep(.security-layout),
:deep(.vouchers-view),
:deep(.list) {
  display: grid;
  gap: 14px;
}

:deep(.orders-title),
:deep(.order-detail-title) {
  font-size: clamp(1.28rem, 2vw, 1.72rem);
  line-height: 1.14;
  margin: 0;
}

:deep(.orders-filters),
:deep(.voucher-filters),
:deep(.notification-tabs),
:deep(.toolbar) {
  align-items: center;
  background: color-mix(in srgb, var(--acc-surface) 72%, transparent);
  border: 1px solid var(--acc-line);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}

:deep(.orders-filters button),
:deep(.voucher-filters button),
:deep(.notification-tabs button) {
  background: transparent;
  border: 1px solid transparent;
  color: var(--acc-muted);
  min-height: 34px;
  padding: 0 12px;
}

:deep(.chip.active),
:deep(.voucher-filters button.active),
:deep(.orders-filters button.active) {
  background: color-mix(in srgb, var(--acc-gold) 14%, var(--acc-surface));
  border-color: color-mix(in srgb, var(--acc-gold) 36%, transparent);
  color: var(--acc-gold);
}

:deep(.orders-list),
:deep(.voucher-list),
:deep(.notification-list),
:deep(.groups) {
  display: grid;
  gap: 12px;
}

:deep(.order-detail-grid) {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.34fr);
}

:deep(.order-detail-main),
:deep(.order-detail-side) {
  display: grid;
  gap: 14px;
}

:deep(.order-detail-side) {
  position: sticky;
  top: 76px;
}

:deep(.order-detail-back) {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  color: #8a601c;
  display: inline-flex;
  gap: 7px;
  justify-self: start;
  padding: 0;
}

:deep(.status-badge),
:deep(.badge),
:deep(.voucher-status),
:deep(.item-tag) {
  border-radius: 999px;
  font-weight: 720;
}

:deep(.price),
:deep(.total),
:deep(.amount),
:deep(.order-total),
:deep(.summary-row),
:deep(.stat strong),
:deep(.stats strong),
:deep(.date),
:deep(.modal-qty input),
:deep(.order-line-price),
:deep(.voucher-discount) {
  font-variant-numeric: tabular-nums;
}

:deep(button),
:deep(input),
:deep(select),
:deep(textarea),
:deep(.readonly-field) {
  border-radius: 8px;
}

:deep(input),
:deep(select),
:deep(textarea),
:deep(.readonly-field) {
  background: var(--app-control-bg);
  border: 1px solid var(--acc-line);
  color: var(--acc-ink);
}

:deep(input:focus-visible),
:deep(select:focus-visible),
:deep(textarea:focus-visible),
:deep(button:focus-visible) {
  outline: 2px solid rgba(201, 146, 42, 0.28);
  outline-offset: 2px;
}

:deep(button) {
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

:deep(button:not(:disabled):active) {
  transform: translateY(1px);
}

:deep(.primary),
:deep(.primary-btn),
:deep(.order-pay-btn),
:deep(.refresh-btn),
:deep(.mark-all-btn) {
  background: var(--app-navy-soft);
  border: 1px solid var(--app-navy-soft);
  color: var(--app-heading-inverse);
}

:deep(.primary:hover:not(:disabled)),
:deep(.primary-btn:hover:not(:disabled)),
:deep(.order-pay-btn:hover:not(:disabled)),
:deep(.refresh-btn:hover:not(:disabled)),
:deep(.mark-all-btn:hover:not(:disabled)) {
  background: #1b3044;
  border-color: #1b3044;
}

:deep(.ghost),
:deep(.ghost-btn),
:deep(.secondary-btn),
:deep(.order-detail-btn),
:deep(.text-btn),
:deep(.copy-btn) {
  color: var(--acc-gold);
}

:deep(.empty),
:deep(.empty-state),
:deep(.state-card),
:deep(.orders-empty),
:deep(.voucher-state),
:deep(.order-detail-missing) {
  background: color-mix(in srgb, var(--acc-surface) 72%, transparent);
  border: 1px dashed var(--acc-line);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

[data-theme='dark'] .account-page {
  background:
    radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--app-gold) 10%, transparent), transparent 24rem),
    var(--app-bg) !important;
}

[data-theme='dark'] :deep(.account-nav) {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--app-surface-soft) 74%, transparent), color-mix(in srgb, var(--app-surface) 94%, transparent)),
    var(--app-surface) !important;
  border-color: var(--app-border) !important;
}

[data-theme='dark'] :deep(.nav-tab) {
  background: transparent !important;
  border-color: transparent !important;
  color: var(--app-text-muted) !important;
}

[data-theme='dark'] :deep(.nav-tab:hover),
[data-theme='dark'] :deep(.nav-tab:focus-visible) {
  background: var(--app-control-hover) !important;
  border-color: var(--app-border-strong) !important;
  color: var(--app-heading) !important;
}

[data-theme='dark'] :deep(.nav-tab.active) {
  background: color-mix(in srgb, var(--app-gold) 20%, var(--app-surface-soft)) !important;
  border-color: color-mix(in srgb, var(--app-gold) 52%, var(--app-border)) !important;
  color: var(--app-heading) !important;
}

[data-theme='dark'] :deep(.account-nav .logout-btn) {
  background: var(--app-control-bg) !important;
  border-color: color-mix(in srgb, var(--app-danger) 34%, var(--app-border)) !important;
  color: var(--app-danger) !important;
}

[data-theme='dark'] :deep(.card),
[data-theme='dark'] :deep(.profile-simple),
[data-theme='dark'] :deep(.detail-card),
[data-theme='dark'] :deep(.order-card),
[data-theme='dark'] :deep(.item),
[data-theme='dark'] :deep(.voucher-card),
[data-theme='dark'] :deep(.notification-item),
[data-theme='dark'] :deep(.security-card),
[data-theme='dark'] :deep(.row),
[data-theme='dark'] :deep(.select-all-row) {
  background: var(--app-surface) !important;
  border-color: var(--app-border) !important;
  color: var(--app-text) !important;
}

@media (max-width: 900px) {
  :deep(.profile-identity) {
    flex-direction: column;
    gap: 10px;
  }

  :deep(.avatar-actions) {
    justify-content: flex-start;
    padding-top: 0;
  }

  :deep(.order-detail-grid) {
    grid-template-columns: 1fr;
  }

  :deep(.order-detail-side) {
    position: static;
  }
}

@media (max-width: 560px) {
  .account-page {
    gap: 12px;
  }
}
</style>
