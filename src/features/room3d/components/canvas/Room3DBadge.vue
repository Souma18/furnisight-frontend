<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  hasRoom: {
    type: Boolean,
    default: false,
  },
  selectedRoom: {
    type: Object,
    default: null,
  },
})

const { t } = useI18n()

function roomIconName(type) {
  const iconMap = {
    bedroom: 'bed',
    living: 'sofa',
    dining: 'utensilsCrossed',
    kitchen: 'utensils',
    office: 'briefcase',
    bathroom: 'house',
  }
  return iconMap[type] ?? 'house'
}
</script>

<template>
  <div v-if="hasRoom" class="room-badge">
    <span class="room-icon"><AppIcon :name="roomIconName(selectedRoom?.type)" :size="15" /></span>
    <span class="room-name">{{ selectedRoom?.type ? t(`room3d.roomTypes.${selectedRoom.type}`) : (selectedRoom?.name || t('room3d.badge.room')) }}</span>
    <span class="room-ai">{{ t('room3d.badge.detected') }}</span>
  </div>
</template>
