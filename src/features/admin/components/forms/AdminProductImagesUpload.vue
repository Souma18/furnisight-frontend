<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  images: { type: Array, default: () => [] },
  uploading: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'remove'])

function onChange(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) emit('select', files)
  event.target.value = ''
}
</script>

<template>
  <div class="mform-group">
    <label class="mfl">Ảnh sản phẩm</label>
    <label class="model-upload-box" :class="{ 'has-file': images.length }">
      <input type="file" accept="image/*" multiple hidden @change="onChange" />
      <AppIcon name="image-plus" :size="28" style="margin-bottom:8px;color:var(--gold)" />
      <div style="font-size:12px;color:var(--text3)">
        {{ uploading ? 'Đang tải ảnh lên Cloudinary...' : 'Chọn một hoặc nhiều ảnh sản phẩm' }}
      </div>
    </label>
    <div v-if="images.length" class="product-image-grid">
      <div v-for="url in images" :key="url" class="product-image-thumb">
        <img :src="url" alt="" />
        <button type="button" class="product-image-remove" @click="emit('remove', url)">
          <AppIcon name="x" :size="12" />
        </button>
      </div>
    </div>
  </div>
</template>
