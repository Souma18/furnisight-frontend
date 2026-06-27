<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { useAdminCategories } from '../../composables/useAdminCategories'

const { filtered, search, columns, openAdd, openEdit, deleteCategory } = useAdminCategories()
const deleteTarget = ref(null)
const deleting = ref(false)

function requestDelete(row) {
  deleteTarget.value = row
}

function closeDeleteDialog() {
  if (deleting.value) return
  deleteTarget.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  const deleted = await deleteCategory(deleteTarget.value)
  deleting.value = false
  if (deleted) deleteTarget.value = null
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Danh <em>mục</em>" subtitle="8 danh mục sản phẩm">
    <template #actions>
      <AppButton variant="unstyled" type="button" class="btn-add" @click="openAdd"><AppIcon name="plus" :size="15" />Thêm danh mục</AppButton>
    </template>
  </AdminPageHeader>
  <AdminFilterBar v-model:search="search" placeholder="Tìm danh mục..." />
  <AdminDataTable :columns="columns" :rows="filtered">
    <template #cell-name="{ row }">
      <div class="flex-cell">
        <span class="category-thumb">
          <AppImage v-if="row.imageUrl" :src="row.imageUrl" alt=""  />
          <AppIcon v-else :name="row.iconId" :size="18" />
        </span>
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
        <AppButton variant="unstyled" type="button" class="ra-btn ra-edit" @click="openEdit(row)"><AppIcon name="edit" :size="14" /></AppButton>
        <AppButton variant="unstyled"
          type="button"
          class="ra-btn ra-del"
          :aria-label="`Xóa danh mục ${row.name}`"
          @click="requestDelete(row)"
        >
          <AppIcon name="trash2" :size="14" />
        </AppButton>
      </div>
    </template>
  </AdminDataTable>

  <ConfirmDialog
    :open="Boolean(deleteTarget)"
    title="Xóa danh mục?"
    :message="deleteTarget
      ? `Bạn có chắc muốn xóa danh mục “${deleteTarget.name}”? Thao tác này không thể hoàn tác.`
      : ''"
    confirm-label="Xóa danh mục"
    cancel-label="Hủy"
    :loading="deleting"
    danger
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.category-thumb {
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
.category-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
