<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
})

const emit = defineEmits(['select'])

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onChange(event) {
  const file = event.target.files?.[0]
  if (file) emit('select', file)
  event.target.value = ''
}
</script>

<template>
  <div class="mform-group">
    <label class="mfl">Model 3D (GLB / GLTF / OBJ)</label>
    <label class="model-upload-box" :class="{ 'has-file': fileName }">
      <input type="file" accept=".glb,.gltf,.obj" hidden @change="onChange" />
      <AppIcon name="box" :size="28" style="margin-bottom:8px;color:var(--gold)" />
      <div v-if="fileName" style="font-size:13px;font-weight:500">{{ fileName }}</div>
      <div v-if="fileSize" style="font-size:11px;color:var(--text3);margin-top:4px">{{ formatSize(fileSize) }}</div>
      <div v-else style="font-size:12px;color:var(--text3)">Nhấn để chọn file từ máy · BE sẽ lưu lên server</div>
    </label>
  </div>
</template>
