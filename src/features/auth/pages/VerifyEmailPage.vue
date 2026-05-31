<script setup>
import AuthContainer from '../components/AuthContainer.vue'
import { AUTH_VIEWS } from '../composables/useAuthViewState'
</script>

<template>
  <div class="verify-page">
    <AuthContainer :initialView="AUTH_VIEWS.VERIFY" />
  </div>
</template>

<style scoped>
.verify-page {
  min-height: calc(100svh - 56px);
  background: var(--auth-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
