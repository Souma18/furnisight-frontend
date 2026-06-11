import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAdminCharts } from './useAdminCharts'

/** Load data + re-render charts after DOM updates (v-if data). */
export function useAdminChartPage(fetcher) {
  const data = ref(null)
  const error = ref('')
  const loading = ref(true)
  const charts = useAdminCharts()

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetcher()
      data.value = res.data?.data ?? res.data ?? null
    } catch (err) {
      data.value = null
      error.value = err?.response?.data?.message || err.message || 'Không tải được dữ liệu.'
    } finally {
      loading.value = false
    }
  }

  function bindCharts(renderFn) {
    watch(
      data,
      async (val) => {
        if (!val) return
        charts.destroyAll()
        await nextTick()
        renderFn(charts, val)
      },
      { flush: 'post', immediate: true },
    )
    onBeforeUnmount(() => charts.destroyAll())
  }

  onMounted(() => load())

  return { data, error, loading, load, charts, bindCharts }
}
