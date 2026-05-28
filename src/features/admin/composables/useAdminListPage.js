import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminListPage(fetcher) {
  const ui = useAdminUiStore()
  const { reloadTick } = storeToRefs(ui)
  const items = ref([])
  const search = ref('')

  async function load() {
    const res = await fetcher()
    items.value = res.data?.items ?? res.data?.content ?? res.data ?? []
  }

  onMounted(load)
  watch(reloadTick, load)

  return { items, search, load, ui }
}
