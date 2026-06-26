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
  roomScaleLabel: {
    type: String,
    default: '0',
  },
  canDecreaseRoomScale: {
    type: Boolean,
    default: false,
  },
  canIncreaseRoomScale: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'focus-camera',
  'set-top-view',
  'set-front-view',
  'toggle-fullscreen',
  'decrease-room-scale',
  'increase-room-scale',
  'reset-room-scale',
])

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
    <div class="scale-controls" :aria-label="t('room3d.controls.scaleAria')">
      <span class="scale-label">{{ t('room3d.controls.scale') }}</span>
      <div class="scale-stepper">
        <button
          type="button"
          class="icon-btn"
          :disabled="!canDecreaseRoomScale"
          :aria-label="t('room3d.controls.scaleDown')"
          @click="$emit('decrease-room-scale')"
        >
          <AppIcon name="minus" :size="14" />
        </button>
        <button type="button" class="scale-value" @click="$emit('reset-room-scale')">
          {{ roomScaleLabel }}
        </button>
        <button
          type="button"
          class="icon-btn"
          :disabled="!canIncreaseRoomScale"
          :aria-label="t('room3d.controls.scaleUp')"
          @click="$emit('increase-room-scale')"
        >
          <AppIcon name="plus" :size="14" />
        </button>
      </div>
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
  flex-wrap: wrap;
  justify-content: center;
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

.scale-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.26rem 0.38rem 0.26rem 0.6rem;
  border: 1px solid #e5dfd4;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
}

.scale-label {
  color: #5f6974;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.scale-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
}

.icon-btn,
.scale-value {
  border: 1px solid rgba(16, 49, 70, 0.15);
  background: #fff;
  color: #103952;
  border-radius: 6px;
  min-width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.scale-value {
  min-width: 48px;
  padding: 0 0.55rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.icon-btn:hover:not(:disabled),
.scale-value:hover {
  border-color: #d4c3aa;
}

.icon-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .bottom-controls {
    width: calc(100% - 1.2rem);
    bottom: 0.75rem;
  }

  .scale-controls {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
