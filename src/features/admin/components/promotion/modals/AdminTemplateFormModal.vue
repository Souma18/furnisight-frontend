<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  isEditing: { type: [Boolean, Object], default: false },
  form: { type: Object, required: true },
})

const emit = defineEmits([
  'close',
  'submit',
  'open-preview',
  'open-unlayer'
])

const isHtmlContent = computed(() => {
  const str = props.form.bodyTemplate
  return typeof str === 'string' && (str.includes('<!DOCTYPE html>') || str.includes('<html') || str.includes('UNLAYER_DESIGN_START'))
})

function handlePreview() {
  emit('open-preview', props.form.titleTemplate, props.form.bodyTemplate)
}

function handleUnlayer(initial = props.form.bodyTemplate) {
  emit('open-unlayer', initial, (val) => {
    props.form.bodyTemplate = val
  })
}
</script>

<template>
  <form
    v-if="show"
    class="modal-backdrop"
    @click.self="emit('close')"
    @submit.prevent="emit('submit')"
  >
    <div class="modal-card">
      <header>
        <h2>{{ isEditing ? 'Sửa' : 'Tạo' }} <em>mẫu thông báo</em></h2>
        <AppButton variant="unstyled" type="button" @click="emit('close')"><AppIcon name="x" :size="18" /></AppButton>
      </header>
      <div class="modal-body">
        <div class="form-row">
          <label>Tên mẫu *
            <AppInput v-model="form.name" required placeholder="Gửi mã giảm giá ngày lễ"/>
          </label>
          <label>Mã mẫu *
            <AppInput v-model="form.code" required placeholder="HOLIDAY_COUPON_01"/>
          </label>
        </div>
        <label>Loại mẫu
          <select v-model="form.type" style="padding: 8px; border-radius: 6px; border: 1px solid var(--app-border); background: var(--app-control-bg); color: var(--app-text); width: 100%;">
            <option value="PROMOTION">Khuyến mãi (Promotion)</option>
            <option value="SYSTEM">Hệ thống (System)</option>
            <option value="REVIEW">Đánh giá (Review)</option>
            <option value="ORDER">Đơn hàng (Order)</option>
          </select>
        </label>
        <label>Tiêu đề mẫu (Template)
          <AppInput v-model="form.titleTemplate" placeholder="Tặng bạn mã ưu đãi {{coupon_code}}"/>
        </label>
        <label>Nội dung mẫu (Template)
          <div v-if="isHtmlContent" class="html-content-badge">
            <AppIcon name="layout" :size="16" /> Đã có thiết kế mẫu HTML
            <div class="html-actions">
              <AppButton variant="outline" size="sm" type="button" @click="handlePreview">Xem trước</AppButton>
              <AppButton variant="outline" size="sm" type="button" @click="handleUnlayer()">Sửa thiết kế</AppButton>
              <AppButton variant="cancel" size="sm" type="button" @click="form.bodyTemplate = ''">Xóa / Soạn lại</AppButton>
            </div>
          </div>
          <textarea v-else v-model="form.bodyTemplate" rows="4" style="resize: vertical; min-height: 100px; max-height: 240px;" placeholder="Nhập nội dung mẫu. Có thể chứa biến như {{user_name}}..." />
        </label>
        <AppButton variant="outline"
          v-if="!isHtmlContent"
          type="button"
          style="width:100%; justify-content:center; margin-top: 10px;"
          @click="handleUnlayer('')"
        >
          <AppIcon name="layout" /> Thiết kế Email (Kéo thả)
        </AppButton>
      </div>
      <footer>
        <AppButton variant="cancel" type="button" @click="emit('close')">Hủy</AppButton>
        <AppButton variant="primary" type="submit">
          <AppIcon name="save" />Lưu mẫu
        </AppButton>
      </footer>
    </div>
  </form>
</template>
