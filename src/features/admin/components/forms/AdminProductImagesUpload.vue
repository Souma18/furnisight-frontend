<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  images: { type: Array, default: () => [] },
  uploading: { type: Boolean, default: false },
  label: { type: String, default: 'Ảnh sản phẩm' },
  hint: { type: String, default: 'Chọn một hoặc nhiều ảnh sản phẩm' },
  uploadingText: { type: String, default: 'Đang tải ảnh lên Cloudinary...' },
})

const emit = defineEmits(['select', 'remove', 'move'])
let dragIndex = null

function onChange(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) emit('select', files)
  event.target.value = ''
}

function onDragStart(index) {
  dragIndex = index
}

function onDrop(index) {
  if (dragIndex === null || dragIndex === index) return
  emit('move', dragIndex, index)
  dragIndex = null
}
</script>

<template>
  <div class="mform-group">
    <label class="mfl">{{ label }}</label>
    <label class="model-upload-box" :class="{ 'has-file': images.length }">
      <input type="file" accept="image/*" multiple hidden @change="onChange" />
      <AppIcon name="image-plus" :size="28" style="margin-bottom:8px;color:var(--gold)" />
      <div style="font-size:12px;color:var(--text3)">
        {{ uploading ? uploadingText : hint }}
      </div>
    </label>
    <div v-if="images.length" class="product-image-grid">
      <div
        v-for="(url, index) in images"
        :key="url"
        class="product-image-thumb"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop.prevent="onDrop(index)"
      >
        <img :src="url" alt="" />
        <div class="product-image-order">
          <button type="button" :disabled="index === 0" @click="emit('move', index, index - 1)">
            <AppIcon name="chevron-left" :size="12" />
          </button>
          <span>{{ index + 1 }}</span>
          <button type="button" :disabled="index === images.length - 1" @click="emit('move', index, index + 1)">
            <AppIcon name="chevron-right" :size="12" />
          </button>
        </div>
        <button type="button" class="product-image-remove" @click="emit('remove', url)">
          <AppIcon name="x" :size="12" />
        </button>
      </div>
    </div>
  </div>
</template>
