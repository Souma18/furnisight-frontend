<script setup>
import { computed, onMounted, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const data = ref(null)
const page = ref(1)

onMounted(async () => {
  const res = await adminApi.fetchInventory()
  data.value = res.data
})

const columns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Sản phẩm' },
  { key: 'category', label: 'Danh mục' },
  { key: 'stock', label: 'Tồn hiện tại' },
  { key: 'threshold', label: 'Ngưỡng cảnh báo' },
  { key: 'lastImport', label: 'Nhập gần nhất' },
  { key: 'exportMonth', label: 'Xuất T5' },
  { key: 'statusLabel', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động' },
]

const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }

const pagination = computed(() => ({
  info: 'Hiển thị <strong>1–10</strong> / 248 SKU',
  buttons: [
    { icon: 'chevronLeft', page: 1, disabled: true },
    { label: '1', page: 1, active: true },
    { label: '2', page: 2 },
    { icon: 'chevronRight', page: 2 },
  ],
}))
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Kho <em>hàng</em>" subtitle="8 sản phẩm cần bổ sung">
    <template #actions>
      <button type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo kho' })">
        <AppIcon name="download" :size="15" />Báo cáo
      </button>
      <button type="button" class="btn-add" @click="ui.openModal('stockIn')">
        <AppIcon name="plus" :size="15" />Nhập kho
      </button>
    </template>
  </AdminPageHeader>

  <template v-if="data">
    <AdminKpiGrid :kpis="data.kpis" compact />
    <AdminDataTable :columns="columns" :rows="data.items" :pagination="pagination" @page="page = $event">
      <template #cell-sku="{ row }">
        <code style="font-size:11px;color:var(--text3)">{{ row.sku }}</code>
      </template>
      <template #cell-name="{ row }">
        <span class="cell-name">{{ row.name }}</span>
      </template>
      <template #cell-stock="{ row }">
        <div class="stock-bar">
          <div class="stock-track">
            <div class="stock-fill" :class="row.stockClass" :style="{ width: `${row.stockPercent}%` }" />
          </div>
          <span class="stock-num">{{ row.stock }}</span>
        </div>
      </template>
      <template #cell-lastImport="{ row }">
        <span style="color:var(--text3)">{{ row.lastImport }}</span>
      </template>
      <template #cell-statusLabel="{ row }">
        <span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button
            type="button"
            class="ra-btn ra-edit"
            @click="ui.showToast({ icon: 'box', title: 'Nhập thêm hàng', subtitle: row.name })"
          >
            <AppIcon name="warehouse" :size="14" />
          </button>
        </div>
      </template>
    </AdminDataTable>
  </template>
</template>
