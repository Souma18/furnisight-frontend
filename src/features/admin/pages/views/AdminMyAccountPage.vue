<script setup>
import { onMounted, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminLayout } from '../../composables/useAdminLayout'
import { useAdminPassword } from '../../composables/useAdminPassword'
import { useAdminUiStore } from '../../store/adminUiStore'

const { simUser } = useAdminLayout()
const ui = useAdminUiStore()
const profile = ref(null)
const activeTab = ref('profile')
const { form: pwdForm, saving: pwdSaving, submit: submitPassword } = useAdminPassword()

onMounted(async () => {
  const res = await adminApi.fetchAdminProfile()
  profile.value = res.data
})

const menuItems = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: 'user' },
  { id: 'password', label: 'Đổi mật khẩu', icon: 'lock' },
  { id: '2fa', label: 'Xác thực 2FA', icon: 'shield' },
]
</script>

<template>
  <AdminPageHeader eyebrow="Hồ sơ cá nhân" title-html="Trang <em>của tôi</em>" />

  <div class="account-layout">
    <div class="account-sidebar-card">
      <div class="acct-av-big">{{ simUser.av }}</div>
      <div class="acct-name">{{ simUser.name }}</div>
      <span class="acct-role-tag" :class="simUser.rtClass"><AppIcon :name="simUser.roleIcon" :size="13" />{{ simUser.roleTag }}</span>
      <div style="font-size:12px;color:var(--text3);margin:16px 0">{{ simUser.email }}</div>
      <div class="acct-stats" style="margin-bottom:20px">
        <div class="acct-stat"><div class="acct-stat-val gold">∞</div><div class="acct-stat-label">Quyền hạn</div></div>
        <div class="acct-stat"><div class="acct-stat-val green">12</div><div class="acct-stat-label">Module</div></div>
        <div class="acct-stat"><div class="acct-stat-val">1</div><div class="acct-stat-label">Vai trò</div></div>
      </div>
      <button
        v-for="m in menuItems"
        :key="m.id"
        type="button"
        class="acct-menu-item"
        :class="{ active: activeTab === m.id }"
        @click="activeTab = m.id"
      >
        <AppIcon :name="m.icon" :size="16" /> {{ m.label }}
      </button>
    </div>

    <div class="account-detail-card">
      <template v-if="activeTab === 'profile' && profile">
        <div class="form-section-title"><AppIcon name="user" :size="16" />Thông tin cá nhân</div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Họ tên</label><input v-model="profile.name" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Email</label><input v-model="profile.email" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Số điện thoại</label><input v-model="profile.phone" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Ngày sinh</label><input v-model="profile.birthDate" class="form-input" type="date" /></div>
          <div class="form-group"><label class="form-label">Vai trò</label><input :value="profile.role" class="form-input" readonly style="background:var(--cream2);cursor:not-allowed" /></div>
          <div class="form-group"><label class="form-label">Trạng thái</label><input :value="profile.status" class="form-input" readonly style="background:var(--green-bg);color:var(--green2);cursor:not-allowed" /></div>
        </div>

        <div class="form-section-title" style="margin-top:4px"><AppIcon name="mapPin" :size="16" />Thông tin hệ thống</div>
        <div class="acct-sys-grid">
          <div class="acct-sys-item"><div class="acct-sys-label">ID Tài khoản</div><strong>{{ profile.id }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">Ngày tạo</div><strong>{{ profile.createdAt }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">Đăng nhập cuối</div><strong>{{ profile.lastLogin }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">IP cuối</div><strong>{{ profile.lastIp }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">Thiết bị</div><strong>{{ profile.device }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">Xác thực 2FA</div><span class="badge b-success">{{ profile.twoFa ? 'Đã bật' : 'Chưa bật' }}</span></div>
        </div>

        <div class="acct-form-actions">
          <button type="button" class="btn-export" @click="ui.showToast({ icon: 'x', title: 'Đã hủy thay đổi' })"><AppIcon name="close" :size="14" />Hủy</button>
          <button type="button" class="btn-add" @click="ui.showToast({ title: 'Đã lưu thành công', subtitle: 'Thông tin cá nhân đã được cập nhật.' })">
            <AppIcon name="check" :size="14" />Lưu thay đổi
          </button>
        </div>
      </template>

      <template v-else-if="activeTab === 'password'">
        <div class="form-section-title"><AppIcon name="lock" :size="16" />Đổi mật khẩu</div>
        <form class="form-grid" @submit.prevent="submitPassword">
          <div class="form-group full"><label class="form-label">Mật khẩu hiện tại</label><input v-model="pwdForm.currentPassword" class="form-input" type="password" required /></div>
          <div class="form-group"><label class="form-label">Mật khẩu mới</label><input v-model="pwdForm.newPassword" class="form-input" type="password" required /></div>
          <div class="form-group"><label class="form-label">Xác nhận mật khẩu</label><input v-model="pwdForm.confirmPassword" class="form-input" type="password" required /></div>
          <div class="form-group full acct-form-actions">
            <button type="submit" class="btn-add" :disabled="pwdSaving">Cập nhật mật khẩu</button>
          </div>
        </form>
      </template>

      <template v-else>
        <p style="color:var(--text3);font-size:13px">Tính năng đang phát triển.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.acct-sys-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  background: var(--cream);
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 16px;
  margin-bottom: 18px;
}
.acct-sys-item {
  font-size: 12px;
}
.acct-sys-label {
  color: var(--text3);
  margin-bottom: 3px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.05em;
}
.acct-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
@media (max-width: 768px) {
  .acct-sys-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
