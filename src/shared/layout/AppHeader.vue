<script setup>
import { RouterLink } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@shared/stores/localeStore'
import { mapInboxMessageToFrontend } from '@features/account/composables/useNotificationsCenter'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import { getApiErrorMessage } from '@shared/lib/api'
import { notificationsApi } from '@shared/lib/api/services'
import AppIcon from '@shared/ui/AppIcon.vue'
import ThemeToggle from '@shared/ui/ThemeToggle.vue'
import LanguageToggle from '@shared/ui/LanguageToggle.vue'
import AppHeaderCartDropdown from './AppHeaderCartDropdown.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const authStore = useAuthStore()
const { isAuthenticated, isAdmin } = storeToRefs(authStore)
const notifications = ref([])

const activeNav = computed(() => {
  const path = router?.currentRoute?.value?.path || ''
  if (path.startsWith('/products')) return 'products'
  if (route.path.startsWith('/contact')) return 'contact'
  if (path.startsWith('/room3d')) return 'room3d'
  if (path.startsWith('/khuyen-mai')) return 'promotions'
  if (path === '/') return 'home'
  return ''
})

const unreadNotificationCount = computed(() => notifications.value.filter((item) => !item.isRead).length)
const previewNotifications = computed(() => notifications.value.slice(0, 5))

async function loadNotifications() {
  const response = await notificationsApi.getInboxMessages()
  const data = response.data?.items ?? response.data ?? []
  notifications.value = data.map(mapInboxMessageToFrontend)
}

async function openAccountNotifications() {
  if (!isAuthenticated.value) {
    openAuthModal()
    return
  }

  await router.push({ path: '/account', query: { view: 'bell' } })
}

async function handleNotificationClick(item) {
  try {
    if (!item.isRead) {
      await notificationsApi.markAsRead(item.id)
      notifications.value = notifications.value.map((notification) =>
        notification.id === item.id ? { ...notification, isRead: true } : notification,
      )
    }

    await openAccountNotifications()
  } catch (error) {
    console.warn('[Header] notification click failed:', getApiErrorMessage(error))
  }
}

async function markAllNotificationsRead() {
  if (!unreadNotificationCount.value) return
  try {
    await notificationsApi.markAllAsRead()
    notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }))
  } catch (error) {
    console.warn('[Header] mark all notifications failed:', getApiErrorMessage(error))
  }
}

function dropdownIconClass(type) {
  return `nd-icon-wrap nd-icon-wrap--${type}`
}

function handleUserAction() {
  if (isAuthenticated.value) {
    if (isAdmin.value) {
      router.push({ name: 'admin-dashboard' })
      return
    }
    router.push('/account')
    return
  }
  openAuthModal()
}

const notificationsLoaded = ref(false)

async function loadNotificationsOnce() {
  if (!isAuthenticated.value || notificationsLoaded.value) return
  try {
    await loadNotifications()
    notificationsLoaded.value = true
  } catch (error) {
    console.warn('[Header] load notifications failed:', getApiErrorMessage(error))
  }
}

watch(isAuthenticated, (newVal) => {
  if (!newVal) {
    notifications.value = []
    notificationsLoaded.value = false
  } else {
    notificationsLoaded.value = false
  }
})

watch(locale, () => {
  if (!isAuthenticated.value || !notificationsLoaded.value) return
  loadNotifications().catch((error) => {
    console.warn('[Header] reload notifications failed:', getApiErrorMessage(error))
  })
})

const mobileMenuOpen = ref(false)

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

