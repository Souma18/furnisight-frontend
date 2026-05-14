<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="ct-toast" :class="{ show }">
    <div class="ct-toast-icon">
      <AppIcon name="check" :size="22" />
    </div>
    <div>
      <div class="ct-toast-title">{{ title }}</div>
      <div class="ct-toast-sub">{{ subtitle }}</div>
    </div>
  </div>
</template>
