import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminListPage(fetcher) {
  const ui = useAdminUiStore()
  const { reloadTick } = storeToRefs(ui)
  const items = ref([])
  const search = ref('')
  let searchTimer = null

  async function load() {
    const params = search.value ? { query: search.value } : undefined
    const res = await fetcher(params)
    items.value = Array.isArray(res.data) ? res.data : res.data?.items ?? []
  }

  onMounted(load)
  watch(reloadTick, load)
  watch(search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(load, 250)
  })

  return { items, search, load, ui }
}
