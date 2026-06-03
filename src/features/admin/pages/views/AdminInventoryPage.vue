<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const { reloadTick } = storeToRefs(ui)
const data = ref(null)
const page = ref(1)
const loading = ref(false)
const error = ref('')
const warningSettings = ref({ defaultThreshold: 5, variantThresholds: {} })
const savingThresholds = ref({})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [inventoryRes, settingsRes] = await Promise.all([
      adminApi.fetchInventory(),
      adminApi.fetchInventoryWarningSettings().catch(() => ({ data: warningSettings.value })),
    ])
    data.value = inventoryRes.data
    warningSettings.value = settingsRes.data ?? warningSettings.value
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Không tải được dữ liệu kho.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(reloadTick, load)

const columns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Sản phẩm' },
  { key: 'variantLabel', label: 'Variant' },
  { key: 'category', label: 'Danh mục' },
  { key: 'stock', label: 'Tồn hiện tại' },
  { key: 'threshold', label: 'Ngưỡng cảnh báo' },
  { key: 'lastImport', label: 'Nhập gần nhất' },
  { key: 'exportMonth', label: 'Xuất T5' },
  { key: 'statusLabel', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động' },
]

const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }

async function updateVariantThreshold(row, event) {
  const threshold = Math.max(1, Number(event.target.value) || warningSettings.value.defaultThreshold || 5)
  savingThresholds.value = { ...savingThresholds.value, [row.variantId]: true }
  try {
    await adminApi.updateInventoryWarningSettings({
      variantThresholds: { [row.variantId]: threshold },
    })
    ui.showToast({ icon: 'check', title: 'Đã cập nhật ngưỡng', subtitle: `${row.sku}: ${threshold}` })
    await load()
  } catch (e) {
    ui.showToast({ icon: 'x', title: 'Lỗi cập nhật ngưỡng', subtitle: e?.response?.data?.message || e.message })
  } finally {
    const next = { ...savingThresholds.value }
    delete next[row.variantId]
    savingThresholds.value = next
  }
}

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
  <AdminPageHeader
    eyebrow="Quản lý hệ thống"
    title-html="Kho <em>hàng</em>"
    :subtitle="data ? `${data.items?.length || 0} variant đang được theo dõi` : 'Theo dõi tồn kho theo variant'"
  >
    <template #actions>
      <button type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo kho' })">
        <AppIcon name="download" :size="15" />Báo cáo
      </button>
      <button type="button" class="btn-add" @click="ui.openModal('stockIn')">
        <AppIcon name="plus" :size="15" />Nhập kho
      </button>
    </template>
  </AdminPageHeader>

  <div v-if="loading && !data" class="admin-detail-state">Đang tải dữ liệu kho...</div>
  <div v-else-if="error" class="admin-detail-state admin-detail-state--error">{{ error }}</div>

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
      <template #cell-threshold="{ row }">
        <input
          class="inventory-threshold-input"
          type="number"
          min="1"
          :value="row.threshold"
          :disabled="savingThresholds[row.variantId]"
          @change="updateVariantThreshold(row, $event)"
        />
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
            @click="ui.openModal('stockIn', row)"
          >
            <AppIcon name="warehouse" :size="14" />
          </button>
        </div>
      </template>
    </AdminDataTable>
  </template>
</template>

<style scoped>
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
.inventory-threshold-input {
  width: 76px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--white);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  padding: 0 8px;
}
.inventory-threshold-input:focus {
  outline: none;
  border-color: var(--gold);
}
</style>
