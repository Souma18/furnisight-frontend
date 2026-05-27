import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAdminCharts } from './useAdminCharts'

/** Load data + re-render charts after DOM updates (v-if data). */
export function useAdminChartPage(fetcher) {
  const data = ref(null)
  const loading = ref(true)
  const charts = useAdminCharts()

  async function load() {
    loading.value = true
    try {
      const res = await fetcher()
      data.value = res.data
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

  return { data, loading, load, charts, bindCharts }
}
