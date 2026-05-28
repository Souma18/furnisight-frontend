<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { useAdminRoles } from '../../composables/useAdminRoles'
import { useAdminUiStore } from '../../store/adminUiStore'

const { data } = useAdminRoles()
const ui = useAdminUiStore()

const permClass = { view: 'p-view', create: 'p-create', edit: 'p-edit', delete: 'p-delete', config: 'p-edit' }
const permLabels = { view: 'Xem', create: 'Tạo', edit: 'Sửa', delete: 'Xóa', config: 'Cấu hình' }
const adminColumns = [
  { key: 'account', label: 'Tài khoản', thClass: 'col-account', tdClass: 'col-account' },
  { key: 'role', label: 'Vai trò', thClass: 'col-role', tdClass: 'col-role' },
  { key: 'perms', label: 'Quyền', thClass: 'col-perms', tdClass: 'col-perms' },
  { key: 'createdAt', label: 'Ngày tạo', thClass: 'col-date', tdClass: 'col-date' },
  { key: 'statusLabel', label: 'Trạng thái', thClass: 'col-status', tdClass: 'col-status' },
  { key: 'actions', label: '', thClass: 'col-actions', tdClass: 'col-actions' },
]
</script>

<template>
  <AdminPageHeader eyebrow="Bảo mật hệ thống" title-html="Vai trò <em>& Quyền hạn</em>" subtitle="Quản lý phân quyền động">
    <template #actions>
      <button type="button" class="btn-add" @click="ui.openModal('addRole')"><AppIcon name="plus" :size="15" />Tạo vai trò mới</button>
    </template>
  </AdminPageHeader>

  <div v-if="data" class="roles-grid">
    <div class="tcard">
      <div class="tcard-header"><div class="tcard-title"><AppIcon name="lock" :size="17" />Nhóm vai trò (Role Groups)</div></div>
      <div class="role-card-list">
        <div v-for="role in data.roles" :key="role.id" class="role-card">
          <div class="role-card-head">
            <span class="role-tag" :class="role.tagClass"><AppIcon :name="role.icon" :size="14" />{{ role.name }}</span>
            <div class="row-actions">
              <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editRole', role)"><AppIcon name="edit" :size="14" /></button>
              <button
                v-if="!role.system"
                type="button"
                class="ra-btn ra-del"
                @click="ui.showToast({ icon: 'x', title: 'Đã xóa vai trò' })"
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
            <span v-for="p in role.perms" :key="p" class="perm-badge" :class="permClass[p]">{{ permLabels[p] || p }}</span>
          </div>
          <div class="role-user-count"><AppIcon name="users" :size="13" />{{ role.userCount }} tài khoản · {{ role.note }}</div>
        </div>
      </div>
    </div>

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
          <span class="role-tag role-tag--sm" :class="row.tagClass"><AppIcon :name="row.roleIcon" :size="11" />{{ row.role }}</span>
        </template>
        <template #cell-perms="{ row }">
          <div class="admin-perms-cell admin-perms-cell--compact" :title="row.perms.map((p) => permLabels[p] || p).join(', ')">
            <span v-for="p in row.perms" :key="p" class="perm-badge perm-badge--sm" :class="permClass[p]">{{ permLabels[p] || p }}</span>
          </div>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="cell-muted">{{ row.createdAt }}</span>
        </template>
        <template #cell-statusLabel="{ row }"><span class="badge badge--sm b-success">{{ row.statusLabel }}</span></template>
        <template #cell-actions>
          <div class="row-actions row-actions--sm">
            <button type="button" class="ra-btn ra-btn--sm ra-edit"><AppIcon name="edit" :size="12" /></button>
            <button type="button" class="ra-btn ra-btn--sm ra-del" @click="ui.showToast({ icon: 'trash2', title: 'Đã thu hồi tài khoản' })"><AppIcon name="trash2" :size="12" /></button>
          </div>
        </template>
      </AdminDataTable>
    </div>
  </div>

  <div v-if="data" class="tcard">
    <div class="tcard-header"><div class="tcard-title"><AppIcon name="list" :size="17" />Ma trận quyền hạn chi tiết</div></div>
    <div class="perm-matrix-wrap">
      <div class="perm-matrix">
        <div class="perm-matrix-head perm-matrix-feature">Chức năng</div>
        <div class="perm-matrix-head perm-matrix-col">Super Admin</div>
        <div class="perm-matrix-head perm-matrix-col">Manager</div>
        <div class="perm-matrix-head perm-matrix-col">Staff</div>
        <template v-for="row in data.matrix" :key="row.feature">
          <div class="perm-matrix-cell perm-matrix-feature">{{ row.feature }}</div>
          <div class="perm-matrix-cell">{{ row.super }}</div>
          <div class="perm-matrix-cell">{{ row.manager }}</div>
          <div class="perm-matrix-cell">{{ row.staff }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-perms-wrap {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.perm-matrix-wrap {
  padding: 16px 20px;
  overflow-x: auto;
}
.perm-matrix {
  display: grid;
  grid-template-columns: 1fr repeat(3, 140px);
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  min-width: 520px;
}
.perm-matrix-head {
  padding: 10px 14px;
  background: var(--navy);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.perm-matrix-head.perm-matrix-feature {
  color: rgba(255, 255, 255, 0.6);
}
.perm-matrix-head.perm-matrix-col {
  text-align: center;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--gold3);
}
.perm-matrix-head.perm-matrix-col:nth-child(3) {
  color: #93c5fd;
}
.perm-matrix-head.perm-matrix-col:nth-child(4) {
  color: #86efac;
}
.perm-matrix-cell {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  text-align: center;
}
.perm-matrix-cell.perm-matrix-feature {
  font-size: 13px;
  text-align: left;
}
</style>
