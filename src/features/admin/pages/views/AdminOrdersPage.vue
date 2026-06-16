<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { PriceFormatter } from '@shared/lib/formatters'
import {
  applyOrderStatusMapping,
  canUpdateOrderStatus,
} from '@shared/lib/orders/orderStatusMapper'

const router = useRouter()
const statusFilter = ref('')
const dateFilter = ref('')
const { items, search, ui } = useAdminListPage((params) => adminApi.fetchOrders({ ...params, size: 500 }))
const columns = [
  { key: 'id', label: 'Mã đơn' }, { key: 'customer', label: 'Khách hàng' }, { key: 'items', label: 'SP' },
  { key: 'total', label: 'Tổng tiền' }, { key: 'statusLabel', label: 'Trạng thái' }, { key: 'date', label: 'Ngày' }, { key: 'actions', label: 'Hành động' },
]
const badgeMap = {
  unpaid: 'b-pending',
  payment_failed: 'b-cancel',
  paid: 'b-success',
  cod_pending_confirmation: 'b-pending',
  cod_confirmed: 'b-success',
  in_transit: 'b-shipping',
  delivering: 'b-shipping',
  done: 'b-success',
  cancel: 'b-cancel',
  refund_pending: 'b-pending',
  refunded: 'b-success',
  shipping: 'b-shipping',
  success: 'b-success',
  pending: 'b-pending',
}
const formatPrice = PriceFormatter.format
const normalizedOrders = computed(() => items.value.map((item) => applyOrderStatusMapping(item)))
const statusOptions = computed(() => {
  const labels = new Set()
  normalizedOrders.value.forEach((item) => {
    if (item.statusLabel) labels.add(item.statusLabel)
  })
  return Array.from(labels)
})
const filteredOrders = computed(() => {
  const keyword = normalizeSearch(search.value)
  return normalizedOrders.value.filter((row) => {
    const matchesSearch = !keyword || [
      row.id,
      row.orderCode,
      row.customer,
      row.customerName,
    ].some((value) => normalizeSearch(value).includes(keyword))
    const matchesStatus = !statusFilter.value || row.statusLabel === statusFilter.value
    const matchesDate = !dateFilter.value || toInputDate(row.date) === dateFilter.value

    return matchesSearch && matchesStatus && matchesDate
  })
})
const hasActiveFilters = computed(() => Boolean(search.value || statusFilter.value || dateFilter.value))

function openDetail(row) {
  const orderCode = row.orderCode || row.id
  if (orderCode) router.push({ name: 'admin-order-detail', params: { orderCode } })
}

function canUpdateStatus(row) {
  return canUpdateOrderStatus(row)
}

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toInputDate(value) {
  if (!value) return ''
  const text = String(value).trim()
  const viMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (viMatch) {
    const [, day, month, year] = viMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function resetFilters() {
  search.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Đơn <em>hàng</em>" subtitle="Theo dõi & cập nhật trạng thái" />
  <AdminFilterBar v-model:search="search" placeholder="Tìm theo mã đơn hoặc tên khách hàng...">
    <select v-model="statusFilter" class="filter-select" aria-label="Lọc theo trạng thái">
      <option value="">Tất cả trạng thái</option>
      <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
    </select>
    <input v-model="dateFilter" class="filter-select filter-date" type="date" aria-label="Lọc theo ngày" />
    <button v-if="hasActiveFilters" type="button" class="filter-reset" @click="resetFilters">
      <AppIcon name="refresh" :size="14" />
      Xóa lọc
    </button>
  </AdminFilterBar>
  <AdminDataTable :columns="columns" :rows="filteredOrders">
    <template #cell-id="{ row }">
      <button type="button" class="admin-link-btn" @click="openDetail(row)">{{ row.id }}</button>
    </template>
    <template #cell-total="{ row }"><span style="font-weight:600;color:var(--gold)">{{ formatPrice(row.total) }}</span></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span></template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-view" @click="openDetail(row)"><AppIcon name="eye" :size="14" /></button>
        <button
          v-if="canUpdateStatus(row)"
          type="button"
          class="ra-btn ra-edit"
          title="Cập nhật trạng thái"
          @click="ui.openModal('editOrder', row)"
        >
          <AppIcon name="edit" :size="14" />
        </button>
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
.filter-date {
  min-width: 158px;
}
.filter-reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  background: var(--white);
  color: var(--text2);
  font-family: var(--sans);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}
.filter-reset:hover {
  border-color: var(--gold);
  color: var(--gold);
}
</style>
