<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  const accessToken = route.query.access_token
  const refreshToken = route.query.refresh_token

  if (accessToken && refreshToken) {
    authStore.setSession({ accessToken, refreshToken })
    const redirect = route.query.redirect || '/account'
    router.replace(redirect)
  } else {
    router.replace({ name: 'login' })
  }
})
</script>

<template>
  <div class="callback-wrap">
    <div class="spinner" />
    <p>Đang xử lý đăng nhập...</p>
  </div>
</template>

<style scoped>
.callback-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--auth-text-secondary, #888);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top-color: var(--auth-brand-start, #6366f1);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