watch(() => route.query.otpCode, (newVal) => {
  if (newVal) {
    openAuthModal('verify')
  }
}, { immediate: true })
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="brand">
      <span class="brand-icon" aria-hidden="true">
        <img src="/brand/furnisight-logo-mark.png" alt="" />
      </span>
      <span class="brand-text">FurniSight</span>
    </RouterLink>

    <nav class="nav" :aria-label="t('nav.main')">
      <RouterLink to="/" :class="{ 'nav-pill': activeNav === 'home' }">{{ t('nav.home') }}</RouterLink>
      <RouterLink to="/products" :class="{ 'nav-pill': activeNav === 'products' }">{{ t('nav.products') }}</RouterLink>
      <RouterLink to="/room3d" :class="{ 'nav-pill': activeNav === 'room3d' }">{{ t('nav.room3d') }}</RouterLink>
      <RouterLink to="/khuyen-mai" :class="{ 'nav-pill': activeNav === 'promotions' }">{{ t('nav.promotions') }}</RouterLink>
      <RouterLink to="/contact" :class="{ 'nav-pill': activeNav === 'contact' }">{{ t('nav.contact') }}</RouterLink>
    </nav>

    <div class="actions">
      <LanguageToggle compact />
      <ThemeToggle variant="icon" />
      <RouterLink to="/room3d" class="visualize-btn">
        <AppIcon name="map" :size="14" />
        {{ t('header.visualize') }}
      </RouterLink>
      <div class="notif-wrap" @mouseenter="loadNotificationsOnce" @click="loadNotificationsOnce">
        <button
          class="icon-btn"
          type="button"
          :aria-label="t('header.notifications')"
          @click="openAccountNotifications"
        >
          <AppIcon name="bell" :size="14" />
          <span v-if="unreadNotificationCount" class="notif-badge"></span>
        </button>

        <div class="notif-dropdown">
          <div class="nd-header">
            <div class="nd-title">
              {{ t('header.notifications') }}
              <span v-if="unreadNotificationCount" class="nd-unread-count">{{ unreadNotificationCount }}</span>
            </div>
            <button type="button" class="nd-mark-all" @click="markAllNotificationsRead">
              {{ t('header.markAllRead') }}
            </button>
          </div>

          <div class="nd-list">
            <button
              v-for="item in previewNotifications"
              :key="item.id"
              type="button"
              class="nd-item"
              :class="{ unread: !item.isRead }"
              @click="handleNotificationClick(item)"
            >
              <div :class="dropdownIconClass(item.type)">
                <AppIcon :name="item.icon" :size="18" />
              </div>

              <div class="nd-content">
                <div class="nd-item-title">{{ item.title }}</div>
                <div class="nd-item-body">{{ item.body }}</div>
                <div class="nd-item-time">
                  <span v-if="!item.isRead" class="nd-unread-dot"></span>
                  {{ item.time }}
                </div>
              </div>
            </button>

            <div v-if="!previewNotifications.length" class="nd-empty">{{ t('header.emptyNotifications') }}</div>
          </div>

          <div class="nd-footer">
            <button type="button" class="nd-see-all" @click="openAccountNotifications">
              {{ t('common.viewAll') }}
            </button>
          </div>
        </div>
      </div>
      <AppHeaderCartDropdown
        :is-authenticated="isAuthenticated"
        @require-auth="openAuthModal()"
      />
      <button
        class="icon-btn user"
        type="button"
        :aria-label="isAuthenticated ? t('header.account') : t('header.login')"
        @click="handleUserAction"
      >
        <AppIcon name="user" :size="14" />
      </button>

      <button
        class="icon-btn hamburger-btn"
        type="button"
        :aria-label="mobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <AppIcon :name="mobileMenuOpen ? 'close' : 'menu'" :size="14" />
      </button>
    </div>

    <div v-if="mobileMenuOpen" class="mobile-nav">
      <RouterLink to="/" :class="{ 'mobile-nav-pill': activeNav === 'home' }">{{ t('nav.home') }}</RouterLink>
      <RouterLink to="/products" :class="{ 'mobile-nav-pill': activeNav === 'products' }">{{ t('nav.products') }}</RouterLink>
      <RouterLink to="/room3d" :class="{ 'mobile-nav-pill': activeNav === 'room3d' }">{{ t('nav.room3d') }}</RouterLink>
      <RouterLink to="/khuyen-mai" :class="{ 'mobile-nav-pill': activeNav === 'promotions' }">{{ t('nav.promotions') }}</RouterLink>
      <RouterLink to="/contact" :class="{ 'mobile-nav-pill': activeNav === 'contact' }">{{ t('nav.contact') }}</RouterLink>
    </div>
  </header>
