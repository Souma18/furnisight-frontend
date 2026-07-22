import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { getApiErrorMessage } from '@shared/lib/api'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminListPage(fetcher) {
  const ui = useAdminUiStore()
  const { reloadTick } = storeToRefs(ui)
  const items = ref([])
  const search = ref('')
  const currentPage = ref(1)
  const pagination = ref({ info: '', buttons: [] })
  let searchTimer = null

  function buildPagination(page, totalPages, totalElements) {
    if (totalElements === 0) return { info: 'Không có dữ liệu', buttons: [] }
    const info = `Hiển thị ${page * 24 + 1}-${Math.min((page + 1) * 24, totalElements)} trên tổng số ${totalElements}`
    const buttons = []
    
    // Prev
    buttons.push({ icon: 'chevron-left', page: page > 0 ? page : null, disabled: page === 0 })
    
    // Pages
    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 || 
        i === totalPages - 1 || 
        (i >= page - 1 && i <= page + 1)
      ) {
        buttons.push({ label: String(i + 1), page: i + 1, active: i === page })
      } else if (
        (i === 1 && page > 2) || 
        (i === totalPages - 2 && page < totalPages - 3)
      ) {
        if (!buttons.length || buttons[buttons.length - 1].label !== '...') {
          buttons.push({ label: '...', page: null, disabled: true })
        }
      }
    }
    
    // Next
    buttons.push({ icon: 'chevron-right', page: page < totalPages - 1 ? page + 2 : null, disabled: page >= totalPages - 1 })
    
    return { info, buttons }
  }

  async function load() {
    try {
      const params = {
        ...(search.value ? { query: search.value } : {}),
        page: currentPage.value,
        size: 24
      }
      const res = await fetcher(params)
      items.value = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.content ?? []
      const dataObj = res.data?.data || res.data
      const totalPages = dataObj?.totalPages ?? 1
      const totalElements = dataObj?.totalElements ?? items.value.length
      const pageIndex = dataObj?.page ? dataObj.page - 1 : currentPage.value - 1
      
      pagination.value = buildPagination(pageIndex, totalPages, totalElements)
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
  watch(currentPage, load)
  watch(search, () => {
    currentPage.value = 1
    clearTimeout(searchTimer)
    searchTimer = setTimeout(load, 250)
  })

  return { items, search, currentPage, pagination, load, ui, buildPagination }
}
