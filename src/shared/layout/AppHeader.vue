<script setup>
import './app-header.css'
import AppImage from '@shared/ui/AppImage.vue'
import { RouterLink } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { mapInboxMessageToFrontend } from '@features/account/composables/useNotificationsCenter'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import { getApiErrorMessage } from '@shared/lib/api'
import { notificationsApi } from '@shared/lib/api/services'
import AppIcon from '@shared/ui/AppIcon.vue'
import ThemeToggle from '@shared/ui/ThemeToggle.vue'
import LanguageToggle from '@shared/ui/LanguageToggle.vue'
import AppHeaderCartDropdown from './AppHeaderCartDropdown.vue'
import AppHeaderNavigation from './AppHeaderNavigation.vue'
import AppHeaderMobileMenu from './AppHeaderMobileMenu.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const { isAuthenticated, isAdmin } = storeToRefs(authStore)
const notifications = ref([])


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
        <AppImage src="/brand/furnisight-logo-mark.png" alt=""  />
      </span>
      <span class="brand-text">FurniSight</span>
    </RouterLink>

    <AppHeaderNavigation />

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

    <AppHeaderMobileMenu :is-open="mobileMenuOpen" />
  </header>
</template>
