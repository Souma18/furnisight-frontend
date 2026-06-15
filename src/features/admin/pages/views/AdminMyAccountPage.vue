<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import PasswordField from '@features/auth/components/PasswordField.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAuthStore } from '@features/auth/store/authStore'
import { useAdminLayout } from '../../composables/useAdminLayout'
import { useAdminPassword } from '../../composables/useAdminPassword'
import { useAdminUiStore } from '../../store/adminUiStore'

const { simUser } = useAdminLayout()
const ui = useAdminUiStore()
const authStore = useAuthStore()
const profile = reactive(createEmptyProfile())
const originalProfile = ref(null)
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const activeTab = ref('profile')
const { form: pwdForm, saving: pwdSaving, submit: submitPassword } = useAdminPassword()

function createEmptyProfile() {
  return {
    id: '',
    accountId: '',
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    birthday: '',
    gender: '',
    avatarMediaId: null,
    avatarUrl: '',
  }
}

function applyProfile(data = {}) {
  Object.assign(profile, createEmptyProfile(), data)
  originalProfile.value = { ...profile }
}

async function loadProfile() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await adminApi.fetchAdminProfile()
    applyProfile(data)
  } catch (error) {
    loadError.value = error?.response?.data?.message || error.message || 'Không tải được hồ sơ.'
  } finally {
    loading.value = false
  }
}

function resetProfile() {
  if (originalProfile.value) Object.assign(profile, originalProfile.value)
}

async function saveProfile() {
  const firstName = profile.firstName.trim()
  const lastName = profile.lastName.trim()
  const displayName = profile.displayName.trim() || `${lastName} ${firstName}`.trim()
  if (!firstName || !lastName || !displayName) {
    ui.showToast({ icon: 'x', title: 'Thiếu thông tin', subtitle: 'Vui lòng nhập họ, tên và tên hiển thị.' })
    return
  }

  saving.value = true
  try {
    const { data } = await adminApi.updateAdminProfile({
      displayName,
      firstName,
      lastName,
      avatarMediaId: profile.avatarMediaId || null,
      bio: profile.bio.trim(),
      birthday: profile.birthday || null,
      gender: profile.gender || null,
    })
    applyProfile(data)
    authStore.updateProfile({
      ...data,
      id: data.accountId || authStore.user?.id,
    })
    ui.showToast({ title: 'Đã lưu thành công', subtitle: 'Thông tin cá nhân đã được cập nhật.' })
  } catch (error) {
    ui.showToast({ icon: 'x', title: 'Không thể cập nhật', subtitle: error?.response?.data?.message || error.message })
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)

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
      <p v-if="loading" class="account-state">Đang tải hồ sơ...</p>
      <div v-else-if="loadError" class="account-state account-state--error">
        <span>{{ loadError }}</span>
        <button type="button" class="btn-export" @click="loadProfile">Thử lại</button>
      </div>

      <template v-else-if="activeTab === 'profile'">
        <div class="form-section-title"><AppIcon name="user" :size="16" />Thông tin cá nhân</div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Họ</label><input v-model="profile.lastName" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Tên</label><input v-model="profile.firstName" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Tên hiển thị</label><input v-model="profile.displayName" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Email</label><input v-model="profile.email" class="form-input" readonly /></div>
          <div class="form-group"><label class="form-label">Ngày sinh</label><input v-model="profile.birthday" class="form-input" type="date" /></div>
          <div class="form-group">
            <label class="form-label">Giới tính</label>
            <select v-model="profile.gender" class="form-input">
              <option value="">Không cung cấp</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div class="form-group full"><label class="form-label">Giới thiệu</label><textarea v-model="profile.bio" class="form-input" rows="4" /></div>
        </div>

        <div class="form-section-title" style="margin-top:4px"><AppIcon name="mapPin" :size="16" />Thông tin hệ thống</div>
        <div class="acct-sys-grid">
          <div class="acct-sys-item"><div class="acct-sys-label">ID Tài khoản</div><strong>{{ profile.accountId }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">ID Hồ sơ</div><strong>{{ profile.id }}</strong></div>
          <div class="acct-sys-item"><div class="acct-sys-label">Vai trò</div><strong>{{ simUser.roleTag }}</strong></div>
        </div>

        <div class="acct-form-actions">
          <button type="button" class="btn-export" :disabled="saving" @click="resetProfile"><AppIcon name="close" :size="14" />Hủy</button>
          <button type="button" class="btn-add" :disabled="saving" @click="saveProfile">
            <AppIcon name="check" :size="14" />{{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </template>

      <template v-else-if="activeTab === 'password'">
        <div class="form-section-title"><AppIcon name="lock" :size="16" />Đổi mật khẩu</div>
        <form class="form-grid" @submit.prevent="submitPassword">
          <div class="form-group full password-admin-field"><label class="form-label">Mật khẩu hiện tại</label><PasswordField v-model="pwdForm.currentPassword" class="form-input" autocomplete="current-password" required /></div>
          <div class="form-group password-admin-field"><label class="form-label">Mật khẩu mới</label><PasswordField v-model="pwdForm.newPassword" class="form-input" autocomplete="new-password" required /></div>
          <div class="form-group password-admin-field"><label class="form-label">Xác nhận mật khẩu</label><PasswordField v-model="pwdForm.confirmPassword" class="form-input" autocomplete="new-password" required /></div>
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
.account-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 180px;
  color: var(--text3);
}
.account-state--error { color: var(--red); }
.password-admin-field {
  --auth-border: var(--border);
  --auth-radius-md: 9px;
  --auth-radius-sm: 7px;
  --auth-surface-secondary: var(--cream);
  --auth-text-primary: var(--text);
  --auth-text-secondary: var(--text3);
  --auth-focus-ring: rgba(201, 146, 42, .16);
}
@media (max-width: 768px) {
  .acct-sys-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
