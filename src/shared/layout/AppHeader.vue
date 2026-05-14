<script setup>
import { RouterLink } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AuthModal from '@features/auth/components/AuthModal.vue'
import {
  fetchNotificationsMock,
  markAllNotificationsReadMock,
  markNotificationReadMock,
} from '@features/account/api/accountNotificationsMockApi'
import { useAuthStore } from '@features/auth/store/authStore'
import AppIcon from '@shared/ui/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const isAuthModalOpen = ref(false)
const notifications = ref([])
const activeNotificationTab = ref('all')

const notificationTabs = [
  { value: 'all', label: 'Tất cả', icon: 'list' },
  { value: 'order', label: 'Đơn hàng', icon: 'box' },
  { value: 'promo', label: 'Khuyến mãi', icon: 'gift' },
  { value: 'system', label: 'Hệ thống', icon: 'settings' },
  { value: 'review', label: 'Đánh giá', icon: 'star' },
]

const activeNav = computed(() => {
  if (route.path.startsWith('/products')) return 'products'
  if (route.path.startsWith('/contact')) return 'contact'
  if (route.path.startsWith('/room3d')) return 'room3d'
  if (route.path === '/') return 'home'
  return ''
})

const unreadNotificationCount = computed(() => notifications.value.filter((item) => item.unread).length)
const filteredNotifications = computed(() => {
  const items =
    activeNotificationTab.value === 'all'
      ? notifications.value
      : notifications.value.filter((item) => item.type === activeNotificationTab.value)

  return items.slice(0, 5)
})

function unreadCountByType(type) {
  if (type === 'all') return unreadNotificationCount.value
  return notifications.value.filter((item) => item.unread && item.type === type).length
}

async function loadNotifications() {
  const response = await fetchNotificationsMock()
  notifications.value = response.data?.items ?? response.data ?? []
}

function accountViewForNotification(type = 'all') {
  const map = {
    all: 'bell',
    order: 'bell-order',
    promo: 'bell-promo',
    system: 'bell-system',
    review: 'bell-review',
  }

  return map[type] ?? 'bell'
}

async function openAccountNotifications(type = 'all') {
  const targetView = accountViewForNotification(type)

  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }

  await router.push({ path: '/account', query: { view: targetView } })
}

async function handleNotificationClick(item) {
  if (item.unread) {
    await markNotificationReadMock(item.id)
    notifications.value = notifications.value.map((notification) =>
      notification.id === item.id ? { ...notification, unread: false } : notification,
    )
  }

  await openAccountNotifications(item.type)
}

async function markAllNotificationsRead() {
  if (!unreadNotificationCount.value) return
  await markAllNotificationsReadMock()
  notifications.value = notifications.value.map((item) => ({ ...item, unread: false }))
}

function dropdownIconClass(type) {
  return `nd-icon-wrap nd-icon-wrap--${type}`
}

function handleUserAction() {
  if (isAuthenticated.value) {
    router.push('/account')
    return
  }
  isAuthModalOpen.value = true
}

onMounted(() => {
  loadNotifications()
})
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="brand">
      <span class="brand-icon">🪙</span>
      <span class="brand-text">LUXNEST</span>
    </RouterLink>

    <nav class="nav" aria-label="Chinh">
      <RouterLink to="/" :class="{ 'nav-pill': activeNav === 'home' }">Trang Chủ</RouterLink>
      <RouterLink to="/products" :class="{ 'nav-pill': activeNav === 'products' }">Sản phẩm</RouterLink>
      <RouterLink to="/room3d" :class="{ 'nav-pill': activeNav === 'room3d' }">Trực quan 3D</RouterLink>
      <RouterLink to="/">Dự án</RouterLink>
      <RouterLink to="/contact" :class="{ 'nav-pill': activeNav === 'contact' }">Liên hệ</RouterLink>
    </nav>

    <div class="actions">
      <RouterLink to="/room3d" class="visualize-btn">
        <AppIcon name="map" :size="14" />
        Truc quan hoa
      </RouterLink>
      <div class="notif-wrap">
        <button
          class="icon-btn"
          type="button"
          aria-label="Thong bao"
          @click="openAccountNotifications(activeNotificationTab)"
        >
          <AppIcon name="bell" :size="14" />
          <span v-if="unreadNotificationCount" class="notif-badge"></span>
        </button>

        <div class="notif-dropdown">
          <div class="nd-header">
            <div class="nd-title">
              Thông báo
              <span v-if="unreadNotificationCount" class="nd-unread-count">{{ unreadNotificationCount }}</span>
            </div>
            <button type="button" class="nd-mark-all" @click="markAllNotificationsRead">
              Đọc tất cả
            </button>
          </div>

          <div class="nd-tabs">
            <button
              v-for="tab in notificationTabs"
              :key="tab.value"
              type="button"
              class="nd-tab"
              :class="{ active: activeNotificationTab === tab.value, 'has-new': unreadCountByType(tab.value) > 0 }"
              @click="activeNotificationTab = tab.value"
            >
              {{ tab.label }}
              <span v-if="unreadCountByType(tab.value) > 0" class="tab-dot"></span>
            </button>
          </div>

          <div class="nd-list">
            <button
              v-for="item in filteredNotifications"
              :key="item.id"
              type="button"
              class="nd-item"
              :class="{ unread: item.unread }"
              @click="handleNotificationClick(item)"
            >
              <div :class="dropdownIconClass(item.type)">
                <AppIcon :name="item.icon" :size="18" />
              </div>

              <div class="nd-content">
                <div class="nd-item-title">{{ item.title }}</div>
                <div class="nd-item-body">{{ item.desc }}</div>
                <div class="nd-item-time">
                  <span v-if="item.unread" class="nd-unread-dot"></span>
                  {{ item.time }}
                </div>
              </div>
            </button>

            <div v-if="!filteredNotifications.length" class="nd-empty">Không có thông báo nào.</div>
          </div>

          <div class="nd-footer">
            <button type="button" class="nd-see-all" @click="openAccountNotifications(activeNotificationTab)">
              Xem tất cả
            </button>
          </div>
        </div>
      </div>
      <button class="icon-btn" type="button" aria-label="Gio hang">
        <AppIcon name="cart" :size="14" />
      </button>
      <button
        class="icon-btn user"
        type="button"
        :aria-label="isAuthenticated ? 'Tai khoan' : 'Dang nhap'"
        @click="handleUserAction"
      >
        <AppIcon name="user" :size="14" />
      </button>
    </div>
  </header>
  <AuthModal :open="isAuthModalOpen" @close="isAuthModalOpen = false" />
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: var(--app-main-scrollbar-width, 0px);
  z-index: 120;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1rem;
  background: linear-gradient(180deg, #133f5c 0%, #0c3148 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
}

