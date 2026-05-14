<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AccountSidebar from '../components/AccountSidebar.vue'
import AccountToast from '../components/AccountToast.vue'
import ProfileView from '../components/views/ProfileView.vue'
import AddressView from '../components/views/AddressView.vue'
import OrdersView from '../components/views/OrdersView.vue'
import CartView from '../components/views/CartView.vue'
import WishlistView from '../components/views/WishlistView.vue'
import NotificationsView from '../components/views/NotificationsView.vue'
import SecurityView from '../components/views/SecurityView.vue'
import SettingsView from '../components/views/SettingsView.vue'
import Projects3DView from '../components/views/Projects3DView.vue'
import { useAccountPage } from '../composables/useAccountPage'
import { useAuthStore } from '@features/auth/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const {
  activeView,
  profile,
  addresses,
  orders,
  wishlist,
  settings,
  projects,
  stats,
  toast,
  setView,
  showToast,
  saveProfile,
  saveAddress,
  uploadAvatar,
  removeAvatar,
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

function handleLogout() {
  authStore.logout()
  showToast('Đăng xuất thành công.')
  setTimeout(() => {
    router.push('/login')
  }, 500)
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

    <main class="content">
      <ProfileView
        v-if="activeView === 'profile'"
        :profile="profile"
        @save="saveProfile"
        @upload-avatar="uploadAvatar"
        @remove-avatar="removeAvatar"
        @notify="showToast"
      />
      <AddressView
        v-else-if="activeView === 'address'"
        :addresses="addresses"
        @save-address="saveAddress"
        @notify="showToast"
      />
      <NotificationsView
        v-else-if="String(activeView).startsWith('bell')"
        :notification-category="notificationCategory"
        @notify="showToast"
      />
      <OrdersView v-else-if="activeView === 'orders'" :orders="orders" />
      <CartView v-else-if="activeView === 'cart'" />
      <WishlistView v-else-if="activeView === 'wishlist'" :items="wishlist" />
      <SecurityView
        v-else-if="activeView === 'security'"
        :profile="profile"
        @notify="showToast"
        @save-contact="saveProfile"
      />
      <SettingsView v-else-if="activeView === 'settings'" :settings="settings" />
      <Projects3DView v-else :projects="projects" />
    </main>

    <AccountToast :show="toast.open" :message="toast.message" :type="toast.type" />
  </div>
</template>

<style scoped>
.account-page {
  display: flex;
  height: calc(100svh - 62px - 2.5rem);
  min-height: 0;
  background: var(--account-bg);
  border: 1px solid var(--account-border);
  border-radius: 16px;
  overflow: hidden;
}
.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.content::-webkit-scrollbar {
  width: 0;
  height: 0;
}
@media (max-width: 980px) {
  .account-page {
    flex-direction: column;
    height: auto;
  }
}
</style>
