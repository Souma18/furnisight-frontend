<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NTag } from 'naive-ui'
import AppInput from '@shared/ui/AppInput.vue'
import AppButton from '@shared/ui/AppButton.vue'

const props = defineProps({
  predictionStatus: { type: String, required: true },
  predictionLabel: { type: String, default: '' },
  predictionConfidence: { type: Number, default: null },
  selectedRoom: { type: Object, default: null },
  projectName: { type: String, default: '' },
  imageType: { type: String, required: true },
  meshQuality: { type: String, required: true },
  quality: { type: String, required: true },
})

const emit = defineEmits(['project-name-change', 'mesh-quality-change', 'quality-change'])
const { t } = useI18n()

const roomHasModel = computed(() => Boolean(props.selectedRoom?.modelUrl))
const hasPredictionConfidence = computed(
  () => typeof props.predictionConfidence === 'number' && Number.isFinite(props.predictionConfidence),
)
const predictionConfidencePercent = computed(() =>
  hasPredictionConfidence.value ? Math.round(props.predictionConfidence * 100) : null,
)
</script>

<template>
  <div class="config-wrapper">
    <div class="room-info">
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

    <div class="project-name">
      <p class="label">{{ t('room3d.setup.projectName') }}</p>
      <AppInput
        class="project-input"
        :value="projectName"
        :placeholder="t('room3d.setup.projectPlaceholder')"
        @input="emit('project-name-change', $event.target.value)"
      />
    </div>

    <div class="quality">
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
  </div>
</template>
