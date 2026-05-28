<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { fetchAdminUsersMock } from '../../api/adminMockApi'
import { useAdminListPage } from '../../composables/useAdminListPage'

const { items, search, ui } = useAdminListPage(fetchAdminUsersMock)
const columns = [
  { key: 'id', label: '#' }, { key: 'name', label: 'Người dùng' }, { key: 'email', label: 'Email' },
  { key: 'phone', label: 'SĐT' }, { key: 'role', label: 'Vai trò' }, { key: 'orders', label: 'Đơn hàng' },
  { key: 'statusLabel', label: 'Trạng thái' }, { key: 'createdAt', label: 'Ngày tạo' }, { key: 'actions', label: 'Hành động' },
]
const pagination = { info: 'Hiển thị <strong>1–10</strong> / 1.243 người dùng', buttons: [{ label: '1', active: true }, { label: '2' }, { label: '3' }] }
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Người <em>dùng</em>" subtitle="1.243 tài khoản đã đăng ký">
    <template #actions>
      <button type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất danh sách' })"><AppIcon name="download" :size="15" />Xuất Excel</button>
      <button type="button" class="btn-add" @click="ui.openModal('addUser')"><AppIcon name="plus" :size="15" />Thêm người dùng</button>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" placeholder="Tìm theo tên, email, SĐT..." />
  <AdminDataTable :columns="columns" :rows="items" :pagination="pagination">
    <template #cell-name="{ row }"><div class="flex-cell"><div class="av" :class="`av-${row.avTone}`">{{ row.av }}</div><div class="cell-name">{{ row.name }}</div></div></template>
    <template #cell-role="{ row }"><span class="badge" :class="row.role === 'Admin' ? 'b-gold' : 'b-navy'">{{ row.role }}</span></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="row.status === 'active' ? 'b-success' : 'b-cancel'">{{ row.statusLabel }}</span></template>
    <template #cell-actions>
      <div class="row-actions">
        <button type="button" class="ra-btn ra-view"><AppIcon name="eye" :size="14" /></button>
        <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editUser')"><AppIcon name="edit" :size="14" /></button>
        <button type="button" class="ra-btn ra-lock"><AppIcon name="lock" :size="14" /></button>
      </div>
    </template>
  </AdminDataTable>
</template>
