<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

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

defineEmits(['focus-camera', 'set-top-view', 'set-front-view', 'toggle-fullscreen'])

const { t } = useI18n()
</script>

<template>
  <div v-if="hasRoom" class="bottom-controls">
    <div class="view-tabs">
      <button type="button" :class="{ active: viewMode === '3d' }" @click="$emit('focus-camera')">3D</button>
      <button type="button" :class="{ active: viewMode === 'top' }" @click="$emit('set-top-view')">{{ t('room3d.controls.top') }}</button>
      <button type="button" :class="{ active: viewMode === 'front' }" @click="$emit('set-front-view')">
        {{ t('room3d.controls.front') }}
      </button>
    </div>
    <button type="button" class="fullscreen-btn" @click="$emit('toggle-fullscreen')">
      <AppIcon name="fullscreen" :size="14" />
      <span>{{ t('room3d.controls.panorama') }}</span>
    </button>
  </div>
</template>

<style scoped>
.bottom-controls {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 8;
}

.view-tabs {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.24rem;
  border: 1px solid #e5dfd4;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.view-tabs button {
  border: 1px solid rgba(16, 49, 70, 0.15);
  background: transparent;
  color: #0f3954;
  padding: 0.35rem 0.72rem;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
}

.view-tabs button:hover {
  border-color: #d4c3aa;
}

.view-tabs button.active {
  background: #103952;
  color: #f7b340;
  border-color: #103952;
}

.fullscreen-btn {
  border: none;
  background: #103952;
  color: #f7f9fb;
  padding: 0.52rem 0.95rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.fullscreen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 57, 82, 0.25);
}
</style>
