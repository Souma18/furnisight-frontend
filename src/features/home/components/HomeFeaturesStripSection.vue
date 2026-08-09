<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="features-strip">
    <div v-for="item in items" :key="item.title" class="feat-item">
      <span class="feat-icon">
        <AppIcon :name="item.icon" :size="22" />
      </span>
      <div class="feat-text"><strong>{{ item.title }}</strong>{{ item.subtitle }}</div>
    </div>
  </div>
</template>
