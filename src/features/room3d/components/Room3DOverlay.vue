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

<style scoped>
.empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  color: #6b7280;
  pointer-events: none;
}

.empty-icon {
  color: #0f3f5c;
  display: inline-flex;
}

.empty h2 {
  margin: 0;
}

.empty p {
  margin: 0;
}

.busy-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  z-index: 12;
}

.busy-spinner {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 3px solid rgba(255, 255, 255, 0.55);
  border-top-color: #0f3f5c;
  animation: spin 0.8s linear infinite;
}

.busy-overlay p {
  margin: 0;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.drop-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 18;
  border-radius: 999px;
  background: rgba(15, 63, 92, 0.92);
  color: #f7f9fb;
  padding: 0.55rem 1rem;
  font-size: 0.84rem;
  font-weight: 700;
  pointer-events: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
