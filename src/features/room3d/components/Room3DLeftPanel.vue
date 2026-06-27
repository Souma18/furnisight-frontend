<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { NSpin, NTag } from 'naive-ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

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

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const roomHasModel = computed(() => Boolean(props.selectedRoom?.modelUrl))
const selectedFile = ref(null)
const selectedFileName = computed(() => truncateFileName(selectedFile.value?.name ?? ''))
const hasPredictionConfidence = computed(
  () => typeof props.predictionConfidence === 'number' && Number.isFinite(props.predictionConfidence),
)
const predictionConfidencePercent = computed(() =>
  hasPredictionConfidence.value ? Math.round(props.predictionConfidence * 100) : null,
)
const isRoomSelectionLocked = computed(
  () => props.isLoadingTemplates || props.isAnalyzing || props.isRoomModelLoading,
)
function truncateFileName(name) {
  if (!name || name.length <= 24) return name
  const dotIndex = name.lastIndexOf('.')
  const extension = dotIndex > 0 ? name.slice(dotIndex) : ''
  const base = dotIndex > 0 ? name.slice(0, dotIndex) : name
  return `${base.slice(0, 5)}...${extension || base.slice(-6)}`
}

function runAiGenerate() {
  if (!selectedFile.value || props.isAnalyzing) return
  emit('upload-image', selectedFile.value)
}
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
        class="mode-tab"
        :class="{ active: mode === 'upload' }"
        @click="emit('switch-mode', 'upload')"
      >
        <span class="tab-icon"><AppIcon name="image" :size="22" /></span>
        <span>{{ t('room3d.setup.imageMode') }}</span>
      </AppButton>
      <AppButton
        type="button"
        class="mode-tab"
        :class="{ active: mode === 'room' }"
        @click="emit('switch-mode', 'room')"
      >
        <span class="tab-icon"><AppIcon name="house" :size="22" /></span>
        <span>{{ t('room3d.setup.roomMode') }}</span>
      </AppButton>
    </div>

    <div v-if="mode === 'upload'" class="upload-section">
      <p class="label">{{ t('room3d.setup.uploadLabel') }}</p>
      
      <div class="image-type-section">
        <div class="quality-row quality-row--two">
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: imageType === 'normal' }"
            @click="emit('image-type-change', 'normal')"
          >
            {{ t('room3d.setup.normalImage') }}
          </AppButton>
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: imageType === '360' }"
            @click="emit('image-type-change', '360')"
          >
            {{ t('room3d.setup.image360') }}
          </AppButton>
        </div>
      </div>

      <label class="upload-zone">
        <input class="file-input" type="file" accept="image/*" @change="onFileChange" />
        <span class="upload-icon"><AppIcon name="cloudUpload" :size="26" /></span>
        <strong>{{ t('room3d.setup.dropTitle') }}</strong>
        <small>{{ t('room3d.setup.dropSub') }}</small>
        <small>{{ t('room3d.setup.aiDetect') }}</small>
      </label>
      <p v-if="selectedFileName" class="selected-file" :title="selectedFile?.name">
        {{ t('room3d.setup.selectedFile') }}: <strong>{{ selectedFileName }}</strong>
      </p>
      <AppButton
        type="button"
        class="run-ai-btn"
        :disabled="!selectedFile || isAnalyzing"
        @click="runAiGenerate"
      >
        {{ isAnalyzing ? t('room3d.setup.generating') : t('room3d.setup.useAi') }}
      </AppButton>
      <!-- <NSpin v-if="isAnalyzing" size="small">AI dang phan tich...</NSpin> -->
      <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
    </div>

    <div v-else class="room-templates">
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

    <div v-if="mode === 'upload'" class="room-info">
      <p class="label">{{ t('room3d.setup.roomInfo') }}</p>
      <p v-if="predictionStatus === 'idle'" class="note">{{ t('room3d.setup.noPrediction') }}</p>
      <p v-else-if="predictionStatus === 'loading'" class="note">{{ t('room3d.setup.predicting') }}</p>
      <p v-else-if="predictionStatus === 'error'" class="note error-note">{{ t('room3d.setup.predictFailed') }}</p>
      <div v-else class="room-meta">
        <div class="tag-row">
          <NTag type="warning">{{ predictionLabel || selectedRoom?.name || t('room3d.setup.unknownLabel') }}</NTag>
          <NTag v-if="hasPredictionConfidence" type="success">
            {{ predictionConfidencePercent }}%
          </NTag>
        </div>
        <p v-if="selectedRoom && !roomHasModel">
          {{ selectedRoom.statusText || t('room3d.setup.modelPending') }}
        </p>
        <p v-else-if="selectedRoom?.suggestText">{{ selectedRoom.suggestText }}</p>
      </div>
    </div>

    <div v-if="mode === 'upload'" class="project-name">
      <p class="label">{{ t('room3d.setup.projectName') }}</p>
      <AppInput
        class="project-input"
        :value="projectName"
        :placeholder="t('room3d.setup.projectPlaceholder')"
        @input="emit('project-name-change', $event.target.value)"
      />
    </div>

    <div v-if="mode === 'upload'" class="quality">
      <template v-if="imageType === 'normal'">
        <p class="label">{{ t('room3d.setup.meshQuality') }}</p>
        <div class="quality-row quality-row--three">
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: meshQuality === 'low' }"
            @click="emit('mesh-quality-change', 'low')"
          >
            {{ t('room3d.setup.low') }}
          </AppButton>
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: meshQuality === 'medium' }"
            @click="emit('mesh-quality-change', 'medium')"
          >
            {{ t('room3d.setup.medium') }}
          </AppButton>
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: meshQuality === 'high' }"
            @click="emit('mesh-quality-change', 'high')"
          >
            {{ t('room3d.setup.high') }}
          </AppButton>
        </div>
        <small class="quality-hint">{{ t('room3d.setup.meshHint') }}</small>
      </template>
      <template v-else>
        <p class="label">MESH RESOLUTION</p>
        <div class="quality-row">
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: quality === '128' }"
            @click="emit('quality-change', '128')"
          >
            128
          </AppButton>
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: quality === '256' }"
            @click="emit('quality-change', '256')"
          >
            256
          </AppButton>
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: quality === '512' }"
            @click="emit('quality-change', '512')"
          >
            512
          </AppButton>
          <AppButton
            type="button"
            class="quality-btn"
            :class="{ active: quality === '1024' }"
            @click="emit('quality-change', '1024')"
          >
            1024
          </AppButton>
        </div>
        <small class="quality-hint">{{ t('room3d.setup.resolutionHint') }}</small>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0.9rem 0.8rem 1rem;
  border-right: 1px solid #ddd3c6;
  height: 100%;
  overflow: auto;
  background: #f7f3ed;
  /* An thanh scrollbar nhung van giu kha nang scroll */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.panel::-webkit-scrollbar {
  display: none;
}

