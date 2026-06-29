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
      Đăng nhập
    </AppButton>
    <AppButton
      type="button"
      class="auth-tab"
      :class="{ 'auth-tab--active': modelValue === 'register' }"
      @click="$emit('update:modelValue', 'register')"
    >
      Đăng ký
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
  padding: 0.62rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--auth-text-secondary);
  font-size: 0.92rem;
}

.auth-tab--active {
  color: var(--auth-brand-start);
  border-bottom-color: var(--auth-brand-end);
  font-weight: 600;
}
</style>
