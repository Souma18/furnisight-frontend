<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  activeView: {
    type: String,
    required: true,
  },
  profile: {
    type: Object,
    default: null,
  },
  stats: {
    type: Object,
    default: () => ({ totalOrders: 0, deliveringOrders: 0, wishlistCount: 0 }),
  },
})

defineEmits(['change-view', 'logout'])

const { t } = useI18n()

const navItems = computed(() => [
  { key: 'profile', label: t('account.nav.profile'), icon: 'user' },
  { key: 'bell', label: t('account.nav.notifications'), icon: 'bell' },
  { key: 'cart', label: t('account.nav.cart'), icon: 'cart' },
  { key: 'orders', label: t('account.nav.orders'), icon: 'box' },
  { key: 'wishlist', label: t('account.nav.wishlist'), icon: 'heart' },
  { key: 'settings', label: t('account.nav.settings'), icon: 'settings' },
])

function isActive(key) {
  if (key === 'bell') return String(props.activeView).startsWith('bell')
  return props.activeView === key
}
</script>

<template>
  <nav class="account-nav" :aria-label="t('account.nav.aria')">
    <div class="nav-scroll">
      <AppButton
        v-for="item in navItems"
        :key="item.key"
        type="button"
        class="nav-tab"
        :class="{ active: isActive(item.key) }"
        @click="$emit('change-view', item.key)"
      >
        <AppIcon :name="item.icon" :size="16" />
        <span>{{ item.label }}</span>
      </AppButton>
    </div>

    <AppButton type="button" class="logout-btn" @click="$emit('logout')">
      <AppIcon name="logout" :size="16" />
      <span>{{ t('account.nav.logout') }}</span>
    </AppButton>
  </nav>
</template>

<style scoped>
.account-nav {
  align-items: center;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--app-surface, #fffdf9) 94%, transparent), color-mix(in srgb, var(--app-surface-soft, #f7f1e7) 84%, transparent)),
    var(--app-surface, var(--account-surface, #fffdf9));
  border: 1px solid var(--app-border, rgba(224, 210, 184, 0.82));
  border-radius: 8px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 8px;
}

.nav-scroll {
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-scroll::-webkit-scrollbar {
  display: none;
}

.nav-tab,
.logout-btn {
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
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
  white-space: nowrap;
}

.nav-tab {
  background: transparent;
  border: 1px solid transparent;
  color: var(--app-text-muted, #4d5a65);
  flex: 0 0 auto;
  padding: 0 12px;
}

.nav-tab:hover,
.nav-tab:focus-visible {
  background: color-mix(in srgb, var(--app-gold, #c9922a) 10%, var(--app-surface));
  border-color: color-mix(in srgb, var(--app-gold, #c9922a) 24%, transparent);
  color: var(--app-gold, #8a601c);
  outline: none;
}

.nav-tab.active {
  background: var(--app-navy-soft, #12202e);
  border-color: var(--app-navy-soft, #12202e);
  color: var(--app-heading-inverse, #fffdf9);
}

.logout-btn {
  background: var(--app-control-bg, #fffdf9);
  border: 1px solid color-mix(in srgb, var(--app-danger, #b7352d) 26%, transparent);
  color: var(--app-danger, #b7352d);
  padding: 0 12px;
}

.logout-btn:hover,
.logout-btn:focus-visible {
  background: color-mix(in srgb, var(--app-danger, #b7352d) 10%, var(--app-surface));
  border-color: color-mix(in srgb, var(--app-danger, #b7352d) 42%, transparent);
  outline: none;
}



.nav-tab:active,
.logout-btn:active {
  transform: translateY(1px);
}

@media (max-width: 760px) {
  .account-nav {
    grid-template-columns: 1fr;
  }

  .logout-btn {
    justify-self: stretch;
  }
}
</style>
