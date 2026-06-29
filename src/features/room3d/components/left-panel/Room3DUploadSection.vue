<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  imageType: { type: String, required: true },
  isAnalyzing: { type: Boolean, required: true },
  uploadError: { type: String, default: '' },
})

const emit = defineEmits(['image-type-change', 'upload-image'])
const { t } = useI18n()

const selectedFile = ref(null)

const selectedFileName = computed(() => {
  const name = selectedFile.value?.name ?? ''
  if (!name || name.length <= 24) return name
  const dotIndex = name.lastIndexOf('.')
  const extension = dotIndex > 0 ? name.slice(dotIndex) : ''
  const base = dotIndex > 0 ? name.slice(0, dotIndex) : name
  return `${base.slice(0, 5)}...${extension || base.slice(-6)}`
})

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

function runAiGenerate() {
  if (!selectedFile.value || props.isAnalyzing) return
  emit('upload-image', selectedFile.value)
}
</script>

<template>
  <div class="upload-section">
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
    
    <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
  </div>
</template>
