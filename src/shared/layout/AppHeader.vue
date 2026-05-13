<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AuthModal from '@features/auth/components/AuthModal.vue'
import { useAuthStore } from '@features/auth/store/authStore'
import AppIcon from '@shared/ui/AppIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const isAuthModalOpen = ref(false)

function handleUserAction() {
  if (isAuthenticated.value) {
    router.push('/account')
    return
  }
  isAuthModalOpen.value = true
}
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="brand">
      <span class="brand-icon">🪙</span>
      <span class="brand-text">LUXNEST</span>
    </RouterLink>

    <nav class="nav" aria-label="Chinh">
      <RouterLink to="/" class="nav-pill">Trang Chủ</RouterLink>
      <RouterLink to="/products">Sản phẩm</RouterLink>
      <RouterLink to="/room3d">Trực quan 3D</RouterLink>
      <RouterLink to="/">Dự án</RouterLink>
      <RouterLink to="/">Liên hệ</RouterLink>
    </nav>

    <div class="actions">
      <RouterLink to="/room3d" class="visualize-btn">
        <AppIcon name="map" :size="14" />
        Truc quan hoa
      </RouterLink>
      <button class="icon-btn" type="button" aria-label="Thong bao">
        <AppIcon name="bell" :size="14" />
      </button>
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
  right: 0;
  z-index: 120;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1rem;
  background: linear-gradient(180deg, #133f5c 0%, #0c3148 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
}

.icon-btn:hover,
.user:hover {
  background: rgba(255, 255, 255, 0.16);
}

@media (max-width: 980px) {
  .header {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
