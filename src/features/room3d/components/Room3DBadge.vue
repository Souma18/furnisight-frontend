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
    <span class="room-name">{{ selectedRoom?.name || t('room3d.badge.room') }}</span>
    <span class="room-ai">{{ t('room3d.badge.detected') }}</span>
  </div>
</template>

<style scoped>
.room-badge {
  position: absolute;
  top: 0.9rem;
  left: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.62rem;
  border: 1px solid #e5dfd4;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #163f5b;
  font-size: 0.85rem;
  z-index: 8;
}

.room-icon {
  display: inline-flex;
  color: #9a744f;
}

.room-name {
  font-weight: 600;
}

.room-ai {
  background: #f6b22f;
  color: #0f3f5c;
  border-radius: 4px;
  padding: 0.08rem 0.38rem;
  font-size: 0.66rem;
  font-weight: 700;
}
</style>
