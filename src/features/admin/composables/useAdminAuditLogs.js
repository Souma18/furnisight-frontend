import { computed, ref, watch } from 'vue'
import { fetchAuditLogsMock } from '../api/adminMockApi'

const PAGE_SIZE = 20

export function useAdminAuditLogs() {
  const items = ref([])
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const search = ref('')
  const type = ref('all')
  const result = ref('all')
  const period = ref('today')

  async function load() {
    loading.value = true
    try {
      // TODO(BE): adminApi.fetchAuditLogs({ search, type, result, period, page })
      const res = await fetchAuditLogsMock({
        search: search.value,
        type: type.value,
        result: result.value,
        page: page.value,
        pageSize: PAGE_SIZE,
      })
      items.value = res.data?.items ?? []
      total.value = res.data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  watch([search, type, result, period], () => {
    page.value = 1
    load()
  })

  watch(page, load)

  const pagination = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE + 1
    const end = Math.min(page.value * PAGE_SIZE, total.value)
    return {
      info: `Hiển thị <strong>${start}–${end}</strong> / ${total.value.toLocaleString('vi-VN')} bản ghi`,
      buttons: [
        { icon: 'chevronLeft', page: Math.max(1, page.value - 1), disabled: page.value <= 1 },
        { label: '1', page: 1, active: page.value === 1 },
        { label: '2', page: 2, active: page.value === 2 },
        { label: '3', page: 3, active: page.value === 3 },
        { icon: 'chevronRight', page: page.value + 1, disabled: page.value >= 3 },
      ],
    }
  })

  load()

  return {
    items,
    total,
    page,
    loading,
    search,
    type,
    result,
    period,
    pagination,
    load,
  }
}
