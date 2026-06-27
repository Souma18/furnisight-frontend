<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PROMOTION_SEGMENTS } from '../../../config/adminPromotionState'

const props = defineProps({
  show: { type: Boolean, required: true },
  publish: { type: Object, required: true },
  users: { type: Array, required: true },
  templates: { type: Array, required: true },
  publishing: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit', 'apply-template', 'open-preview', 'open-unlayer'])

const selectedVoucher = computed(() => props.publish.voucher)

const isHtmlContent = computed(() => {
  const str = props.publish.body
  return typeof str === 'string' && (str.includes('<!DOCTYPE html>') || str.includes('<html') || str.includes('UNLAYER_DESIGN_START'))
})

function handleTemplateChange(e) {
  emit('apply-template', e.target.value)
}

function handlePreview() {
  emit('open-preview', props.publish.title, props.publish.body)
}

function handleUnlayer() {
  emit('open-unlayer', props.publish.body, (val) => {
    props.publish.body = val
  })
}
</script>

<template>
  <aside v-if="show" class="drawer-backdrop" @click.self="emit('close')">
    <div class="publish-drawer">
      <header>
        <strong>Phát hành voucher <em>{{ selectedVoucher?.code }}</em></strong>
        <AppButton type="button" @click="emit('close')"><AppIcon name="x" /></AppButton>
      </header>
      <div class="drawer-body">
        <div class="segment-choice">
          <AppButton :class="{ selected: publish.segment === 'one' }" @click="publish.segment = 'one'">
            <AppIcon name="user" />
            <span>Một người<small>Tìm và cấp cho 1 user cụ thể</small></span>
          </AppButton>
          <AppButton :class="{ selected: publish.segment === 'many' }" @click="publish.segment = 'many'">
            <AppIcon name="users" />
            <span>Nhiều người<small>Chọn danh sách user</small></span>
          </AppButton>
          <AppButton :class="{ selected: publish.segment === 'all' }" @click="publish.segment = 'all'">
            <AppIcon name="globe" />
            <span>Toàn bộ người dùng<small>Phát hàng loạt</small></span>
          </AppButton>
          <AppButton :class="{ selected: publish.segment === 'cond' }" @click="publish.segment = 'cond'">
            <AppIcon name="filter" />
            <span>Theo điều kiện<small>Khách mới, bỏ giỏ...</small></span>
          </AppButton>
        </div>

        <label v-if="publish.segment === 'one' || publish.segment === 'many'">Tìm người dùng
          <AppInput v-model="publish.userQuery" placeholder="Email hoặc tên..."/>
        </label>
        
        <div v-if="publish.segment === 'one' || publish.segment === 'many'" class="user-pick-list compact-users">
          <label v-for="user in users" :key="user.id" class="user-pick-item">
            <input
              v-if="publish.segment === 'one'"
              type="radio"
              name="publish-user"
              :checked="publish.selectedUserIds[0] === user.id"
              @change="publish.selectedUserIds = [user.id]"
            >
            <input
              v-else
              v-model="publish.selectedUserIds"
              type="checkbox"
              :value="user.id"
            >
            <span>{{ user.avatar }}</span>
            <b>{{ user.name }}</b>
            <small>{{ user.email }}</small>
          </label>
          <div v-if="!users.length" class="user-pick-empty">Không tìm thấy người dùng phù hợp.</div>
        </div>

        <label v-if="publish.segment === 'cond'">Nhóm người dùng
          <select v-model="publish.segmentKey">
            <option v-for="seg in PROMOTION_SEGMENTS" :key="seg.value" :value="seg.value">
              {{ seg.label }}
            </option>
          </select>
        </label>

        <div class="publish-channels">
          <div class="pc-title"><AppIcon name="send" /> Kênh gửi thông báo</div>
          <div class="checkbox-grid">
            <label class="check-line"><input v-model="publish.channels" type="checkbox" value="NOTIFICATION">Thông báo Web</label>
            <label class="check-line"><input v-model="publish.channels" type="checkbox" value="EMAIL">Email</label>
            <label class="check-line"><input v-model="publish.channels" type="checkbox" value="SMS" disabled>SMS (Sắp có)</label>
          </div>
        </div>

        <template v-if="publish.channels.length > 0">
          <label style="margin-top: 15px;">Áp dụng Mẫu thông báo (Tùy chọn)
            <select @change="handleTemplateChange">
              <option value="">-- Chọn mẫu thông báo --</option>
              <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.code }} - {{ t.name }}</option>
            </select>
          </label>
          <label>Tiêu đề thông báo *
            <AppInput v-model="publish.title" placeholder="Bạn có 1 mã giảm giá mới"/>
          </label>
          <label>Nội dung *
            <div v-if="isHtmlContent" class="html-content-badge">
              <AppIcon name="layout" :size="16" /> Đã áp dụng mẫu HTML
              <div class="html-actions">
                <AppButton type="button" class="mc-outline" @click="handlePreview">Xem trước</AppButton>
                <AppButton type="button" class="mc-outline" @click="handleUnlayer">Sửa thiết kế</AppButton>
                <AppButton type="button" class="mc-cancel" @click="publish.body = ''">Xóa / Soạn lại</AppButton>
              </div>
            </div>
            <textarea v-else v-model="publish.body" rows="6" />
          </label>
        </template>
      </div>
      <footer>
        <AppButton type="button" class="mc-cancel" @click="emit('close')">Hủy</AppButton>
        <AppButton type="button" class="mc-primary" :disabled="publishing" @click="emit('submit')">
          <AppIcon name="send" />
          {{ publishing ? 'Đang phát hành...' : 'Xác nhận phát hành' }}
        </AppButton>
      </footer>
    </div>
  </aside>
</template>
