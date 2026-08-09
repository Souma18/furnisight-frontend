<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useEmailVerification } from '../composables/useEmailVerification'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAuthViewStateContext, AUTH_VIEWS } from '../composables/useAuthViewState'

const { setView } = useAuthViewStateContext()
const { status, message } = useEmailVerification(() => {
  setView(AUTH_VIEWS.LOGIN)
})
</script>

<template>
  <div class="verify-state">
    <!-- Success Icon -->
    <div v-if="status === 'success'" class="icon success animate-bounce">
      <AppIcon name="check" :size="24" :stroke-width="2.5" />
    </div>

    <!-- Error Icon -->
    <div v-if="status === 'error'" class="icon error">
      <AppIcon name="close" :size="24" :stroke-width="2.5" />
    </div>

    <!-- Verifying Spinner -->
    <div v-if="status === 'verifying'" class="icon loading animate-spin">
      <AppIcon name="loader" :size="24" :stroke-width="2.5" />
    </div>

    <h2 class="title">
      {{ status === 'success' ? $t('auth.verify.success') : status === 'error' ? $t('auth.verify.failed') : $t('auth.verify.processing') }}
    </h2>
    <p class="message">
      {{ message }}
    </p>

    <div class="actions" v-if="status !== 'verifying'">
      <AppButton 
        v-if="status === 'success' || status === 'error'"
        class="submit-btn" 
        @click="setView(AUTH_VIEWS.LOGIN)"
      >
        {{ $t('auth.verify.backToLogin') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.verify-state {
  text-align: center;
  padding: 1rem 0;
}
.icon {
  margin: 0 auto 1.2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
}
.icon.success {
  background: color-mix(in srgb, var(--auth-success) 15%, transparent);
  color: var(--auth-success);
}
.icon.error {
  background: color-mix(in srgb, var(--account-toast-error) 15%, transparent);
  color: var(--account-toast-error);
}
.icon.loading {
  background: color-mix(in srgb, var(--auth-brand-start) 15%, transparent);
  color: var(--auth-brand-start);
}
.title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--auth-text-primary);
  font-weight: 600;
}
.message {
  margin: 0 0 1.5rem;
  color: var(--auth-text-secondary);
  font-size: 0.85rem;
}
.submit-btn {
  width: 100%;
  min-height: 2.7rem;
  border: none;
  border-radius: var(--auth-radius-md);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: var(--color-white);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.submit-btn:hover {
  opacity: 0.9;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-bounce {
  animation: bounce 1s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
</style>