</template>

<style scoped>
.header {
  --header-ink: #12202e;
  --header-navy: #0f2f45;
  --header-gold: #c9922a;
  --header-gold-bright: #e5b84a;
  --header-cream: #fffaf1;
  --header-muted: rgba(255, 250, 241, 0.76);
  position: fixed;
  top: 0;
  left: 0;
  right: var(--app-main-scrollbar-width, 0px);
  z-index: 120;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  min-height: 58px;
  padding: 0.55rem clamp(0.85rem, 2vw, 1.35rem);
  background:
    radial-gradient(circle at 12% 0%, rgba(229, 184, 74, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(18, 32, 46, 0.98) 0%, rgba(13, 42, 61, 0.98) 100%);
  border-bottom: 1px solid rgba(229, 184, 74, 0.18);
  box-shadow: 0 12px 32px rgba(18, 32, 46, 0.16);
  box-sizing: border-box;
  backdrop-filter: blur(14px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  min-width: 0;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fffdf9;
  color: var(--header-ink);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  overflow: hidden;
  padding: 2px;
}

.brand-icon img {
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
}

.brand-text {
  color: var(--header-cream);
  letter-spacing: 0.06em;
  font-weight: 760;
}

.nav {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  justify-self: center;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.2rem;
  border: 1px solid rgba(255, 250, 241, 0.08);
  border-radius: 8px;
  background: rgba(255, 250, 241, 0.045);
  flex-wrap: nowrap;
}

.nav a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  color: var(--header-muted);
  text-decoration: none;
  font-weight: 650;
  font-size: 0.9rem;
  padding: 0 0.72rem;
  border-radius: 7px;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.nav a:hover,
.nav a:focus-visible {
  background: rgba(255, 250, 241, 0.12);
  color: #ffffff;
  outline: none;
}

.nav .nav-pill {
  background: var(--header-cream);
  color: var(--header-ink);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}

.actions {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  gap: 0.42rem;
}

.notif-wrap {
  position: relative;
}

.visualize-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 36px;
  background: linear-gradient(135deg, var(--header-gold-bright), var(--header-gold));
  color: var(--header-ink);
  text-decoration: none;
  padding: 0 0.82rem;
  border: 1px solid rgba(255, 250, 241, 0.14);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 760;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.14);
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.visualize-btn:hover,
.visualize-btn:focus-visible {
  background: linear-gradient(135deg, #f1d47a, #d6a13a);
  color: var(--header-ink);
  transform: translateY(-1px);
  outline: none;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
}

.visualize-btn:active {
  transform: translateY(0);
}

.icon-btn {
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
  text-decoration: none;
  font-size: 0.9rem;
  position: relative;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.icon-btn:hover,
.icon-btn:focus-visible,
.user:hover,
.user:focus-visible {
  border-color: var(--header-cream);
  background: var(--header-cream);
  color: var(--header-ink);
  outline: none;
}

.icon-btn:active {
  transform: translateY(1px);
}

.notif-badge {
  position: absolute;
  top: 0.28rem;
  right: 0.28rem;
  width: 0.5rem;
  height: 0.5rem;
  border: 2px solid var(--header-ink);
  border-radius: 999px;
  background: #df4d42;
  animation: badgePulse 2s ease-in-out infinite;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: -10px;
  width: 380px;
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

.notif-wrap:hover .notif-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.notif-dropdown::before {
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

.nd-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 16px 12px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
}

.nd-title {
  font-size: 14px;
  font-weight: 760;
  color: var(--app-heading);
}

.nd-unread-count {
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 8px;
  background: var(--app-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.nd-mark-all {
  border: none;
  background: none;
  color: var(--app-gold);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: color 0.18s ease, text-decoration-color 0.18s ease;
}

.nd-mark-all:hover,
.nd-mark-all:focus-visible {
  color: var(--brand-gold-700);
  outline: none;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.nd-list {
  max-height: 340px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nd-list::-webkit-scrollbar {
  display: none;
}

.nd-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px 16px;
  border: none;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface);
  cursor: pointer;
  transition: background 0.18s ease;
  position: relative;
  text-align: left;
}

.nd-item:last-child {
  border-bottom: none;
}

.nd-item:hover,
.nd-item:focus-visible {
  background: var(--app-control-hover);
  outline: none;
}

.nd-item.unread {
  background: var(--app-surface-soft);
}

.nd-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, var(--brand-gold-400), var(--app-gold));
}

.nd-icon-wrap {
  width: 38px;
  height: 38px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
}

.nd-icon-wrap--order {
  background: color-mix(in srgb, var(--app-navy-soft) 14%, var(--app-surface));
  color: var(--app-gold);
}

.nd-icon-wrap--promo {
  background: var(--app-gold-soft);
  color: var(--app-gold);
}

.nd-icon-wrap--system {
  background: color-mix(in srgb, var(--app-success) 14%, var(--app-surface));
  color: var(--app-success);
}

.nd-icon-wrap--review {
  background: var(--app-surface-soft);
  color: var(--app-gold);
}

.nd-content {
  min-width: 0;
}

.nd-item-title {
  margin-bottom: 3px;
  color: var(--app-heading);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

.nd-item.unread .nd-item-title {
  color: var(--app-heading);
}

.nd-item-body {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nd-item-time {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 5px;
  color: var(--app-text-muted);
  font-size: 11px;
}

.nd-unread-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--app-gold);
}

.nd-empty {
  padding: 18px 16px;
  color: var(--app-text-muted);
  font-size: 12px;
  text-align: center;
}

.nd-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-top: 1px solid #efe4d3;
}

.nd-see-all {
  border: none;
  background: none;
  color: #9a6a21;
  font-size: 13px;
  font-weight: 720;
  cursor: pointer;
}

.nd-see-all:hover,
.nd-see-all:focus-visible {
  color: #6d4912;
  outline: none;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

.hamburger-btn {
  display: none;
}

.mobile-nav {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.5rem;
  padding: 0.65rem;
  border: 1px solid rgba(255, 250, 241, 0.1);
  border-radius: 8px;
  background: rgba(9, 31, 46, 0.98);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: slideDown 0.25s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-nav a {
  display: flex;
  align-items: center;
  min-height: 40px;
  color: var(--header-muted);
  text-decoration: none;
  font-weight: 650;
  font-size: 0.98rem;
  padding: 0 0.85rem;
  border-radius: 7px;
  transition: background 0.18s ease, color 0.18s ease;
}

.mobile-nav a:hover,
.mobile-nav a:focus-visible {
  background: rgba(255, 250, 241, 0.12);
  color: #ffffff;
  outline: none;
}

.mobile-nav .mobile-nav-pill {
  background: var(--header-cream);
  color: var(--header-ink);
}

@media (max-width: 980px) {
  .header {
    grid-template-columns: auto 1fr;
    justify-items: stretch;
    gap: 0.75rem;
  }

  .nav {
    display: none;
  }

  .visualize-btn {
    display: none;
  }

  .hamburger-btn {
    display: inline-flex;
  }

  .actions {
    justify-self: end;
  }

  .notif-dropdown {
    width: min(92vw, 380px);
    right: 0;
  }
}

@media (max-width: 520px) {
  .header {
    padding-inline: 0.75rem;
  }

  .brand-text {
    font-size: 0.95rem;
    letter-spacing: 0.035em;
  }

  .actions {
    gap: 0.32rem;
  }

  .icon-btn {
    width: 2rem;
    height: 2rem;
  }
}
</style>
