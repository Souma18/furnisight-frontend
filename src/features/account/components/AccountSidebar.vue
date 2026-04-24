<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
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
</script>

<template>
  <aside class="sidebar">
    <div class="user-box">
      <div class="avatar">{{ profile?.initials ?? 'NA' }}</div>
      <p class="name">{{ profile?.lastName }} {{ profile?.firstName }}</p>
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
  display: grid;
  place-items: center;
  color: var(--color-white);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  font-weight: 600;
}
.name {
  margin: 0.7rem 0 0.2rem;
  font-weight: 600;
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
.logout-btn {
  margin: 0.2rem 0.7rem 0.8rem;
  min-height: 2.35rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--account-stat-danger) 35%, var(--auth-border));
  background: var(--account-surface);
  color: color-mix(in srgb, var(--account-stat-danger) 35%, var(--auth-border));
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
