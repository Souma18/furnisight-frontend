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
  <aside class="account-sidebar" :aria-label="t('account.nav.aria')">
    <div class="sidebar-profile" v-if="profile">
      <div class="sidebar-avatar">
        <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="profile.displayName || profile.fullName" />
        <span v-else class="sidebar-avatar-placeholder">{{ (profile.displayName || profile.fullName || profile.email || '?').charAt(0).toUpperCase() }}</span>
      </div>
      <div class="sidebar-profile-info">
        <strong class="sidebar-name">{{ profile.displayName || profile.fullName || profile.email }}</strong>
      </div>
    </div>

    <nav class="sidebar-nav">
      <AppButton
        v-for="item in navItems"
        :key="item.key"
        type="button"
        class="nav-tab"
        :class="{ active: isActive(item.key) }"
        @click="$emit('change-view', item.key)"
      >
        <AppIcon :name="item.icon" :size="17" />
        <span>{{ item.label }}</span>
      </AppButton>
    </nav>

    <AppButton type="button" class="logout-btn" @click="$emit('logout')">
      <AppIcon name="logout" :size="17" />
      <span>{{ t('account.nav.logout') }}</span>
    </AppButton>
  </aside>
</template>

<style scoped>
.account-sidebar {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--app-surface, #fffdf9) 94%, transparent), color-mix(in srgb, var(--app-surface-soft, #f7f1e7) 84%, transparent)),
    var(--app-surface, #fffdf9);
  border: 1px solid var(--app-border, rgba(224, 210, 184, 0.82));
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 8px 10px;
  position: sticky;
  top: calc(62px + 10px);
  max-height: calc(100svh - 62px - 30px);
  overflow-y: auto;
  scrollbar-width: none;
}

.account-sidebar::-webkit-scrollbar {
  display: none;
}

/* Profile block ở đầu sidebar */
.sidebar-profile {
  align-items: center;
  border-bottom: 1px solid var(--app-border, rgba(224, 210, 184, 0.7));
  display: flex;
  gap: 10px;
  margin-bottom: 4px;
  padding: 6px 6px 12px;
}

.sidebar-avatar {
  align-items: center;
  background: var(--app-surface-soft, #f7f1e7);
  border: 1px solid var(--app-border, rgba(224, 210, 184, 0.82));
  border-radius: 8px;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;
}

.sidebar-avatar img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.sidebar-avatar-placeholder {
  color: var(--app-gold, #c9922a);
  font-size: 1.05rem;
  font-weight: 760;
}

.sidebar-name {
  color: var(--app-heading, #1a2332);
  font-size: 0.88rem;
  font-weight: 720;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Nav items dọc */
.sidebar-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.nav-tab,
.logout-btn {
  appearance: none;
  -webkit-appearance: none;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 680;
  gap: 9px;
  justify-content: flex-start;
  line-height: 1;
  min-height: 40px;
  padding: 0 12px;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
  white-space: nowrap;
  width: 100%;
}

.nav-tab {
  background: transparent;
  border: 1px solid transparent;
  color: var(--app-text-muted, #4d5a65);
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

/* Logout ở dưới cùng */
.logout-btn {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--app-danger, #b7352d) 26%, transparent);
  color: var(--app-danger, #b7352d);
  margin-top: auto;
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

/* Mobile: horizontal scroll nav */
@media (max-width: 860px) {
  .account-sidebar {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 6px;
    max-height: none;
    overflow-x: auto;
    overflow-y: visible;
    padding: 8px;
    position: static;
  }

  .sidebar-profile {
    border-bottom: none;
    border-right: 1px solid var(--app-border, rgba(224, 210, 184, 0.7));
    flex-shrink: 0;
    margin-bottom: 0;
    padding: 2px 12px 2px 4px;
  }

  .sidebar-profile-info {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    flex: 1;
    gap: 4px;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .sidebar-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-tab {
    flex-shrink: 0;
    justify-content: center;
    width: auto;
    padding: 0 12px;
  }

  .logout-btn {
    flex-shrink: 0;
    justify-content: center;
    margin-top: 0;
    width: auto;
    padding: 0 12px;
  }
}
</style>
