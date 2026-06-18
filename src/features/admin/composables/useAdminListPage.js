import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { getApiErrorMessage } from '@shared/lib/api'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminListPage(fetcher) {
  const ui = useAdminUiStore()
  const { reloadTick } = storeToRefs(ui)
  const items = ref([])
  const search = ref('')
  let searchTimer = null

  async function load() {
    try {
      const params = search.value ? { query: search.value } : undefined
      const res = await fetcher(params)
      items.value = Array.isArray(res.data) ? res.data : res.data?.items ?? []
    } catch (error) {
      ui.showToast({
        icon: 'x',
        title: 'Không thể tải dữ liệu',
        subtitle: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    }
  }

  onMounted(load)
  watch(reloadTick, load)
  watch(search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(load, 250)
  })

  return { items, search, load, ui }
}
