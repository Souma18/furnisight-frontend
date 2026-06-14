<script setup>
import { computed, ref, watch } from 'vue'
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

const emit = defineEmits(['change-view', 'logout'])

const navGroups = [
  {
    title: 'Tài khoản',
    items: [
      { key: 'profile', label: 'Thông tin cá nhân', icon: 'user' },
      { key: 'address', label: 'Địa chỉ giao hàng', icon: 'mapPin' },
      { key: 'security', label: 'Bảo mật', icon: 'shield' },
    ],
  },
  {
    title: 'Mua sắm',
    items: [
      { key: 'cart', label: 'Giỏ hàng', icon: 'cart' },
      { key: 'orders', label: 'Đơn hàng', icon: 'box' },
      { key: 'wishlist', label: 'Yêu thích', icon: 'heart' },
    ],
  },
  {
    title: 'Khác',
    items: [
      { key: 'settings', label: 'Cài đặt', icon: 'settings' },
      { key: 'ar', label: 'Dự án 3D', icon: 'cube' },
    ],
  },
]

const notificationItems = [
  { key: 'bell', label: 'Tất cả', icon: 'list' },
  { key: 'bell-order', label: 'Đơn hàng', icon: 'box' },
  { key: 'bell-promo', label: 'Khuyến mãi', icon: 'gift' },
  { key: 'bell-system', label: 'Hệ thống', icon: 'settings' },
  { key: 'bell-review', label: 'Đánh giá', icon: 'star' },
]

const notificationMenuOpen = ref(false)
const isNotificationView = computed(() => String(props.activeView).startsWith('bell'))
const profileName = computed(() => {
  const nameParts = [props.profile?.lastName, props.profile?.firstName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)

  return nameParts.join(' ') || props.profile?.displayName || props.profile?.email || 'Khách hàng'
})

watch(
  () => props.activeView,
  (nextView) => {
    if (String(nextView).startsWith('bell')) notificationMenuOpen.value = true
  },
  { immediate: true },
)

function toggleNotificationMenu() {
  if (isNotificationView.value) {
    notificationMenuOpen.value = !notificationMenuOpen.value
    return
  }

  notificationMenuOpen.value = true
  emit('change-view', 'bell')
}
</script>

<template>
  <aside class="sidebar">
    <div class="user-box">
      <div class="avatar">
        <img v-if="profile?.avatarUrl" :src="profile.avatarUrl" alt="Avatar" />
        <span v-else>{{ profile?.initials ?? 'NA' }}</span>
      </div>
      <p class="name" :title="profileName">{{ profileName }}</p>
      <p class="email">{{ profile?.email }}</p>
    </div>
    <div class="stats">
      <div class="stat stat-orders">
        <strong>{{ stats.totalOrders }}</strong>
        <span>Đơn hàng</span>
      </div>
      <div class="stat stat-delivering">
        <strong>{{ stats.deliveringOrders }}</strong>
        <span>Đang giao</span>
      </div>
      <div class="stat stat-wishlist">
        <strong>{{ stats.wishlistCount }}</strong>
        <span>Yêu thích</span>
      </div>
    </div>

    <nav class="nav">
      <section v-for="group in navGroups" :key="group.title" class="nav-group">
        <p class="nav-group-title">{{ group.title }}</p>
        <button
          v-for="item in group.items"
          :key="item.key"
          type="button"
          class="nav-btn"
          :class="{ active: activeView === item.key }"
          @click="$emit('change-view', item.key)"
        >
          <AppIcon :name="item.icon" :size="16" />
          {{ item.label }}
        </button>

        <div v-if="group.title === 'Tài khoản'" class="nav-submenu-wrap" :class="{ active: isNotificationView }">
          <button
            type="button"
            class="nav-btn nav-parent"
            :class="{ active: isNotificationView }"
            @click="toggleNotificationMenu"
          >
            <span class="nav-parent-main">
              <AppIcon name="bell" :size="16" />
              Thông báo
            </span>
          </button>

          <div class="nav-submenu" :class="{ open: notificationMenuOpen }">
            <button
              v-for="item in notificationItems"
              :key="item.key"
              type="button"
              class="nav-submenu-item"
              :class="{ active: activeView === item.key }"
              @click="$emit('change-view', item.key)"
            >
              <AppIcon :name="item.icon" :size="15" />
              {{ item.label }}
            </button>
          </div>
        </div>
      </section>
    </nav>

    <button type="button" class="logout-btn" @click="$emit('logout')">
      <AppIcon name="logout" :size="16" />
      Đăng xuất
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100%;
  overflow-y: auto;
  background: var(--account-surface);
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.user-box {
  padding: 1rem;
  border-bottom: 1px solid var(--auth-border);
}
.avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: var(--color-white);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  font-weight: 600;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name {
  margin: 0.7rem 0 0.2rem;
  max-width: 100%;
  overflow: hidden;
  color: var(--account-text-strong);
  font-size: 0.94rem;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.email {
  margin: 0;
  color: var(--auth-text-secondary);
  font-size: 0.82rem;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid var(--auth-border);
}
.stats div {
  text-align: center;
  padding: 0.7rem 0.4rem;
  display: grid;
  grid-template-rows: 24px 34px;
  align-items: center;
  justify-items: center;
}
.stats strong {
  display: block;
  color: var(--account-stat-default);
  line-height: 1.1;
  min-height: 24px;
}

.stat-delivering strong {
  color: var(--account-stat-delivering);
}

.stat-wishlist strong {
  color: var(--account-stat-success);
}

.stats span {
  font-size: 0.72rem;
  color: var(--auth-text-secondary);
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.nav {
  display: grid;
  gap: 0.7rem;
  padding: 0.7rem;
  flex: 1;
}
.nav-group {
  display: grid;
  gap: 0.28rem;
}
.nav-group-title {
  margin: 0;
  padding: 0 0.62rem 0.2rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--account-text-muted);
}
.nav-btn {
  border: none;
  border-radius: 10px;
  padding: 0.56rem 0.62rem;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: var(--account-text-strong);
}
.nav-btn.active {
  background: color-mix(in srgb, var(--auth-brand-start) 12%, transparent);
  color: var(--auth-brand-start);
}
.nav-parent {
  width: 100%;
}
.nav-parent-main {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}
.nav-submenu-wrap {
  display: grid;
  gap: 0.28rem;
}
.nav-submenu {
  display: grid;
  gap: 0.28rem;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  padding-left: 0.55rem;
  transition: max-height 0.3s ease, opacity 0.25s ease;
}
.nav-submenu.open {
  max-height: 16rem;
  opacity: 1;
}
.nav-submenu-item {
  border: none;
  border-radius: 10px;
  padding: 0.52rem 0.62rem;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: var(--account-text-strong);
  font-size: 0.84rem;
  font-weight: 500;
  text-align: left;
}
.nav-submenu-item:hover {
  background: color-mix(in srgb, var(--auth-brand-start) 6%, transparent);
  color: var(--auth-brand-start);
}
.nav-submenu-item.active {
  background: color-mix(in srgb, var(--auth-brand-start) 12%, transparent);
  color: var(--auth-brand-start);
  font-weight: 500;
}
.logout-btn {
  margin: 0.2rem 0.7rem 0.8rem;
  min-height: 2.35rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--account-stat-danger) 60%, var(--auth-border));
  background: var(--account-surface);
  color: color-mix(in srgb, var(--account-stat-danger) 60%, var(--auth-border));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
}
.logout-btn:hover {
  background: color-mix(in srgb, var(--account-stat-danger) 10%, var(--account-surface));
  color: var(--account-stat-danger);
}
</style>
