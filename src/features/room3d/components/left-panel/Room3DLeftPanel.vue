<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import Room3DUploadSection from './Room3DUploadSection.vue'
import Room3DTemplateSection from './Room3DTemplateSection.vue'
import Room3DConfigSection from './Room3DConfigSection.vue'
import { computed } from 'vue'

const props = defineProps({
  mode: String,
  roomTemplates: {
    type: Array,
    default: () => [],
  },
  selectedRoomType: {
    type: String,
    default: null,
  },
  selectedRoom: {
    type: Object,
    default: null,
  },
  imageType: String,
  meshQuality: String,
  quality: String,
  isAnalyzing: Boolean,
  predictionStatus: {
    type: String,
    default: 'idle',
  },
  predictionResponseType: {
    type: String,
    default: null,
  },
  predictionLabel: {
    type: String,
    default: '',
  },
  predictionConfidence: {
    type: Number,
    default: null,
  },
  isLoadingTemplates: Boolean,
  isRoomModelLoading: {
    type: Boolean,
    default: false,
  },
  projectName: String,
  uploadError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'switch-mode',
  'upload-image',
  'select-room-type',
  'image-type-change',
  'mesh-quality-change',
  'quality-change',
  'project-name-change',
])
const { t } = useI18n()

const isRoomSelectionLocked = computed(
  () => props.isLoadingTemplates || props.isAnalyzing || props.isRoomModelLoading,
)
</script>

<template>
  <aside class="panel">
    <div class="panel-heading">
      <p class="section-kicker">{{ t('room3d.setup.kicker') }}</p>
      <strong>{{ t('room3d.setup.title') }}</strong>
    </div>

    <div class="mode-tabs">
      <AppButton
        type="button"
        variant="unstyled"
        class="mode-tab"
        :class="{ active: mode === 'upload' }"
        @click="emit('switch-mode', 'upload')"
      >
        <span class="tab-icon"><AppIcon name="image" :size="22" /></span>
        <span>{{ t('room3d.setup.imageMode') }}</span>
      </AppButton>
      <AppButton
        type="button"
        variant="unstyled"
        class="mode-tab"
        :class="{ active: mode === 'room' }"
        @click="emit('switch-mode', 'room')"
      >
        <span class="tab-icon"><AppIcon name="house" :size="22" /></span>
        <span>{{ t('room3d.setup.roomMode') }}</span>
      </AppButton>
    </div>

    <Room3DUploadSection
      v-if="mode === 'upload'"
      :image-type="imageType"
      :is-analyzing="isAnalyzing"
      :upload-error="uploadError"
      @image-type-change="emit('image-type-change', $event)"
      @upload-image="emit('upload-image', $event)"
    />

    <Room3DTemplateSection
      v-else
      :room-templates="roomTemplates"
      :selected-room-type="selectedRoomType"
      :selected-room="selectedRoom"
      :is-loading-templates="isLoadingTemplates"
      :is-room-selection-locked="isRoomSelectionLocked"
      @select-room-type="emit('select-room-type', $event)"
    />

    <Room3DConfigSection
      v-if="mode === 'upload'"
      :prediction-status="predictionStatus"
      :prediction-label="predictionLabel"
      :prediction-confidence="predictionConfidence"
      :selected-room="selectedRoom"
      :project-name="projectName"
      :image-type="imageType"
      :mesh-quality="meshQuality"
      :quality="quality"
      @project-name-change="emit('project-name-change', $event)"
      @mesh-quality-change="emit('mesh-quality-change', $event)"
      @quality-change="emit('quality-change', $event)"
    />
  </aside>
</template>
