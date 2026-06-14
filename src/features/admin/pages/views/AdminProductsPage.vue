<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminListPage } from '../../composables/useAdminListPage'
import { PriceFormatter } from '@shared/lib/formatters'

const { items, search, ui } = useAdminListPage(adminApi.fetchProducts.bind(adminApi))
const columns = [
  { key: 'name', label: 'Sản phẩm' }, { key: 'sku', label: 'SKU' }, { key: 'category', label: 'Danh mục' },
  { key: 'price', label: 'Giá bán' }, { key: 'stock', label: 'Tồn kho' }, { key: 'statusLabel', label: 'Trạng thái' }, { key: 'actions', label: 'Hành động' },
]
const formatPrice = PriceFormatter.format
const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Sản <em>phẩm</em>" subtitle="Quản lý catalog & model 3D">
    <template #actions>
      <button type="button" class="btn-add" @click="ui.openModal('addProd')"><AppIcon name="plus" :size="15" />Thêm sản phẩm</button>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" />
  <AdminDataTable :columns="columns" :rows="items">
    <template #cell-name="{ row }">
      <div class="flex-cell">
        <div class="cell-img">
          <img v-if="row.imageUrls?.[0]" :src="row.imageUrls[0]" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px" />
          <AppIcon v-else name="box" :size="16" />
        </div>
        <span class="cell-name">{{ row.name }}</span>
      </div>
    </template>
    <template #cell-price="{ row }"><span style="font-weight:600;color:var(--gold)">{{ formatPrice(row.price) }}</span></template>
    <template #cell-statusLabel="{ row }"><span class="badge" :class="badgeMap[row.status]">{{ row.statusLabel }}</span></template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-edit" @click="ui.openModal('editProd', row)"><AppIcon name="edit" :size="14" /></button>
        <button type="button" class="ra-btn ra-del"><AppIcon name="trash2" :size="14" /></button>
      </div>
    </template>
  </AdminDataTable>
</template>
