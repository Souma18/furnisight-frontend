<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import AdminPagination from '../../components/shared/AdminPagination.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { PriceFormatter, formatDate } from '@shared/lib/formatters'
import {
  applyOrderStatusMapping,
  canCancelOrder,
  canUpdateOrderStatus,
} from '@shared/lib/orders/orderStatusMapper'

const router = useRouter()
const statusFilter = ref('')
const dateFilter = ref('')
const { items, search, load, ui, buildPagination } = useAdminListPage((params) => adminApi.fetchOrders({ ...params, size: 500 }))
const columns = [
  { key: 'orderCode', label: 'Mã đơn' }, { key: 'customer', label: 'Khách hàng' }, { key: 'items', label: 'SP' },
  { key: 'total', label: 'Tổng tiền' }, { key: 'statusLabel', label: 'Trạng thái' }, { key: 'date', label: 'Ngày' }, { key: 'actions', label: 'Hành động' },
]
const badgeMap = {
  unpaid: 'b-pending',
  payment_failed: 'b-cancel',
  paid: 'b-success',
  shipping: 'b-shipping',
  in_transit: 'b-shipping',
  delivered: 'b-success',
  cancelled: 'b-cancel',
  refund_pending: 'b-pending',
  refunded: 'b-success',
}
const formatPrice = PriceFormatter.format
const normalizedOrders = computed(() => items.value.map((item) => {
  const mapped = applyOrderStatusMapping(item)
  return {
    ...mapped,
    total: mapped.totalAmount,
    date: formatDate(mapped.createdAt),
    rawDate: mapped.createdAt,
    items: mapped.itemCount,
  }
}))
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
      row.orderCode,
      row.customer,
      row.customerName,
    ].some((value) => normalizeSearch(value).includes(keyword))
    const matchesStatus = !statusFilter.value || row.statusLabel === statusFilter.value
    const matchesDate = !dateFilter.value || toInputDate(row.rawDate) === dateFilter.value

    return matchesSearch && matchesStatus && matchesDate
  })
})
const hasActiveFilters = computed(() => Boolean(search.value || statusFilter.value || dateFilter.value))

const orderCurrentPage = ref(1)
const orderPageSize = 24

const paginatedOrders = computed(() => {
  const start = (orderCurrentPage.value - 1) * orderPageSize
  return filteredOrders.value.slice(start, start + orderPageSize)
})

const orderPagination = computed(() => {
  const totalElements = filteredOrders.value.length
  const totalPages = Math.ceil(totalElements / orderPageSize)
  return buildPagination(orderCurrentPage.value - 1, totalPages, totalElements)
})

function openDetail(row) {
  const orderCode = row.orderCode
  if (orderCode) router.push({ name: 'admin-order-detail', params: { orderCode } })
}

function canUpdateStatus(row) {
  return canUpdateOrderStatus(row)
}

const cancelTarget = ref(null)
const isCanceling = ref(false)

function promptCancelOrder(row) {
  cancelTarget.value = row
}

async function confirmCancelOrder() {
  const row = cancelTarget.value
  if (!row) return
  const orderCode = row.orderCode
  if (!orderCode || !canCancelOrder(row)) return

  isCanceling.value = true
  try {
    await adminApi.updateOrder(orderCode, {
      status: 'CANCELLED',
      note: 'Admin hủy đơn',
    })
    ui.showToast({
      icon: 'check',
      title: 'Đã hủy đơn',
      subtitle: 'Đơn hàng đã được cập nhật và tồn kho sẽ được hoàn lại.',
    })
    await load()
    cancelTarget.value = null
  } catch (error) {
    ui.showToast({
      icon: 'x',
      title: 'Không thể hủy đơn',
      subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại sau.',
    })
  } finally {
    isCanceling.value = false
  }
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

watch([search, statusFilter, dateFilter], () => {
  orderCurrentPage.value = 1
})

function resetFilters() {
  search.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
  orderCurrentPage.value = 1
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
    <AppButton variant="unstyled" v-if="hasActiveFilters" type="button" class="filter-reset" @click="resetFilters">
      <AppIcon name="refresh" :size="14" />
      Xóa lọc
    </AppButton>
  </AdminFilterBar>
  <AdminDataTable :columns="columns" :rows="paginatedOrders">
    <template #cell-orderCode="{ row }">
      <AppButton variant="unstyled" type="button" class="admin-link-btn" :disabled="!row.orderCode" @click="openDetail(row)">{{ row.orderCode || 'Chưa có mã đơn' }}</AppButton>
    </template>
    <template #cell-total="{ row }"><span style="font-weight:600;color:var(--gold)">{{ formatPrice(row.total) }}</span></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span></template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <AppButton variant="unstyled" type="button" class="ra-btn ra-view" @click="openDetail(row)"><AppIcon name="eye" :size="14" /></AppButton>
        <AppButton variant="unstyled"
          v-if="canUpdateStatus(row)"
          type="button"
          class="ra-btn ra-edit"
          title="Cập nhật trạng thái"
          @click="ui.openModal('editOrder', row)"
        >
          <AppIcon name="edit" :size="14" />
        </AppButton>
        <AppButton variant="unstyled"
          v-if="canCancelOrder(row)"
          type="button"
          class="ra-btn ra-cancel"
          title="Hủy đơn"
          @click="promptCancelOrder(row)"
        >
          <AppIcon name="ban" :size="14" />
        </AppButton>
      </div>
    </template>
  </AdminDataTable>
  
  <AdminPagination :info="orderPagination.info" :buttons="orderPagination.buttons" @page="orderCurrentPage = $event" />

  <ConfirmDialog
    :open="!!cancelTarget"
    :title="`Hủy đơn ${cancelTarget?.orderCode || cancelTarget?.id}?`"
    message="Hàng trong đơn sẽ được trả lại kho."
    :loading="isCanceling"
    danger
    @close="cancelTarget = null"
    @confirm="confirmCancelOrder"
  />
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
.ra-cancel {
  color: var(--red2);
}
.ra-cancel:hover {
  border-color: var(--red);
  color: var(--red2);
}
</style>
