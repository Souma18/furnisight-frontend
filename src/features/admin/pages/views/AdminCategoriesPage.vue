<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { useAdminCategories } from '../../composables/useAdminCategories'
import { useAdminUiStore } from '../../store/adminUiStore'

const { filtered, search, columns, openAdd, openEdit } = useAdminCategories()
const ui = useAdminUiStore()
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Danh <em>mục</em>" subtitle="8 danh mục sản phẩm">
    <template #actions>
      <button type="button" class="btn-add" @click="openAdd"><AppIcon name="plus" :size="15" />Thêm danh mục</button>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" placeholder="Tìm danh mục..." />
  <AdminDataTable :columns="columns" :rows="filtered">
    <template #cell-name="{ row }">
      <div class="flex-cell">
        <AppIcon :name="row.iconId" :size="20" />
        <span class="cell-name">{{ row.name }}</span>
      </div>
    </template>
    <template #cell-slug="{ row }">
      <code style="font-size:11px;color:var(--text3);background:var(--cream);padding:2px 6px;border-radius:4px">{{ row.slug }}</code>
    </template>
    <template #cell-visibleLabel="{ row }">
      <span class="badge" :class="row.visible ? 'b-success' : 'b-pending'">{{ row.visibleLabel }}</span>
    </template>
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="ra-btn ra-edit" @click="openEdit(row)"><AppIcon name="edit" :size="14" /></button>
        <button type="button" class="ra-btn ra-del" @click="ui.showToast({ icon: 'trash2', title: 'Đã xóa danh mục' })"><AppIcon name="trash2" :size="14" /></button>
      </div>
    </template>
  </AdminDataTable>
</template>
