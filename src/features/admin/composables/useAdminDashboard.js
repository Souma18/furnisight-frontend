import { ref } from 'vue'
import { fetchDashboardMock } from '../api/adminMockApi'
import { useAdminChartPage } from './useAdminChartPage'

export function useAdminDashboard() {
  const revenueCanvas = ref(null)
  const orderCanvas = ref(null)
  const { data, loading, bindCharts } = useAdminChartPage(fetchDashboardMock)

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
