<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  show: { type: Boolean, default: false },
  icon: { type: String, default: 'check' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="co-toast" :class="{ show }">
    <AppIcon :name="icon" :size="18" />
    <div>
      <p style="font-size: 0.82rem; font-weight: 600">{{ title }}</p>
      <p v-if="subtitle" style="font-size: 0.72rem; opacity: 0.75">{{ subtitle }}</p>
    </div>
  </div>
</template>
