<script setup>
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { formatDate } from '@shared/lib/formatters'
import { useAdminRoles } from '../../composables/useAdminRoles'
import { useAdminUiStore } from '../../store/adminUiStore'
import { getPermission, getPermClass, getPermLabel } from '../../config/permissionMap'

const { data, loading, error, load } = useAdminRoles()
const ui = useAdminUiStore()

const fallbackRoleIcon = 'shield'
const fallbackAccountRoleIcon = 'user'
const adminColumns = [
  { key: 'account', label: 'Tài khoản', thClass: 'col-account', tdClass: 'col-account' },
  { key: 'role', label: 'Vai trò', thClass: 'col-role', tdClass: 'col-role' },
  { key: 'perms', label: 'Quyền', thClass: 'col-perms', tdClass: 'col-perms' },
  { key: 'createdAt', label: 'Ngày tạo', thClass: 'col-date', tdClass: 'col-date' },
  { key: 'statusLabel', label: 'Trạng thái', thClass: 'col-status', tdClass: 'col-status' },
  { key: 'actions', label: '', thClass: 'col-actions', tdClass: 'col-actions' },
]

function iconName(value, fallback) {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function accountStatusLabel(row) {
  if (row?.statusLabel) return row.statusLabel
  const status = String(row?.status || '').toUpperCase()
  if (['BANNED', 'BLOCKED', 'LOCKED'].includes(status)) return 'Đã khóa'
  return status || ''
}

async function deleteRole(role) {
  if (!role?.id) return
  if (role.system) {
    ui.showToast({ icon: 'x', title: 'Không thể xóa', subtitle: 'Vai trò hệ thống không thể xóa.' })
    return
  }
  try {
    await adminApi.deleteRole(role.id)
    ui.showToast({ icon: 'check', title: 'Đã xóa vai trò', subtitle: role.name })
    await load()
  } catch (e) {
    ui.showToast({ icon: 'x', title: 'Lỗi xóa vai trò', subtitle: e?.response?.data?.message || e.message })
  }
}

const deleteAdminTarget = ref(null)
const deletingAdmin = ref(false)

function requestDeleteAdmin(user) {
  deleteAdminTarget.value = user
}

function closeDeleteAdminDialog() {
  if (deletingAdmin.value) return
  deleteAdminTarget.value = null
}

async function confirmDeleteAdmin() {
  if (!deleteAdminTarget.value?.id || deletingAdmin.value) return
  deletingAdmin.value = true
  const adminAccount = deleteAdminTarget.value
  try {
    await adminApi.deleteAdminUser(adminAccount.id)
    deleteAdminTarget.value = null
    await load()
    ui.showToast({ icon: 'check', title: 'Đã thu hồi tài khoản', subtitle: adminAccount.email })
  } catch (e) {
    ui.showToast({
      icon: 'x',
      title: 'Lỗi thu hồi tài khoản',
      subtitle: e?.response?.data?.message || e.message || 'Vui lòng thử lại.'
    })
  } finally {
    deletingAdmin.value = false
  }
}
</script>

<template>
  <AdminPageHeader eyebrow="Bảo mật hệ thống" title-html="Vai trò <em>& Quyền hạn</em>" subtitle="Quản lý phân quyền động">
    <template #actions>
      <button type="button" class="btn-add" @click="ui.openModal('addRole')"><AppIcon name="plus" :size="15" />Tạo vai trò mới</button>
    </template>
  </AdminPageHeader>

  <div v-if="loading && !data" class="admin-detail-state">Đang tải vai trò...</div>
  <div v-else-if="error" class="admin-detail-state admin-detail-state--error">{{ error }}</div>

  <div v-if="data" class="roles-container">
    <div class="tcard roles-table-card">
      <div class="tcard-header">
        <div class="tcard-title"><AppIcon name="users" :size="17" />Tài khoản quản trị</div>
        <button type="button" class="btn-add" style="font-size:11px;padding:5px 10px" @click="ui.openModal('addAdmin')">
          <AppIcon name="plus" :size="13" />Cấp tài khoản
        </button>
      </div>
      <AdminDataTable
        table-class="full-table--admin-accounts"
        :columns="adminColumns"
        :rows="data.adminAccounts"
      >
        <template #cell-account="{ row }">
          <div class="flex-cell flex-cell--compact">
            <div class="av av-sm" :class="`av-${row.avTone}`">{{ row.av }}</div>
            <div class="cell-stack-compact">
              <div class="cell-name">{{ row.name }}</div>
              <div class="cell-sub" :title="row.email">{{ row.email }}</div>
            </div>
          </div>
        </template>
        <template #cell-role="{ row }">
          <span class="role-tag role-tag--sm" :class="row.tagClass"><AppIcon :name="iconName(row.roleIcon, fallbackAccountRoleIcon)" :size="11" />{{ row.role }}</span>
        </template>
        <template #cell-perms="{ row }">
          <div class="admin-perms-cell admin-perms-cell--compact" :title="row.perms.map((p) => getPermLabel(p)).join(', ')">
            <span v-for="p in row.perms" :key="p" class="perm-badge perm-badge--sm" :class="getPermClass(p)"><AppIcon :name="getPermission(p).icon" :size="10" />{{ getPermLabel(p) }}</span>
          </div>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="cell-muted">{{ formatDate(row.createdAt) || 'Chưa có dữ liệu' }}</span>
        </template>
        <template #cell-statusLabel="{ row }"><span class="badge badge--sm b-success">{{ accountStatusLabel(row) }}</span></template>
        <template #cell-actions="{ row }">
          <div class="row-actions row-actions--sm">
            <button type="button" class="ra-btn ra-btn--sm ra-edit" @click="ui.openModal('editUser', row)"><AppIcon name="edit" :size="12" /></button>
            <button type="button" class="ra-btn ra-btn--sm ra-del" @click="requestDeleteAdmin(row)"><AppIcon name="trash2" :size="12" /></button>
          </div>
        </template>
      </AdminDataTable>
    </div>

    <div class="tcard">
      <div class="tcard-header"><div class="tcard-title"><AppIcon name="lock" :size="17" />Nhóm vai trò (Role Groups)</div></div>
      <div class="role-card-grid">
        <div v-for="role in data.roles" :key="role.id" class="role-card">
          <div class="role-card-head">
            <span class="role-tag" :class="role.tagClass"><AppIcon :name="iconName(role.icon, fallbackRoleIcon)" :size="14" />{{ role.name }}</span>
            <div class="row-actions">
              <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editRole', role)"><AppIcon name="edit" :size="14" /></button>
              <button
                v-if="!role.system"
                type="button"
                class="ra-btn ra-del"
                @click="deleteRole(role)"
              >
                <AppIcon name="trash2" :size="14" />
              </button>
              <button
                v-else
                type="button"
                class="ra-btn ra-del"
                @click="ui.showToast({ icon: 'x', title: 'Không thể xóa', subtitle: 'Vai trò hệ thống không thể xóa.' })"
              >
                <AppIcon name="trash2" :size="14" />
              </button>
            </div>
          </div>
          <div class="role-perms-wrap">
            <span v-for="p in role.perms" :key="p" class="perm-badge" :class="getPermClass(p)"><AppIcon :name="getPermission(p).icon" :size="12" />{{ getPermLabel(p) }}</span>
          </div>
          <div class="role-user-count"><AppIcon name="users" :size="13" />{{ role.userCount }} tài khoản · {{ role.note }}</div>
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog
    :open="Boolean(deleteAdminTarget)"
    title="Thu hồi tài khoản quản trị?"
    :message="deleteAdminTarget ? `Bạn có chắc chắn muốn thu hồi (xóa) tài khoản quản trị ${deleteAdminTarget.email}?` : ''"
    confirm-label="Thu hồi"
    cancel-label="Hủy"
    :loading="deletingAdmin"
    danger
    @close="closeDeleteAdminDialog"
    @confirm="confirmDeleteAdmin"
  />
</template>

<style scoped>
.roles-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.role-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 16px;
}
.role-perms-wrap {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.admin-detail-state {
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  color: var(--text2);
}
.admin-detail-state--error {
  color: var(--red2);
}
</style>
