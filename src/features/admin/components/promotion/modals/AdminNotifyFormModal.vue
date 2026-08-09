<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { ref, computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PROMOTION_SEGMENTS } from '../../../config/adminPromotionState'

const props = defineProps({
  show: { type: Boolean, required: true },
  isEditing: { type: [Boolean, Object], default: false },
  form: { type: Object, required: true },
  vouchers: { type: Array, required: true },
  templates: { type: Array, required: true },
  users: { type: Array, required: true },
  userQuery: { type: String, default: '' },
})

const emit = defineEmits([
  'close',
  'submit',
  'update:userQuery',
  'apply-template',
  'open-preview',
  'open-unlayer'
])

const showUserPicker = ref(false)

const isHtmlContent = computed(() => {
  const str = props.form.body
  return typeof str === 'string' && (str.includes('<!DOCTYPE html>') || str.includes('<html') || str.includes('UNLAYER_DESIGN_START'))
})

function handleQueryInput(e) {
  emit('update:userQuery', e.target.value)
}

function handleTemplateChange(e) {
  emit('apply-template', e.target.value)
}

function handlePreview() {
  emit('open-preview', props.form.title, props.form.body)
}

function handleUnlayer() {
  emit('open-unlayer', props.form.body, (val) => {
    props.form.body = val
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
        <h2>{{ isEditing ? 'Sửa' : 'Tạo' }} <em>thông báo</em></h2>
        <AppButton variant="unstyled" type="button" @click="emit('close')"><AppIcon name="x" :size="18" /></AppButton>
      </header>
      <div class="modal-body">
        <label>Áp dụng Mẫu thông báo (Tùy chọn)
          <select @change="handleTemplateChange">
            <option value="">-- Chọn mẫu thông báo --</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">
              {{ t.code }} - {{ t.name }}
            </option>
          </select>
        </label>

        <label>Tiêu đề *
          <AppInput v-model="form.title" required placeholder="Bạn vừa nhận voucher mới"/>
        </label>

        <label>Nội dung
          <div v-if="isHtmlContent" class="html-content-badge">
            <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
            <div class="html-actions">
              <AppButton variant="outline" size="sm" type="button" @click="handlePreview">Xem trước</AppButton>
              <AppButton variant="outline" size="sm" type="button" @click="handleUnlayer">Sửa thiết kế</AppButton>
              <AppButton variant="cancel" size="sm" type="button" @click="form.body = ''">Xóa / Soạn lại</AppButton>
            </div>
          </div>
          <textarea v-else v-model="form.body" required rows="12" class="large-textarea" />
        </label>

        <div class="form-row">
          <label>Voucher liên quan
            <select v-model="form.relatedVoucherId">
              <option value="">Không gắn voucher</option>
              <option v-for="voucher in vouchers" :key="voucher.id" :value="voucher.id">
                {{ voucher.code }} - {{ voucher.name }}
              </option>
            </select>
          </label>
          <label>Kiểu gửi
            <select v-model="form.sendType">
              <option value="NOW">Gửi ngay</option>
              <option value="SCHEDULED">Hẹn lịch</option>
              <option value="DRAFT">Lưu nháp</option>
            </select>
          </label>
        </div>

        <label v-if="form.sendType === 'SCHEDULED'">Thời gian gửi
          <input v-model="form.scheduledAt" type="datetime-local">
        </label>

        <div class="choice-grid">
          <AppButton variant="unstyled" type="button" :class="{ selected: form.targetType === 'MANUAL' }" @click="form.targetType = 'MANUAL'">Chọn user</AppButton>
          <AppButton variant="unstyled" type="button" :class="{ selected: form.targetType === 'ALL' }" @click="form.targetType = 'ALL'">Toàn bộ</AppButton>
          <AppButton variant="unstyled" type="button" :class="{ selected: form.targetType === 'SEGMENT' }" @click="form.targetType = 'SEGMENT'">Theo điều kiện</AppButton>
        </div>

        <template v-if="form.targetType === 'MANUAL'">
          <AppButton variant="outline" type="button" style="margin-bottom: 15px; width: 100%; justify-content: center" @click="showUserPicker = !showUserPicker">
            <AppIcon :name="showUserPicker ? 'chevronUp' : 'chevronDown'" :size="16" />
            {{ showUserPicker ? 'Ẩn danh sách tìm kiếm' : 'Hiển thị tìm người dùng' }}
          </AppButton>
          <div v-show="showUserPicker" class="user-picker-wrapper">
            <label>Tìm người dùng
              <AppInput :modelValue="userQuery" @update:modelValue="handleQueryInput" placeholder="Tên hoặc email..."/>
            </label>
            <div class="user-pick-list">
              <label v-for="user in users" :key="user.id" class="user-pick-item">
                <input v-model="form.targetUserIds" type="checkbox" :value="user.id">
                <span>{{ user.avatar }}</span>
                <b>{{ user.name }}</b>
                <small>{{ user.email }}</small>
              </label>
              <div v-if="!users.length" class="user-pick-empty">Không tìm thấy người dùng phù hợp.</div>
            </div>
          </div>
        </template>

        <label v-if="form.targetType === 'SEGMENT'">Nhóm người dùng
          <select v-model="form.segmentKey">
            <option v-for="segment in PROMOTION_SEGMENTS" :key="segment.value" :value="segment.value">
              {{ segment.label }}
            </option>
          </select>
        </label>

        <div class="checkbox-grid">
          <label class="check-line"><input v-model="form.channels" type="checkbox" value="NOTIFICATION">Notification</label>
          <label class="check-line"><input v-model="form.channels" type="checkbox" value="EMAIL">Email</label>
        </div>
      </div>
      <footer>
        <AppButton variant="cancel" type="button" @click="emit('close')">
          {{ isEditing?.status === 'SENT' ? 'Đóng' : 'Hủy' }}
        </AppButton>
        <AppButton variant="primary" v-if="isEditing?.status !== 'SENT'" type="submit">
          <AppIcon name="save" />Lưu thông báo
        </AppButton>
      </footer>
    </div>
  </form>
</template>
