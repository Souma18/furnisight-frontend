<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { PriceFormatter } from '@shared/lib/formatters'

const router = useRouter()
const { items, ui } = useAdminListPage(adminApi.fetchOrders.bind(adminApi))
const columns = [
  { key: 'id', label: 'Mã đơn' }, { key: 'customer', label: 'Khách hàng' }, { key: 'items', label: 'SP' },
  { key: 'total', label: 'Tổng tiền' }, { key: 'statusLabel', label: 'Trạng thái' }, { key: 'date', label: 'Ngày' }, { key: 'actions', label: 'Hành động' },
]
const badgeMap = { shipping: 'b-shipping', success: 'b-success', pending: 'b-pending', cancel: 'b-cancel' }
const formatPrice = PriceFormatter.format
function openDetail(row) {
  const orderCode = row.orderCode || row.id
  if (orderCode) router.push({ name: 'admin-order-detail', params: { orderCode } })
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Đơn <em>hàng</em>" subtitle="Theo dõi & cập nhật trạng thái" />
  <AdminDataTable :columns="columns" :rows="items">
    <template #cell-id="{ row }">
      <button type="button" class="admin-link-btn" @click="openDetail(row)">{{ row.id }}</button>
    </template>
    <template #cell-total="{ row }"><span style="font-weight:600;color:var(--gold)">{{ formatPrice(row.total) }}</span></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span></template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-view" @click="openDetail(row)"><AppIcon name="eye" :size="14" /></button>
        <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editOrder', row)"><AppIcon name="edit" :size="14" /></button>
      </div>
    </template>
  </AdminDataTable>
</template>

<style scoped>
.admin-link-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gold);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.admin-link-btn:hover { text-decoration: underline; }
</style>
