<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="success">
    <div class="icon">
      <AppIcon name="check" :size="18" :stroke-width="2.2" />
    </div>
    <p class="title">{{ title }}</p>
    <p class="message">{{ message }}</p>
    <p class="loading">{{ loading ? 'Đang tải...' : '' }}</p>
  </div>
</template>

<style scoped>
.success {
  text-align: center;
  padding: 0.8rem 0.2rem;
}
.icon {
  margin: 0 auto 0.7rem;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--auth-success) 30%, transparent);
  color: var(--auth-success);
  background: color-mix(in srgb, var(--auth-success) 12%, transparent);
  display: grid;
  place-items: center;
  font-weight: 700;
}
.title {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  color: var(--auth-text-primary);
  font-weight: 600;
}
.message {
  margin: 0 0 0.9rem;
  color: var(--auth-text-secondary);
  font-size: 0.85rem;
}
.loading {
  margin: 0;
  color: var(--auth-text-secondary);
  font-size: 0.8rem;
}
</style>
