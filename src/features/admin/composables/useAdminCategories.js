import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminCategories() {
  const ui = useAdminUiStore()
  const items = ref([])
  const search = ref('')
  const roomTypes = ref([])
  const roomTypeFilter = ref('')

  const columns = [
    { key: 'name', label: 'Danh mục' },
    { key: 'slug', label: 'Slug' },
    { key: 'productCount', label: 'Số SP' },
    { key: 'visibleLabel', label: 'Hiển thị' },
    { key: 'createdAt', label: 'Ngày tạo' },
    { key: 'actions', label: 'Hành động' },
  ]

  const filtered = computed(() => {
    let result = items.value
    
    if (roomTypeFilter.value) {
      result = result.filter(row => row.roomTypeId === roomTypeFilter.value)
    }

    const q = search.value.trim().toLowerCase()
    if (!q) return result
    
    return result.filter(
      (row) => String(row.name).toLowerCase().includes(q) || String(row.slug).toLowerCase().includes(q),
    )
  })

  async function load() {
    try {
      const [catRes, roomRes] = await Promise.all([
        adminApi.fetchCategories(),
        adminApi.fetchRoomTypes()
      ])
      items.value = Array.isArray(catRes.data) ? catRes.data : catRes.data?.items ?? []
      roomTypes.value = Array.isArray(roomRes.data) ? roomRes.data : roomRes.data?.items ?? []
    } catch (error) {
      console.error('Failed to load categories/room types', error)
    }
  }

  function openAdd() {
    ui.openModal('addCat')
  }

  function openEdit(row) {
    ui.openModal('editCat', row)
  }

  async function deleteCategory(category) {
    if (!category?.id) return false

    try {
      const response = await adminApi.deleteCategory(category.id)
      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Không thể xóa danh mục.')
      }

      await load()
      ui.showToast({
        icon: 'check',
        title: 'Đã xóa danh mục',
        subtitle: category.name,
      })
      return true
    } catch (error) {
      ui.showToast({
        icon: 'alert',
        title: 'Không thể xóa danh mục',
        subtitle: error?.response?.data?.message || error.message || 'Vui lòng thử lại.',
      })
      return false
    }
  }

  const { reloadTick } = storeToRefs(ui)

  onMounted(load)
  watch(reloadTick, load)

  return { items, filtered, search, columns, load, openAdd, openEdit, deleteCategory, roomTypes, roomTypeFilter }
}
