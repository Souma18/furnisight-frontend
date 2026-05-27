<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="chart-card">
    <div class="chart-head">
      <div>
        <div class="chart-title">{{ title }}</div>
        <div v-if="subtitle" class="chart-sub">{{ subtitle }}</div>
      </div>
      <slot name="actions" />
    </div>
    <div class="chart-wrap">
      <slot />
    </div>
  </div>
</template>
