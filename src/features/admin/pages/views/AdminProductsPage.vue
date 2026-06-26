<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { PriceFormatter } from '@shared/lib/formatters'
import { buildProductPayload, mapProductToForm } from '../../composables/useAdminProductForm'

const { items, search, load, ui } = useAdminListPage(adminApi.fetchProducts.bind(adminApi))
const deleteTarget = ref(null)
const deleting = ref(false)
const statusTarget = ref(null)
const updatingStatus = ref(false)
const formatPrice = PriceFormatter.format
const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }
const columns = [
  { key: 'stt', label: 'STT' },
  { key: 'name', label: 'Sản phẩm' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Danh mục' },
  { key: 'price', label: 'Giá' },
  { key: 'stock', label: 'Tồn kho' },
  { key: 'statusLabel', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động' },
]

const productRows = computed(() => items.value.map((item, index) => ({
  ...item,
  stt: index + 1,
  variantCount: Array.isArray(item.variants) ? item.variants.length : Number(item.variantCount || 0),
})))

function isInactiveProduct(product) {
  return String(product?.status || '').toUpperCase() === 'INACTIVE'
    || String(product?.statusLabel || '').toLowerCase().includes('ngừng')
}

function requestDelete(row) {
  deleteTarget.value = row
}

function requestStatusChange(row) {
  statusTarget.value = row
}

async function requestEdit(row) {
  if (!row?.id) return
  try {
    const response = await adminApi.fetchProduct(row.id)
    const productDetail = response?.data ?? response ?? row
    ui.openModal('editProd', productDetail)
  } catch {
    ui.openModal('editProd', row)
  }
}

async function requestView(row) {
  await requestEdit(row)
}

function closeDeleteDialog() {
  if (deleting.value) return
  deleteTarget.value = null
}

function closeStatusDialog() {
  if (updatingStatus.value) return
  statusTarget.value = null
}

async function confirmDelete() {
  const product = deleteTarget.value
  if (!product?.id || deleting.value) return

  deleting.value = true
  try {
    const response = await adminApi.deleteProduct(product.id)
    if (response?.data?.success === false) {
      throw new Error(response.data.message || 'Không thể xóa sản phẩm.')
    }

    deleteTarget.value = null
    await load()
    ui.showToast({
      icon: 'check',
      title: 'Đã xóa sản phẩm',
      subtitle: product.name,
    })
  } catch (error) {
    ui.showToast({
      icon: 'alert',
      title: 'Không thể xóa sản phẩm',
      subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại.',
    })
  } finally {
    deleting.value = false
  }
}

async function confirmStatusChange() {
  const product = statusTarget.value
  if (!product?.id || updatingStatus.value) return

  const nextInactive = !isInactiveProduct(product)
  updatingStatus.value = true
  try {
    const response = await adminApi.fetchProduct(product.id)
    const detail = response?.data ?? response
    const form = mapProductToForm(detail)
    form.status = nextInactive ? 'Ngừng bán' : 'Còn hàng'
    const payload = buildProductPayload(form)
    const updateResponse = await adminApi.updateProduct(product.id, payload)
    if (updateResponse?.data?.success === false) {
      throw new Error(updateResponse.data.message || 'Không thể cập nhật trạng thái sản phẩm.')
    }

    statusTarget.value = null
    await load()
    ui.showToast({
      icon: nextInactive ? 'ban' : 'refresh',
      title: nextInactive ? 'Đã ngừng bán sản phẩm' : 'Đã mở bán lại sản phẩm',
      subtitle: product.name,
    })
  } catch (error) {
    ui.showToast({
      icon: 'alert',
      title: nextInactive ? 'Không thể ngừng bán' : 'Không thể mở bán lại',
      subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại.',
    })
  } finally {
    updatingStatus.value = false
  }
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Sản <em>phẩm</em>" subtitle="Quản lý catalog & model 3D">
    <template #actions>
      <button type="button" class="btn-add" @click="ui.openModal('addProd')"><AppIcon name="plus" :size="15" />Thêm sản phẩm</button>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" placeholder="Tìm sản phẩm theo tên hoặc SKU..." />

  <AdminDataTable :columns="columns" :rows="productRows">
    <template #cell-name="{ row }">
      <div class="flex-cell">
        <span class="product-thumb">
          <img v-if="row.imageUrls?.[0]" :src="row.imageUrls[0]" alt="" />
          <AppIcon v-else name="box" :size="18" />
        </span>
        <div>
          <div class="cell-name">{{ row.name || 'Sản phẩm không tên' }}</div>
          <div class="cell-sub">
            {{ row.variantCount > 0 ? `${row.variantCount} biến thể` : 'Chưa có biến thể' }}
          </div>
        </div>
      </div>
    </template>

    <template #cell-sku="{ row }">
      <code class="product-code">{{ row.sku || 'N/A' }}</code>
    </template>

    <template #cell-category="{ row }">
      <span>{{ row.category || 'Không phân loại' }}</span>
    </template>

    <template #cell-price="{ row }">
      <strong class="product-price">{{ formatPrice(row.price) }}</strong>
    </template>

    <template #cell-stock="{ row }">
      <span :class="{ 'stock-low': Number(row.stock || 0) <= 0 }">{{ row.stock || 0 }}</span>
    </template>

    <template #cell-statusLabel="{ row }">
      <span class="badge" :class="badgeMap[row.status] || (isInactiveProduct(row) ? 'b-cancel' : 'b-success')">
        {{ row.statusLabel }}
      </span>
    </template>

    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-view" title="Xem chi tiết" @click="requestView(row)">
          <AppIcon name="eye" :size="14" />
        </button>
        <button type="button" class="ra-btn ra-edit" title="Chỉnh sửa sản phẩm" @click="requestEdit(row)">
          <AppIcon name="edit" :size="14" />
        </button>
        <button
          type="button"
          class="ra-btn ra-lock"
          :title="isInactiveProduct(row) ? 'Mở bán lại sản phẩm' : 'Ngừng bán sản phẩm'"
          @click="requestStatusChange(row)"
        >
          <AppIcon :name="isInactiveProduct(row) ? 'refresh' : 'ban'" :size="14" />
        </button>
        <button
          type="button"
          class="ra-btn ra-del"
          :aria-label="`Xóa sản phẩm ${row.name}`"
          @click="requestDelete(row)"
        >
          <AppIcon name="trash2" :size="14" />
        </button>
      </div>
    </template>
  </AdminDataTable>

  <ConfirmDialog
    :open="Boolean(statusTarget)"
    :title="statusTarget && isInactiveProduct(statusTarget) ? 'Mở bán lại sản phẩm?' : 'Ngừng bán sản phẩm?'"
    :message="statusTarget
      ? `${isInactiveProduct(statusTarget) ? 'Mở bán lại' : 'Ngừng bán'} sản phẩm “${statusTarget.name}”?`
      : ''"
    :confirm-label="statusTarget && isInactiveProduct(statusTarget) ? 'Mở bán lại' : 'Ngừng bán'"
    cancel-label="Hủy"
    :loading="updatingStatus"
    :danger="Boolean(statusTarget && !isInactiveProduct(statusTarget))"
    @close="closeStatusDialog"
    @confirm="confirmStatusChange"
  />

  <ConfirmDialog
    :open="Boolean(deleteTarget)"
    title="Xóa sản phẩm?"
    :message="deleteTarget
      ? `Bạn có chắc muốn xóa sản phẩm “${deleteTarget.name}”? Sản phẩm sẽ ngừng hiển thị và không thể tiếp tục được bán.`
      : ''"
    confirm-label="Xóa sản phẩm"
    cancel-label="Hủy"
    :loading="deleting"
    danger
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.product-thumb {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--cream);
  overflow: hidden;
  color: var(--gold);
  flex: 0 0 auto;
}

.product-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-code {
  font-size: 11px;
  color: var(--text3);
  background: var(--cream);
  padding: 2px 6px;
  border-radius: 4px;
}

.product-price {
  color: var(--gold);
}

.stock-low {
  color: var(--red);
  font-weight: 600;
}
</style>
