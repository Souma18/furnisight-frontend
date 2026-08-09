<script setup>
import './app-header.css'
import AppImage from '@shared/ui/AppImage.vue'
import { RouterLink } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { openAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import { useNotificationStore } from '@features/account/store/notificationStore'
import { getApiErrorMessage } from '@shared/lib/api'
import { notificationsApi } from '@shared/lib/api/services'
import AppIcon from '@shared/ui/AppIcon.vue'
import ThemeToggle from '@shared/ui/ThemeToggle.vue'
import LanguageToggle from '@shared/ui/LanguageToggle.vue'
import AppHeaderCartDropdown from './AppHeaderCartDropdown.vue'
import AppHeaderNavigation from './AppHeaderNavigation.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const { isAuthenticated, isAdmin } = storeToRefs(authStore)

const notificationStore = useNotificationStore()
const { notifications, unreadCount: unreadNotificationCount } = storeToRefs(notificationStore)

const previewNotifications = computed(() => notifications.value.slice(0, 5))

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
      await notificationStore.markAsRead(item.id)
    }

    await openAccountNotifications()
  } catch (error) {
    console.warn('[Header] notification click failed:', getApiErrorMessage(error))
  }
}

async function markAllNotificationsRead() {
  if (!unreadNotificationCount.value) return
  try {
    await notificationStore.markAllAsRead()
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

async function loadNotificationsOnce() {
  if (!isAuthenticated.value) return
  try {
    await notificationStore.loadNotifications()
  } catch (error) {
    console.warn('[Header] load notifications failed:', getApiErrorMessage(error))
  }
}

watch(isAuthenticated, (newVal) => {
  if (!newVal) {
    notificationStore.clearNotifications()
  }
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

    <div class="header-actions">
      <LanguageToggle compact />
      <ThemeToggle variant="icon" />
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

    </div>

    <RouterLink to="/room3d" class="visualize-btn">
      <AppIcon name="boxes" :size="14" />
      {{ t('header.visualize') }}
    </RouterLink>
  </header>
</template>
