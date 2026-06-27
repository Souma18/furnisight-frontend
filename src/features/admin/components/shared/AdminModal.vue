<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppModal from '@shared/ui/AppModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  titleHtml: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

</script>

<template>
  <AppModal
    :open="open"
    :width="wide ? '800px' : '500px'"
    no-bg
    @close="emit('close')"
  >
    <div class="modal-box" role="dialog" @click.stop>
      <div class="modal-head">
        <div class="modal-title" v-html="titleHtml" />
        <AppButton type="button" class="modal-close" aria-label="Đóng" @click="emit('close')">
          <AppIcon name="close" :size="16" />
        </AppButton>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-foot">
        <AppButton type="button" class="btn-modal-cancel" @click="emit('close')">{{ readOnly ? 'Đóng' : 'Huỷ' }}</AppButton>
        <AppButton v-if="!readOnly" type="button" class="btn-modal-save" :disabled="saving" @click="emit('save')">
          <AppIcon name="check" :size="14" />
          Lưu thay đổi
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
