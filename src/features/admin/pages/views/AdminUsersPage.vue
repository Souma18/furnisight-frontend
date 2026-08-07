<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { accountRoleNames, isAdminAccount } from '../../utils/adminAccountRoles'
import { formatDateTime } from '@shared/lib/formatters'

const { items, search, load, ui } = useAdminListPage((params) => adminApi.fetchAdminUsers({ ...params, isAdmin: false }))
const userRows = computed(() => items.value
  .map((item, index) => ({ ...normalizeUserRow(item), stt: index + 1 })))
const statusTarget = ref(null)
const updatingStatus = ref(false)
const deleteTarget = ref(null)
const deletingUser = ref(false)
const columns = [
  { key: 'stt', label: 'STT' }, { key: 'name', label: 'Người dùng' }, { key: 'email', label: 'Email' },
  { key: 'statusLabel', label: 'Trạng thái' }, { key: 'createdAt', label: 'Ngày tạo' }, { key: 'actions', label: 'Hành động' },
]

function isBlocked(user) {
  return ['blocked', 'banned', 'locked'].includes(String(user?.status || '').toLowerCase())
}

function userStatusLabel(user) {
  if (user?.statusLabel) return user.statusLabel
  return isBlocked(user) ? 'Đã khóa' : String(user?.status || '')
}

function normalizeUserRow(user = {}) {
  const roleNames = accountRoleNames(user)
  return {
    ...user,
    name: user.name || user.fullName || user.username || user.email,
    role: user.role || roleNames[0] || '',
    orders: user.orders ?? user.orderCount ?? '',
    avTone: user.avTone || 'blue',
    av: user.av || String(user.name || user.username || user.email || 'U').slice(0, 1).toUpperCase(),
    createdAt: user.createdAt ? formatDateTime(user.createdAt) : '',
  }
}

function requestStatusChange(user) {
  statusTarget.value = user
}

function closeStatusDialog() {
  if (updatingStatus.value) return
  statusTarget.value = null
}

async function confirmStatusChange() {
  if (!statusTarget.value?.id || updatingStatus.value) return

  const user = statusTarget.value
  const unlocking = isBlocked(user)
  updatingStatus.value = true

  try {
    const response = await adminApi.updateAdminUserStatus(user.id, unlocking ? 'ACTIVE' : 'BANNED')
    if (response?.data?.success === false) {
      throw new Error(response.data.message || 'Không thể cập nhật trạng thái tài khoản.')
    }

    statusTarget.value = null
    await load()
    ui.showToast({
      icon: unlocking ? 'refresh' : 'lock',
      title: unlocking ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
      subtitle: user.email,
    })
  } catch (error) {
    ui.showToast({
      icon: 'alert',
      title: unlocking ? 'Không thể mở khóa' : 'Không thể khóa tài khoản',
      subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại.',
    })
  } finally {
    updatingStatus.value = false
  }
}

function requestDeleteUser(user) {
  deleteTarget.value = user
}

function closeDeleteDialog() {
  if (deletingUser.value) return
  deleteTarget.value = null
}

async function confirmDeleteUser() {
  if (!deleteTarget.value?.id || deletingUser.value) return
  deletingUser.value = true
  const user = deleteTarget.value
  try {
    const response = await adminApi.deleteAdminUser(user.id)
    if (response?.data?.success === false) {
      throw new Error(response.data.message || 'Không thể xóa tài khoản.')
    }
    deleteTarget.value = null
    await load()
    ui.showToast({ icon: 'check', title: 'Đã xóa tài khoản', subtitle: user.email })
  } catch (error) {
    ui.showToast({
      icon: 'alert',
      title: 'Không thể xóa tài khoản',
      subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại.',
    })
  } finally {
    deletingUser.value = false
  }
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Người <em>dùng</em>" subtitle="1.243 tài khoản đã đăng ký">
    <template #actions>
      <AppButton variant="unstyled" type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất danh sách' })"><AppIcon name="download" :size="15" />Xuất Excel</AppButton>
      <AppButton variant="unstyled" type="button" class="btn-add" @click="ui.openModal('addUser')"><AppIcon name="plus" :size="15" />Thêm người dùng</AppButton>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" placeholder="Tìm theo tên hoặc email..." />
  <AdminDataTable :columns="columns" :rows="userRows">
    <template #cell-name="{ row }"><div class="flex-cell"><div class="av" :class="`av-${row.avTone}`">{{ row.av }}</div><div class="cell-name">{{ row.name }}</div></div></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="isBlocked(row) ? 'b-cancel' : 'b-success'">{{ userStatusLabel(row) }}</span></template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <AppButton variant="unstyled" type="button" class="ra-btn ra-view" title="Xem người dùng" @click="ui.openModal('viewUser', row)"><AppIcon name="eye" :size="14" /></AppButton>
        <AppButton variant="unstyled" type="button" class="ra-btn ra-edit" @click="ui.openModal('editUser', row)"><AppIcon name="edit" :size="14" /></AppButton>
        <AppButton variant="unstyled"
          type="button"
          class="ra-btn ra-lock"
          :title="isBlocked(row) ? 'Mở khóa tài khoản' : 'Khóa tài khoản'"
          @click="requestStatusChange(row)"
        >
          <AppIcon :name="isBlocked(row) ? 'refresh' : 'lock'" :size="14" />
        </AppButton>
        <AppButton variant="unstyled" type="button" class="ra-btn ra-del" title="Xóa tài khoản" @click="requestDeleteUser(row)"><AppIcon name="trash2" :size="14" /></AppButton>
      </div>
    </template>
  </AdminDataTable>

  <ConfirmDialog
    :open="Boolean(statusTarget)"
    :title="statusTarget && isBlocked(statusTarget) ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'"
    :message="statusTarget
      ? `${isBlocked(statusTarget) ? 'Mở khóa' : 'Khóa'} tài khoản ${statusTarget.email}?`
      : ''"
    :confirm-label="statusTarget && isBlocked(statusTarget) ? 'Mở khóa' : 'Khóa tài khoản'"
    cancel-label="Hủy"
    :loading="updatingStatus"
    :danger="Boolean(statusTarget && !isBlocked(statusTarget))"
    @close="closeStatusDialog"
    @confirm="confirmStatusChange"
  />

  <ConfirmDialog
    :open="Boolean(deleteTarget)"
    title="Xóa tài khoản người dùng?"
    :message="deleteTarget ? `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng ${deleteTarget.email}? Hành động này không thể hoàn tác.` : ''"
    confirm-label="Xóa tài khoản"
    cancel-label="Hủy"
    :loading="deletingUser"
    danger
    @close="closeDeleteDialog"
    @confirm="confirmDeleteUser"
  />
</template>
