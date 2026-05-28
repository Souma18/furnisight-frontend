import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { fetchCategoriesMock, fetchCategoryIconOptionsMock } from '../api/adminMockApi'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminCategories() {
  const ui = useAdminUiStore()
  const items = ref([])
  const iconOptions = ref([])
  const search = ref('')

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Danh mục' },
    { key: 'slug', label: 'Slug' },
    { key: 'productCount', label: 'Số SP' },
    { key: 'visibleLabel', label: 'Hiển thị' },
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
    const [catRes, iconRes] = await Promise.all([fetchCategoriesMock(), fetchCategoryIconOptionsMock()])
    items.value = catRes.data?.items ?? []
    iconOptions.value = iconRes.data?.items ?? []
  }

  function openAdd() {
    ui.openModal('addCat')
  }

  function openEdit(row) {
    ui.openModal('editCat', row)
  }

  const { reloadTick } = storeToRefs(ui)

  onMounted(load)
  watch(reloadTick, load)

  return { items, filtered, iconOptions, search, columns, load, openAdd, openEdit }
}
