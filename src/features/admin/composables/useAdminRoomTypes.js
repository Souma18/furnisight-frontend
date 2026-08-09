import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi } from '@shared/lib/api/services/admin/admin.api'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminRoomTypes() {
  const ui = useAdminUiStore()
  const items = ref([])
  const search = ref('')

  const columns = [
    { key: 'name', label: 'Tên loại phòng' },
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Mô tả' },
    { key: 'visibleLabel', label: 'Trạng thái' },
    { key: 'createdAt', label: 'Ngày tạo' },
    { key: 'actions', label: 'Hành động' },
  ]

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter(
      (row) => String(row.name).toLowerCase().includes(q) || String(row.slug).toLowerCase().includes(q),
    )
  })

  async function load() {
    try {
      const response = await adminApi.fetchRoomTypes({ page: 1, size: 100 })
      items.value = Array.isArray(response.data) ? response.data : response.data?.roomTypes || []
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại phòng:', error)
    }
  }

  function openAdd() {
    ui.openModal('addRoomType')
  }

  function openEdit(row) {
    ui.openModal('editRoomType', row)
  }

  async function deleteRoomType(roomType) {
    if (!roomType?.id) return false

    try {
      const response = await adminApi.deleteRoomType(roomType.id)
      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Không thể xóa loại phòng.')
      }

      await load()
      ui.showToast({
        icon: 'check',
        title: 'Đã xóa loại phòng',
        subtitle: roomType.name,
      })
      return true
    } catch (error) {
      ui.showToast({
        icon: 'alert',
        title: 'Không thể xóa loại phòng',
        subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại.',
      })
      return false
    }
  }

  const { reloadTick } = storeToRefs(ui)

  onMounted(load)
  watch(reloadTick, load)

  return { items, filtered, search, columns, load, openAdd, openEdit, deleteRoomType }
}
