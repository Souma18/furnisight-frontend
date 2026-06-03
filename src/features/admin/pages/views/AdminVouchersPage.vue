<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'

const { items, search, load, ui } = useAdminListPage(adminApi.fetchVouchers.bind(adminApi))

const columns = [
  { key: 'code', label: 'Mã' },
  { key: 'name', label: 'Tên' },
  { key: 'discount', label: 'Giảm' },
  { key: 'minOrder', label: 'Đơn tối thiểu' },
  { key: 'endDate', label: 'Hết hạn' },
  { key: 'statusLabel', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động' },
]

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function discountLabel(row) {
  if (row.discountType === 'PERCENT') return `${row.discountValue}%`
  return formatMoney(row.discountValue)
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function statusClass(row) {
  if (row.statusLabel === 'Hết hạn') return 'b-pending'
  return row.active ? 'b-success' : 'b-cancel'
}

async function deleteVoucher(row) {
  if (!row?.id) return
  try {
    await adminApi.deleteVoucher(row.id)
    ui.showToast({ icon: 'check', title: 'Đã xóa voucher', subtitle: row.code })
    await load()
  } catch (e) {
    ui.showToast({ icon: 'x', title: 'Lỗi xóa voucher', subtitle: e?.response?.data?.message || e.message })
  }
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Voucher <em>khuyến mãi</em>" subtitle="Tạo và bật/tắt mã giảm giá">
    <template #actions>
      <button type="button" class="btn-add" @click="ui.openModal('addVoucher')">
        <AppIcon name="plus" :size="15" />Tạo voucher
      </button>
    </template>
  </AdminPageHeader>

  <AdminFilterBar v-model:search="search" placeholder="Tìm theo mã hoặc tên..." />
  <AdminDataTable :columns="columns" :rows="items">
    <template #cell-code="{ row }">
      <code style="font-size:11px;color:var(--text3)">{{ row.code }}</code>
    </template>
    <template #cell-discount="{ row }">
      <span style="font-weight:700;color:var(--gold)">{{ discountLabel(row) }}</span>
    </template>
    <template #cell-minOrder="{ row }">{{ formatMoney(row.minOrder) }}</template>
    <template #cell-endDate="{ row }">{{ formatDate(row.endDate) }}</template>
    <template #cell-statusLabel="{ row }">
      <span class="badge" :class="statusClass(row)">{{ row.statusLabel }}</span>
    </template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editVoucher', row)">
          <AppIcon name="edit" :size="14" />
        </button>
        <button type="button" class="ra-btn ra-del" @click="deleteVoucher(row)">
          <AppIcon name="trash" :size="14" />
        </button>
      </div>
    </template>
  </AdminDataTable>
</template>
