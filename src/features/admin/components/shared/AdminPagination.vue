<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  info: { type: String, default: '' },
  buttons: { type: Array, default: () => [] },
})

const emit = defineEmits(['page'])
</script>

<template>
  <div class="pagination">
    <div v-if="info" class="pg-info" v-html="info" />
    <div class="pg-btns">
      <AppButton variant="unstyled"
        v-for="(btn, idx) in buttons"
        :key="`${btn.label}-${btn.page}-${idx}`"
        type="button"
        class="pg-btn"
        :class="{ active: btn.active }"
        :disabled="btn.disabled"
        @click="btn.page != null && emit('page', btn.page)"
      >
        <AppIcon v-if="btn.icon" :name="btn.icon" :size="14" />
        <template v-else>{{ btn.label }}</template>
      </AppButton>
    </div>
  </div>
</template>
