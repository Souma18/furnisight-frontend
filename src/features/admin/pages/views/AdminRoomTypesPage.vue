<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppImage from '@shared/ui/AppImage.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminFilterBar from '../../components/shared/AdminFilterBar.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { useAdminRoomTypes } from '../../composables/useAdminRoomTypes'
import { formatDateTime } from '@shared/lib/formatters'

const { filtered, search, columns, openAdd, openEdit, deleteRoomType } = useAdminRoomTypes()
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
  const deleted = await deleteRoomType(deleteTarget.value)
  deleting.value = false
  if (deleted) deleteTarget.value = null
}
</script>

<template>
  <AdminPageHeader eyebrow="Quản lý hệ thống" title-html="Loại <em>phòng</em>" subtitle="Các loại phòng">
    <template #actions>
      <AppButton variant="unstyled" type="button" class="btn-add" @click="openAdd"><AppIcon name="plus" :size="15" />Thêm loại phòng</AppButton>
    </template>
  </AdminPageHeader>
  
  <AdminFilterBar v-model:search="search" placeholder="Tìm loại phòng..." />
  
  <AdminDataTable :columns="columns" :rows="filtered">
    <template #cell-name="{ row }">
      <div class="flex-cell">
        <span class="category-thumb">
          <AppImage v-if="row.imageUrl" :src="row.imageUrl" alt=""  />
        </span>
        <span class="cell-name">{{ row.name }}</span>
      </div>
    </template>
    
    <template #cell-slug="{ row }">
      <code style="font-size:11px;color:var(--text3);background:var(--cream);padding:2px 6px;border-radius:4px">{{ row.slug }}</code>
    </template>
    
    <template #cell-visibleLabel="{ row }">
      <span class="badge" :class="row.visible ? 'b-success' : 'b-pending'">{{ row.visible ? 'Hiển thị' : 'Ẩn' }}</span>
    </template>
    
    <template #cell-createdAt="{ row }">
      <span class="cell-muted">{{ formatDateTime(row.createdAt) || 'Chưa có dữ liệu' }}</span>
    </template>
    
    <template #cell-actions="{ row }">
      <div class="row-actions">
        <AppButton variant="unstyled" type="button" class="ra-btn ra-edit" @click="openEdit(row)"><AppIcon name="edit" :size="14" /></AppButton>
        <AppButton variant="unstyled"
          type="button"
          class="ra-btn ra-del"
          :aria-label="`Xóa loại phòng ${row.name}`"
          @click="requestDelete(row)"
        >
          <AppIcon name="trash2" :size="14" />
        </AppButton>
      </div>
    </template>
  </AdminDataTable>

  <ConfirmDialog
    :open="Boolean(deleteTarget)"
    title="Xóa loại phòng?"
    :message="deleteTarget
      ? `Bạn có chắc muốn xóa loại phòng “${deleteTarget.name}”? Thao tác này không thể hoàn tác.`
      : ''"
    confirm-label="Xóa loại phòng"
    cancel-label="Hủy"
    :loading="deleting"
    danger
    @close="closeDeleteDialog"
    @confirm="confirmDelete"
  />
</template>

<style scoped>
.flex-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.category-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: var(--cream2, #f7f5f0);
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--border);
  flex-shrink: 0;
  color: var(--text3);
}
.cell-name {
  font-weight: 500;
}
</style>
