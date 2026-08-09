<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'

defineProps({
  hasRoom: {
    type: Boolean,
    default: false,
  },
  viewMode: {
    type: String,
    default: '3d',
  },
  isFullscreen: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'focus-camera',
  'set-top-view',
  'set-front-view',
  'open-advanced',
])

const { t } = useI18n()
</script>

<template>
  <div v-if="hasRoom" class="bottom-controls">
    <div class="view-tabs">
      <AppButton type="button" variant="unstyled" :class="{ active: viewMode === '3d' }" @click="$emit('focus-camera')">3D</AppButton>
      <AppButton type="button" variant="unstyled" :class="{ active: viewMode === 'top' }" @click="$emit('set-top-view')">{{ t('room3d.controls.top') }}</AppButton>
      <AppButton type="button" variant="unstyled" :class="{ active: viewMode === 'front' }" @click="$emit('set-front-view')">
        {{ t('room3d.controls.front') }}
      </AppButton>
    </div>
  </div>
</template>
