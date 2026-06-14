<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  open: { type: Boolean, default: false },
  titleHtml: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

function onOverlayClick(event) {
  if (event.target === event.currentTarget) emit('close')
}
</script>

<template>
  <div class="modal-overlay" :class="{ open }" @click="onOverlayClick">
    <div class="modal-box" :class="{ 'modal-box--wide': wide }" role="dialog" @click.stop>
      <div class="modal-head">
        <div class="modal-title" v-html="titleHtml" />
        <button type="button" class="modal-close" aria-label="Đóng" @click="emit('close')">
          <AppIcon name="close" :size="16" />
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-foot">
        <button type="button" class="btn-modal-cancel" @click="emit('close')">{{ readOnly ? 'Đóng' : 'Huỷ' }}</button>
        <button v-if="!readOnly" type="button" class="btn-modal-save" :disabled="saving" @click="emit('save')">
          <AppIcon name="check" :size="14" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
</template>
