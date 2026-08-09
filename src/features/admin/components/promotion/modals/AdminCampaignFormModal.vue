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
  const str = props.form.notificationBody
  return typeof str === 'string' && (str.includes('<!DOCTYPE html>') || str.includes('<html') || str.includes('UNLAYER_DESIGN_START'))
})

function handleQueryInput(e) {
  emit('update:userQuery', e.target.value)
}

function handleTemplateChange(e) {
  emit('apply-template', e.target.value)
}

function handlePreview() {
  emit('open-preview', props.form.notificationTitle, props.form.notificationBody)
}

function handleUnlayer() {
  emit('open-unlayer', props.form.notificationBody, (val) => {
    props.form.notificationBody = val
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
    <div class="modal-card modal-lg">
      <header>
        <h2>{{ isEditing ? 'Sửa' : 'Tạo' }} <em>chiến dịch</em></h2>
        <AppButton variant="unstyled" type="button" @click="emit('close')"><AppIcon name="x" :size="18" /></AppButton>
      </header>
      <div class="modal-body">
        <div class="mc-section-title"><AppIcon name="calendar" />Thông tin chiến dịch</div>
        <div class="form-row">
          <label>Tên chiến dịch *
            <AppInput v-model="form.name" required placeholder="Phát voucher cho khách mới"/>
          </label>
          <label>Voucher
            <select v-model="form.voucherId">
              <option value="">Chọn voucher</option>
              <option v-for="v in vouchers" :key="v.id" :value="v.id">
                {{ v.code }} - {{ v.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="mc-section-title"><AppIcon name="users" />Tệp người nhận</div>
        <div class="choice-grid">
          <AppButton variant="unstyled" type="button" :class="{ selected: form.targetType === 'MANUAL' }" @click="form.targetType = 'MANUAL'">Chọn thủ công<small>{{ form.targetUserIds.length }} user</small></AppButton>
          <AppButton variant="unstyled" type="button" :class="{ selected: form.targetType === 'ALL' }" @click="form.targetType = 'ALL'">Toàn bộ<small>Tất cả user</small></AppButton>
          <AppButton variant="unstyled" type="button" :class="{ selected: form.targetType === 'SEGMENT' }" @click="form.targetType = 'SEGMENT'">Theo điều kiện<small>Nhóm người dùng</small></AppButton>
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
            <option v-for="seg in PROMOTION_SEGMENTS" :key="seg.value" :value="seg.value">{{ seg.label }}</option>
          </select>
        </label>

        <div class="mc-section-title"><AppIcon name="send" />Kênh gửi và lịch</div>
        <div class="checkbox-grid">
          <label class="check-line"><input v-model="form.channels" type="checkbox" value="NOTIFICATION">Notification</label>
          <label class="check-line"><input v-model="form.channels" type="checkbox" value="EMAIL">Email</label>
        </div>
        <div class="choice-grid">
          <AppButton variant="unstyled" type="button" :class="{ selected: form.scheduleType === 'NOW' }" @click="form.scheduleType = 'NOW'">Gửi ngay</AppButton>
          <AppButton variant="unstyled" type="button" :class="{ selected: form.scheduleType === 'SCHEDULED' }" @click="form.scheduleType = 'SCHEDULED'">Hẹn lịch</AppButton>
        </div>
        <label v-if="form.scheduleType === 'SCHEDULED'">Thời gian gửi
          <input v-model="form.scheduledAt" type="datetime-local">
        </label>

        <label>Áp dụng Mẫu thông báo (Tùy chọn)
          <select @change="handleTemplateChange">
            <option value="">-- Chọn mẫu thông báo --</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.code }} - {{ t.name }}</option>
          </select>
        </label>
        <div class="form-row">
          <label>Tiêu đề thông báo
            <AppInput v-model="form.notificationTitle" placeholder="Bạn vừa nhận voucher mới"/>
          </label>
          <label>Trạng thái
            <select v-model="form.active">
              <option :value="true">Đang bật</option>
              <option :value="false">Bản nháp</option>
            </select>
          </label>
        </div>
        <label>Nội dung
          <div v-if="isHtmlContent" class="html-content-badge">
            <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
            <div class="html-actions">
              <AppButton variant="outline" size="sm" type="button" @click="handlePreview">Xem trước</AppButton>
              <AppButton variant="outline" size="sm" type="button" @click="handleUnlayer">Sửa thiết kế</AppButton>
              <AppButton variant="cancel" size="sm" type="button" @click="form.notificationBody = ''">Xóa / Soạn lại</AppButton>
            </div>
          </div>
          <textarea v-else v-model="form.notificationBody" rows="12" class="large-textarea" />
        </label>

        <slot name="voucher-preview"></slot>
      </div>
      <footer>
        <AppButton variant="cancel" type="button" @click="emit('close')">
          {{ isEditing?.status === 'SENT' ? 'Đóng' : 'Hủy' }}
        </AppButton>
        <AppButton variant="primary" v-if="isEditing?.status !== 'SENT'" type="submit">
          <AppIcon name="save" />Lưu chiến dịch
        </AppButton>
      </footer>
    </div>
  </form>
</template>
