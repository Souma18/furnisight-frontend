<script setup>
import { useOAuthCallback } from '../composables/useOAuthCallback'

useOAuthCallback()
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
