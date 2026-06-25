<script setup>
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { PriceFormatter } from '@shared/lib/formatters'

const { items, search, load, ui } = useAdminListPage(adminApi.fetchProducts.bind(adminApi))
const deleteTarget = ref(null)
const deleting = ref(false)
const formatPrice = PriceFormatter.format
const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }

function requestDelete(row) {
  deleteTarget.value = row
}

async function requestEdit(row) {
  if (!row?.id) return
  try {
    const response = await adminApi.fetchProduct(row.id)
    const productDetail = response?.data ?? response ?? row
    ui.openModal('editProd', productDetail)
  } catch (error) {
    ui.openModal('editProd', row) // fallback
  }
}

function closeDeleteDialog() {
  if (deleting.value) return
  deleteTarget.value = null
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
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Sản <em>phẩm</em>" subtitle="Quản lý catalog & model 3D">
    <template #actions>
      <button type="button" class="btn-add" @click="ui.openModal('addProd')"><AppIcon name="plus" :size="15" />Thêm sản phẩm</button>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" />
  <div class="admin-product-grid">
    <div v-for="row in items" :key="row.id" class="ap-card" @click="requestEdit(row)">
      <div class="ap-card-img">
        <img v-if="row.imageUrls?.[0]" :src="row.imageUrls[0]" alt="" />
        <AppIcon v-else name="box" :size="32" class="ap-card-placeholder" />
        <div class="ap-card-badges">
          <span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span>
        </div>
      </div>
      <div class="ap-card-body">
        <div class="ap-card-meta">
          <span class="ap-card-sku">{{ row.sku || 'N/A' }}</span>
          <span class="ap-card-cat">{{ row.category || 'Không phân loại' }}</span>
        </div>
        <h3 class="ap-card-title">{{ row.name || 'Sản phẩm không tên' }}</h3>
        <div class="ap-card-footer">
          <span class="ap-card-price">{{ formatPrice(row.price) }}</span>
          <span class="ap-card-stock" :class="{ 'out-of-stock': row.stock <= 0 }">
            Tồn kho: {{ row.stock || 0 }}
          </span>
        </div>
      </div>
      <div class="ap-card-actions">
        <button type="button" class="ra-btn ra-edit" @click.stop="requestEdit(row)"><AppIcon name="edit" :size="14" /></button>
        <button
          type="button"
          class="ra-btn ra-del"
          :aria-label="`Xóa sản phẩm ${row.name}`"
          @click.stop="requestDelete(row)"
        >
          <AppIcon name="trash2" :size="14" />
        </button>
      </div>
    </div>
  </div>

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
.admin-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding-bottom: 30px;
}
.ap-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}
.ap-card:hover {
  border-color: var(--gold3);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.ap-card-img {
  aspect-ratio: 4/3;
  position: relative;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
}
.ap-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ap-card-placeholder {
  color: var(--text4);
}
.ap-card-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
}
.ap-card-badges .badge {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.ap-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.ap-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 11px;
}
.ap-card-sku {
  font-family: monospace;
  color: var(--text3);
  background: var(--cream2);
  padding: 2px 6px;
  border-radius: 4px;
}
.ap-card-cat {
  color: var(--text3);
  font-weight: 500;
}
.ap-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ap-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.ap-card-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
}
.ap-card-stock {
  font-size: 12px;
  color: var(--text3);
}
.ap-card-stock.out-of-stock {
  color: var(--red);
  font-weight: 600;
}
.ap-card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
}
.ap-card:hover .ap-card-actions {
  opacity: 1;
  transform: translateX(0);
}
.ap-card-actions .ra-btn {
  background: var(--white);
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  transition: all 0.2s;
  cursor: pointer;
}
.ap-card-actions .ra-btn:hover {
  background: var(--cream);
  color: var(--text);
  transform: scale(1.05);
}
.ap-card-actions .ra-del:hover {
  color: var(--red);
  background: var(--red-bg);
  border-color: var(--red-bg);
}
</style>
