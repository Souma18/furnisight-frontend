<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const { reloadTick } = storeToRefs(ui)
const data = ref(null)
const loading = ref(false)
const error = ref('')
const savingThresholds = ref({})
const expandedProducts = ref(new Set())

async function load() {
  loading.value = true
  error.value = ''
  try {
    const inventoryRes = await adminApi.fetchInventory()
    data.value = inventoryRes.data
    // Auto-expand tất cả nhóm khi load lần đầu
    if (groupedProducts.value.length && expandedProducts.value.size === 0) {
      groupedProducts.value.forEach(g => expandedProducts.value.add(g.productId))
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Không tải được dữ liệu kho.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(reloadTick, load)

// Gom nhóm variant theo productId
const groupedProducts = computed(() => {
  if (!data.value?.items) return []
  const map = new Map()
  for (const item of data.value.items) {
    if (!map.has(item.productId)) {
      map.set(item.productId, {
        productId: item.productId,
        name: item.name,
        category: item.category,
        variants: [],
      })
    }
    map.get(item.productId).variants.push(item)
  }
  // Gắn thông tin tổng hợp cho mỗi nhóm
  return Array.from(map.values()).map(group => {
    const totalStock = group.variants.reduce((sum, v) => sum + v.stock, 0)
    const hasOut = group.variants.some(v => v.stock <= 0)
    const hasLow = group.variants.some(v => v.stock > 0 && v.stock <= v.threshold)
    const worstStatus = hasOut ? 'cancel' : hasLow ? 'low' : 'success'
    const worstLabel = hasOut ? 'Hết hàng' : hasLow ? 'Sắp hết' : 'Đủ hàng'
    return { ...group, totalStock, worstStatus, worstLabel }
  })
})

function toggleProduct(productId) {
  const next = new Set(expandedProducts.value)
  if (next.has(productId)) {
    next.delete(productId)
  } else {
    next.add(productId)
  }
  expandedProducts.value = next
}

function isExpanded(productId) {
  return expandedProducts.value.has(productId)
}

function expandAll() {
  expandedProducts.value = new Set(groupedProducts.value.map(g => g.productId))
}

function collapseAll() {
  expandedProducts.value = new Set()
}

const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }

async function updateVariantThreshold(row, event) {
  const threshold = Math.min(9999, Math.max(1, Number(event.target.value) || 5))
  savingThresholds.value = { ...savingThresholds.value, [row.variantId]: true }
  try {
    await adminApi.updateVariantLowStockThreshold(row.variantId, { lowStockThreshold: threshold })
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
</script>

<template>
  <AdminPageHeader
    eyebrow="Quản lý hệ thống"
    title-html="Kho <em>hàng</em>"
    :subtitle="data ? `${groupedProducts.length} sản phẩm · ${data.items?.length || 0} variant` : 'Theo dõi tồn kho theo sản phẩm'"
  >
    <template #actions>
      <button v-if="data" type="button" class="btn-ghost" @click="expandAll">
        <AppIcon name="chevronDown" :size="13" />Mở tất cả
      </button>
      <button v-if="data" type="button" class="btn-ghost" @click="collapseAll">
        <AppIcon name="chevronRight" :size="13" />Thu tất cả
      </button>
      <button type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo kho' })">
        <AppIcon name="download" :size="15" />Báo cáo
      </button>
      <button type="button" class="btn-add" @click="ui.openModal('stockIn')">
        <AppIcon name="plus" :size="15" />Nhập kho
      </button>
    </template>
  </AdminPageHeader>

  <AdminKpiGrid v-if="data" :kpis="data.kpis" compact />

  <div v-if="loading && !data" class="admin-detail-state">Đang tải dữ liệu kho...</div>
  <div v-else-if="error" class="admin-detail-state admin-detail-state--error">{{ error }}</div>

  <div v-if="data" class="inventory-groups">
    <div v-for="group in groupedProducts" :key="group.productId" class="inv-group">
      <!-- Group header — bấm để toggle -->
      <button type="button" class="inv-group-header" @click="toggleProduct(group.productId)">
        <span class="inv-group-toggle">
          <AppIcon :name="isExpanded(group.productId) ? 'chevronDown' : 'chevronRight'" :size="14" />
        </span>
        <span class="inv-group-name">{{ group.name }}</span>
        <span class="inv-group-cat">{{ group.category }}</span>
        <span class="inv-group-meta">
          <span class="inv-group-count">{{ group.variants.length }} variant</span>
          <span class="inv-group-stock">Tổng: <strong>{{ group.totalStock }}</strong></span>
          <span class="badge" :class="badgeMap[group.worstStatus]">{{ group.worstLabel }}</span>
        </span>
      </button>

      <!-- Variant rows — hiện khi expanded -->
      <div v-if="isExpanded(group.productId)" class="inv-variant-list">
        <div v-for="row in group.variants" :key="row.variantId" class="inv-variant-row">
          <span class="ivc ivc-sku">
            <code>{{ row.sku }}</code>
          </span>
          <span class="ivc ivc-label">{{ row.variantLabel }}</span>
          <span class="ivc ivc-stock">
            <div class="stock-bar">
              <div class="stock-track">
                <div class="stock-fill" :class="row.stockClass" :style="{ width: `${row.stockPercent}%` }" />
              </div>
              <span class="stock-num">{{ row.stock }}</span>
            </div>
          </span>
          <span class="ivc ivc-threshold">
            <label class="threshold-label">Ngưỡng</label>
            <input
              class="inventory-threshold-input"
              type="number"
              min="1"
              max="9999"
              :value="row.threshold"
              :disabled="savingThresholds[row.variantId]"
              @change="updateVariantThreshold(row, $event)"
            />
          </span>
          <span class="ivc ivc-import">
            <span style="color:var(--text3);font-size:11px">{{ row.lastImport || '—' }}</span>
          </span>
          <span class="ivc ivc-status">
            <span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span>
          </span>
          <span class="ivc ivc-actions">
            <button type="button" class="ra-btn ra-edit" @click="ui.openModal('stockIn', row)">
              <AppIcon name="warehouse" :size="14" />
            </button>
          </span>
        </div>
      </div>
    </div>

    <div v-if="groupedProducts.length === 0" class="admin-detail-state">
      Không có dữ liệu kho.
    </div>
  </div>
</template>

<style scoped>
.admin-detail-state {
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  color: var(--text2);
}
.admin-detail-state--error { color: var(--red2); }

/* Buttons */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--white);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

/* Group container */
.inventory-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.inv-group {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  overflow: hidden;
}

/* Group header */
.inv-group-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}
.inv-group-header:hover { background: var(--bg2, #faf9f6); }

.inv-group-toggle {
  color: var(--text3);
  flex-shrink: 0;
}
.inv-group-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inv-group-cat {
  font-size: 11px;
  color: var(--text3);
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 20px;
  white-space: nowrap;
}
.inv-group-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.inv-group-count { font-size: 11.5px; color: var(--text3); }
.inv-group-stock { font-size: 12px; color: var(--text2); }
.inv-group-stock strong { color: var(--text); }

/* Variant rows */
.inv-variant-list {
  border-top: 1px solid var(--border);
}
.inv-variant-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 16px 9px 42px;
  border-bottom: 1px solid var(--border);
  background: var(--bg2, #faf9f6);
  transition: background .12s;
}
.inv-variant-row:last-child { border-bottom: none; }
.inv-variant-row:hover { background: #f3f1ec; }

.ivc { display: flex; align-items: center; }
.ivc-sku  { width: 120px; flex-shrink: 0; }
.ivc-sku code { font-size: 11px; color: var(--text3); }
.ivc-label { flex: 1; font-size: 12.5px; color: var(--text2); }
.ivc-stock { width: 130px; flex-shrink: 0; }
.ivc-threshold { width: 110px; flex-shrink: 0; gap: 6px; }
.ivc-import { width: 100px; flex-shrink: 0; }
.ivc-status { width: 80px; flex-shrink: 0; }
.ivc-actions { flex-shrink: 0; }

.threshold-label { font-size: 10px; color: var(--text3); white-space: nowrap; }

/* Stock bar */
.stock-bar { display: flex; align-items: center; gap: 8px; }
.stock-track {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 99px;
  overflow: hidden;
}
.stock-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--green, #4caf50);
  transition: width .3s;
}
.stock-fill.low { background: var(--gold, #b8860b); }
.stock-fill.cancel { background: var(--red, #e53935); }
.stock-num { font-size: 12px; font-weight: 600; color: var(--text); min-width: 24px; text-align: right; }

/* Threshold input */
.inventory-threshold-input {
  width: 60px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--white);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  padding: 0 6px;
}
.inventory-threshold-input:focus { outline: none; border-color: var(--gold); }

/* Badges */
.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.b-success { background: #e8f5e9; color: #2e7d32; }
.b-low     { background: #fff8e1; color: #b8860b; }
.b-cancel  { background: #ffebee; color: #c62828; }

/* Action button */
.ra-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid var(--border); border-radius: 6px; background: var(--white); cursor: pointer; transition: border-color .15s, color .15s; }
.ra-edit { color: var(--text3); }
.ra-edit:hover { border-color: var(--gold); color: var(--gold); }
</style>