.panel-heading {
  display: grid;
  gap: 2px;
  padding: 0 2px;
}

.panel-heading strong {
  color: #172532;
  font-size: 1rem;
  font-weight: 700;
}

.section-kicker {
  margin: 0;
  color: #a07320;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0;
  text-transform: uppercase;
}

.mode-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.mode-tab {
  border: 1px solid #d8cec1;
  background: #fffdf9;
  color: #5f5d58;
  border-radius: 8px;
  min-height: 48px;
  font-size: 0.84rem;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
}
.mode-tab:hover { border-color: #c9aa78; transform: translateY(-1px); }
.mode-tab.active {
  background: #12202e;
  border-color: #12202e;
  color: #fff;
}

.mode-tab:focus-visible,
.quality-btn:focus-visible,
.room-btn:focus-visible,
.run-ai-btn:focus-visible,
.project-input:focus-visible,
.upload-zone:focus-within {
  outline: 2px solid rgba(201, 146, 42, 0.6);
  outline-offset: 2px;
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.label {
  margin: 0;
  color: #a29d96;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 0.68rem;
}

.upload-section,
.room-templates,
.room-info,
.project-name,
.quality,
.image-type-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.upload-zone {
  border: 1px dashed #cdbda8;
  border-radius: 8px;
  min-height: 150px;
  padding: 1rem 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 253, 249, 0.7);
  color: #7d776e;
  gap: 0.2rem;
  cursor: pointer;
}

.upload-zone strong {
  color: #9a744f;
  font-size: 0.84rem;
}

.upload-zone small {
  font-size: 0.72rem;
}

.file-input {
  display: none;
}

.upload-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.1rem;
}

