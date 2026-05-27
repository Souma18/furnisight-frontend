<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  titleHtml: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header">
    <div class="ph-left">
      <div v-if="eyebrow" class="ph-eyebrow">{{ eyebrow }}</div>
      <div v-if="titleHtml" class="ph-title" v-html="titleHtml" />
      <div v-if="subtitle" class="ph-sub">{{ subtitle }}</div>
    </div>
    <div v-if="$slots.actions" class="ph-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
