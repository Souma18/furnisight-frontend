<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  hasRoom: {
    type: Boolean,
    default: false,
  },
  isRoomAvailable: {
    type: Boolean,
    default: true,
  },
  isCanvasBusy: {
    type: Boolean,
    default: false,
  },
  busyText: {
    type: String,
    default: '',
  },
  isDragOverCanvas: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
</script>

<template>
  <div v-if="!hasRoom" class="empty">
    <div class="empty-icon"><AppIcon name="cloudUpload" :size="48" /></div>
    <h2>{{ t('room3d.overlay.uploadStart') }}</h2>
  </div>

  <div v-else-if="!isRoomAvailable" class="empty">
    <div class="empty-icon"><AppIcon name="box" :size="48" /></div>
    <h2>{{ t('room3d.overlay.pendingTitle') }}</h2>
    <p>{{ t('room3d.overlay.pendingCopy') }}</p>
  </div>

  <div v-if="isCanvasBusy" class="busy-overlay">
    <div class="busy-spinner"></div>
    <p>{{ busyText }}</p>
  </div>

  <div v-if="isDragOverCanvas" class="drop-hint">
    {{ t('room3d.overlay.dropHint') }}
  </div>
</template>
