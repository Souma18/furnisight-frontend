<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { fetchOrdersMock } from '../../api/adminMockApi'
import { useAdminListPage } from '../../composables/useAdminListPage'

const { items, ui } = useAdminListPage(fetchOrdersMock)
const columns = [
  { key: 'id', label: 'Mã đơn' }, { key: 'customer', label: 'Khách hàng' }, { key: 'items', label: 'SP' },
  { key: 'total', label: 'Tổng tiền' }, { key: 'statusLabel', label: 'Trạng thái' }, { key: 'date', label: 'Ngày' }, { key: 'actions', label: 'Hành động' },
]
const badgeMap = { shipping: 'b-shipping', success: 'b-success', pending: 'b-pending', cancel: 'b-cancel' }
function formatPrice(v) { return `${Number(v).toLocaleString('vi-VN')}₫` }
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Đơn <em>hàng</em>" subtitle="Theo dõi & cập nhật trạng thái" />
  <AdminDataTable :columns="columns" :rows="items">
    <template #cell-total="{ row }"><span style="font-weight:600;color:var(--gold)">{{ formatPrice(row.total) }}</span></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span></template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editOrder', row)"><AppIcon name="edit" :size="14" /></button>
      </div>
    </template>
  </AdminDataTable>
</template>