.brand-icon {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 178, 60, 0.2);
}

.brand-text {
  color: #efe6d7;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.nav {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav a {
  color: rgba(233, 244, 255, 0.88);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.92rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.nav .nav-pill {
  background: rgba(255, 178, 60, 0.18);
  color: #f2d79e;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.notif-wrap {
  position: relative;
}

.visualize-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #fff;
  text-decoration: none;
  padding: 0.45rem 0.8rem;
  border-radius: 0.55rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.icon-btn {
  border: none;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: #f5f7f8;
  text-decoration: none;
  font-size: 0.9rem;
  position: relative;
}

.icon-btn:hover,
.user:hover {
  background: rgba(255, 255, 255, 0.16);
}

.notif-badge {
  position: absolute;
  top: 0.28rem;
  right: 0.28rem;
  width: 0.5rem;
  height: 0.5rem;
  border: 2px solid #0c3148;
  border-radius: 999px;
  background: #e53e3e;
  animation: badgePulse 2s ease-in-out infinite;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: -10px;
  width: 380px;
  overflow: hidden;
  border: 1px solid #ece2cf;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(18, 32, 46, 0.22), 0 4px 16px rgba(0, 0, 0, 0.08);
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
  border-top: 1px solid #ece2cf;
  border-left: 1px solid #ece2cf;
  background: #fff;
  z-index: 1;
}

.nd-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #f0e9dd;
  background: #fff;
}

.nd-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.nd-unread-count {
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 10px;
  background: #e53e3e;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.nd-mark-all {
  border: none;
  background: none;
  color: #c58d2f;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.nd-mark-all:hover {
  color: #e5b84a;
}

.nd-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 10px 0;
  border-bottom: 1px solid #f0e9dd;
  background: #faf6f0;
}

.nd-tab {
  position: relative;
  padding: 6px 12px;
  border: none;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: #888;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nd-tab.active {
  background: #fff;
  color: #12202e;
  font-weight: 500;
}

.tab-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e53e3e;
}

.nd-list {
  max-height: 340px;
  overflow-y: auto;
}

.nd-item {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px 16px;
  border: none;
  border-bottom: 1px solid #f0e9dd;
  background: #fff;
  cursor: pointer;
  transition: background 0.18s;
  position: relative;
  text-align: left;
}

.nd-item:last-child {
  border-bottom: none;
}

.nd-item:hover {
  background: #faf6f0;
}

.nd-item.unread {
  background: #fffbf4;
}

.nd-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, #e5b84a, #c9922a);
}

.nd-icon-wrap {
  width: 38px;
  height: 38px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
}

.nd-icon-wrap--order {
  background: #e3f2fd;
  color: #2563eb;
}

.nd-icon-wrap--promo {
  background: #fff3e0;
  color: #c58d2f;
}

.nd-icon-wrap--system {
  background: #e8f5e9;
  color: #15803d;
}

.nd-icon-wrap--review {
  background: #ede9fe;
  color: #6d28d9;
}

.nd-content {
  min-width: 0;
}

.nd-item-title {
  margin-bottom: 3px;
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

.nd-item.unread .nd-item-title {
  color: #12202e;
}

.nd-item-body {
  color: #555;
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nd-item-time {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 5px;
  color: #888;
  font-size: 11px;
}

.nd-unread-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #c9922a;
}

.nd-empty {
  padding: 18px 16px;
  color: #888;
  font-size: 12px;
  text-align: center;
}

.nd-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-top: 1px solid #f0e9dd;
}

.nd-see-all {
  border: none;
  background: none;
  color: #c58d2f;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.nd-see-all:hover {
  color: #e5b84a;
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

@media (max-width: 980px) {
  .header {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .notif-dropdown {
    width: min(92vw, 380px);
    right: 0;
  }
}
</style>
