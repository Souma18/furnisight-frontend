import { computed, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { applyOrderStatusMapping } from '@shared/lib/orders/orderStatusMapper'
import { useAdminChartPage } from './useAdminChartPage'

export function useAdminDashboard() {
  const revenueCanvas = ref(null)
  const orderCanvas = ref(null)
  const { data: rawData, loading, bindCharts } = useAdminChartPage(adminApi.fetchDashboard.bind(adminApi))
  const data = computed(() => {
    if (!rawData.value) return null
    return {
      ...rawData.value,
      recentOrders: Array.isArray(rawData.value.recentOrders)
        ? rawData.value.recentOrders.map((order) => applyOrderStatusMapping(order))
        : [],
    }
  })

  bindCharts((charts, d) => {
    if (d.revenueChart) {
      charts.renderLine(revenueCanvas.value, d.revenueChart.labels, d.revenueChart.data)
    }
    if (d.orderChart) {
      charts.renderDoughnut(orderCanvas.value, d.orderChart.labels, d.orderChart.data)
    }
  })

  return { loading, data, revenueCanvas, orderCanvas }
}
