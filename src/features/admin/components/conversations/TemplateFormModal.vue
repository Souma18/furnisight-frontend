<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppModal from '@shared/ui/AppModal.vue'

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
  isOpen: Boolean,
  initialData: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['close'])
const mgr = props.manager
const categories = mgr.templateCategories

const submitting = ref(false)

const emptyForm = () => ({
  id: null,
  title: '',
  content: '',
  category: 'GREETING',
  active: true,
})
const currentForm = ref(emptyForm())

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.initialData) {
        currentForm.value = { ...props.initialData }
      } else {
        currentForm.value = emptyForm()
      }
    }
  }
)


function close() {
  emit('close')
}

async function saveTemplate() {
  if (!currentForm.value.title?.trim() || !currentForm.value.content?.trim()) {
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    const ok = await mgr.saveTemplate({ ...currentForm.value })
    if (ok) {
      close()
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal :open="isOpen" width="600px" no-bg @close="close">
    <div class="cm-modal size-md cm-feature-vars" role="dialog" aria-modal="true" @click.stop>
      <div class="cm-modal-head">
        <div class="cm-modal-title">
          <template v-if="currentForm.id">Sửa <em>template</em></template>
          <template v-else>Thêm <em>template mới</em></template>
        </div>
        <AppButton variant="unstyled" type="button" class="cm-modal-close" aria-label="Đóng" @click="close">
          <AppIcon name="close" :size="14" />
        </AppButton>
      </div>

      <div class="cm-modal-body">
        <div class="tpl-form-grid">
          <div class="tfg full">
            <label class="tfl">Tiêu đề *</label>
            <AppInput v-model="currentForm.title" type="text" class="tfi" placeholder="VD: Chào hỏi khách mới" />
          </div>
          <div class="tfg">
            <label class="tfl">Phân loại</label>
            <select v-model="currentForm.category" class="tfi">
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
          </div>
          <div class="tfg">
            <label class="tfl">Trạng thái</label>
            <div class="tfi-toggle">
              <div class="tfi-tog-opt" :class="{ active: currentForm.active }" @click="currentForm.active = true">Bật</div>
              <div class="tfi-tog-opt" :class="{ active: !currentForm.active }" @click="currentForm.active = false">Tắt</div>
            </div>
          </div>
          <div class="tfg full">
            <label class="tfl">Nội dung template *</label>
            <textarea
              v-model="currentForm.content"
              class="tfi"
              rows="5"
              placeholder="Nội dung tin nhắn mẫu. Dùng {{tên}} để chèn tên khách..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="cm-modal-foot">
        <AppButton variant="unstyled" type="button" class="btn-ghost" :disabled="submitting" @click="close">Huỷ</AppButton>
        <AppButton variant="unstyled" type="button" class="btn-primary" :disabled="submitting" @click="saveTemplate">
          <AppIcon name="check" :size="14" />
          {{ submitting ? 'Đang lưu...' : 'Lưu template' }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
