<script setup>
import AppButton from '@shared/ui/AppButton.vue'
defineProps({
  modelValue: {
    type: String,
    default: 'login',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="auth-tabs">
    <AppButton
      type="button"
      class="auth-tab"
      :class="{ 'auth-tab--active': modelValue === 'login' }"
      @click="$emit('update:modelValue', 'login')"
    >
      {{ $t('auth.login.title') }}
    </AppButton>
    <AppButton
      type="button"
      class="auth-tab"
      :class="{ 'auth-tab--active': modelValue === 'register' }"
      @click="$emit('update:modelValue', 'register')"
    >
      {{ $t('auth.register.title') }}
    </AppButton>
  </div>
</template>

<style scoped>
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--auth-border);
}

.auth-tab {
  box-shadow: none;
  padding: 0.62rem;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  color: var(--auth-text-secondary);
  font-size: 0.92rem;
}

.auth-tab--active {
  background: transparent;
  color: #7a5413;
  border-bottom-color: #9b6a16;
  font-weight: 600;
}
</style>
