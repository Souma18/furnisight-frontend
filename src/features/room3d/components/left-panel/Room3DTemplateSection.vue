<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSpin } from 'naive-ui'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  roomTemplates: { type: Array, required: true },
  selectedRoomType: { type: String, default: null },
  selectedRoom: { type: Object, default: null },
  isLoadingTemplates: { type: Boolean, required: true },
  isRoomSelectionLocked: { type: Boolean, required: true },
})

const emit = defineEmits(['select-room-type'])
const { t } = useI18n()

const roomHasModel = computed(() => Boolean(props.selectedRoom?.modelUrl))
</script>

<template>
  <div class="room-templates">
    <p class="label">{{ t('room3d.setup.roomSource') }}</p>
    <NSpin v-if="isLoadingTemplates" size="small">{{ t('room3d.setup.loadingTemplates') }}</NSpin>
    <div v-else class="room-list">
      <AppButton
        v-for="room in roomTemplates"
        :key="room.id"
        type="button"
        class="room-btn"
        :class="{ active: selectedRoomType === room.type, disabled: isRoomSelectionLocked }"
        :disabled="isRoomSelectionLocked"
        @click="emit('select-room-type', room.type)"
      >
        <span class="room-btn-icon">
          <AppIcon :name="room.icon || 'house'" :size="22" />
        </span>
        <span class="room-btn-content">
          <strong>{{ room.name }}</strong>
          <small>{{ t('room3d.products.count', { count: room.type === 'bedroom' ? 18 : room.type === 'living' ? 22 : room.type === 'dining' ? 14 : 16 }) }}</small>
        </span>
      </AppButton>
    </div>

    <div class="room-mode-note" v-if="selectedRoom">
      <strong>{{ selectedRoom.name }}</strong>
      <p v-if="roomHasModel">
        {{ t('room3d.setup.roomReady') }}
      </p>
      <p v-else>
        {{ selectedRoom.statusText || t('room3d.setup.modelPending') }}
      </p>
    </div>
  </div>
</template>
