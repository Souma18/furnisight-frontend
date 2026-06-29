<script setup>
import AppButton from '@shared/ui/AppButton.vue'
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
      <AppButton type="button" variant="unstyled" :class="{ active: viewMode === '3d' }" @click="$emit('focus-camera')">3D</AppButton>
      <AppButton type="button" variant="unstyled" :class="{ active: viewMode === 'top' }" @click="$emit('set-top-view')">{{ t('room3d.controls.top') }}</AppButton>
      <AppButton type="button" variant="unstyled" :class="{ active: viewMode === 'front' }" @click="$emit('set-front-view')">
        {{ t('room3d.controls.front') }}
      </AppButton>
    </div>
    <div class="scale-controls" :aria-label="t('room3d.controls.scaleAria')">
      <span class="scale-label">{{ t('room3d.controls.scale') }}</span>
      <div class="scale-stepper">
        <AppButton
          type="button"
          variant="unstyled"
          class="room3d-icon-btn"
          :disabled="!canDecreaseRoomScale"
          :aria-label="t('room3d.controls.scaleDown')"
          @click="$emit('decrease-room-scale')"
        >
          <AppIcon name="minus" :size="14" />
        </AppButton>
        <AppButton type="button" variant="unstyled" class="scale-value" @click="$emit('reset-room-scale')">
          {{ roomScaleLabel }}
        </AppButton>
        <AppButton
          type="button"
          variant="unstyled"
          class="room3d-icon-btn"
          :disabled="!canIncreaseRoomScale"
          :aria-label="t('room3d.controls.scaleUp')"
          @click="$emit('increase-room-scale')"
        >
          <AppIcon name="plus" :size="14" />
        </AppButton>
      </div>
    </div>
    <AppButton type="button" variant="unstyled" class="fullscreen-btn" @click="$emit('toggle-fullscreen')">
      <AppIcon name="fullscreen" :size="14" />
      <span>{{ t('room3d.controls.panorama') }}</span>
    </AppButton>
  </div>
</template>