.room-list {
  display: grid;
  gap: 0.55rem;
}

.room-btn {
  width: 100%;
  border: 1px solid #d8cec1;
  border-radius: 8px;
  background: #fffdf9;
  min-height: 3.8rem;
  display: flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.65rem 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.room-btn:hover {
  border-color: #d3ab74;
  box-shadow: 0 0 0 2px rgba(211, 171, 116, 0.22);
  transform: translateY(-1px);
}

.room-btn.active {
  border-color: #c89f65;
  box-shadow: inset 0 0 0 1px rgba(200, 159, 101, 0.28);
}

.room-btn.disabled,
.room-btn:disabled {
  cursor: wait;
  opacity: 0.62;
  transform: none;
}

.room-btn-icon {
  width: 1.6rem;
  height: 1.6rem;
  flex: 0 0 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #876844;
}

.room-btn-content {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.room-btn-content strong {
  color: #272522;
  font-size: 0.84rem;
  line-height: 1.2;
}

.room-btn-content small {
  color: #a29d96;
  font-size: 0.78rem;
}

.room-mode-note {
  margin-top: 0.2rem;
  border: 1px solid #d8cec1;
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
  background: #f4f1ec;
}

.room-mode-note strong {
  display: block;
  font-size: 0.88rem;
  color: #4f4b44;
  margin-bottom: 0.25rem;
}

.room-mode-note p {
  margin: 0;
  font-size: 0.8rem;
  color: #6f6a62;
}

.room-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.room-meta p {
  margin: 0;
  font-size: 0.84rem;
  color: #625e57;
}

:deep(.room-meta .n-tag) {
  border-radius: 0.7rem;
  padding: 0.2rem 0.55rem;
}

.note {
  margin: 0;
  font-size: 0.84rem;
  color: #6e6b66;
}

.error-note {
  color: #c54848;
}

.quality-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.35rem;
}

.quality-row--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.quality-row--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.quality-btn {
  border: 1px solid #d8cec1;
  border-radius: 6px;
  background: #fffdf9;
  color: #68655f;
  min-height: 2.25rem;
  font-weight: 700;
  cursor: pointer;
}

.quality-btn.active {
  background: #0f3f5c;
  border-color: #0f3f5c;
  color: #ffba45;
}

.quality-hint {
  color: #8f8a82;
  font-size: 0.72rem;
}

.project-input {
  width: 100%;
  min-height: 2.45rem;
  border: 1px solid #d8cec1;
  border-radius: 8px;
  background: #fffdf9;
  color: #68655f;
  padding: 0.55rem 0.9rem;
  font: inherit;
  outline: none;
}

.project-input:focus {
  border-color: #c8b69e;
  background: #f7f4ef;
}

.upload-error {
  margin: 0.1rem 0 0;
  color: #c54848;
  font-size: 0.76rem;
}

.selected-file {
  margin: 0;
  color: #6d675f;
  font-size: 0.74rem;
  line-height: 1.3;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-file strong {
  color: #3e4952;
}

.run-ai-btn {
  width: 100%;
  border: none;
  border-radius: 8px;
  background: #12202e;
  color: #f8fafb;
  min-height: 2.45rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.run-ai-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(13, 55, 81, 0.28);
}

.run-ai-btn:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}
</style>
