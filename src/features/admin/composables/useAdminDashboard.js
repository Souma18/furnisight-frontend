import { computed, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { PriceFormatter } from '@shared/lib/formatters'
import { applyOrderStatusMapping, getOrderStatusLabel } from '@shared/lib/orders/orderStatusMapper'
import { useAdminChartPage } from './useAdminChartPage'

const KPI_META = {
  USERS:        { icon: 'users',      label: 'Người dùng',   tone: 'blue',   suffix: null },
  REVENUE:      { icon: 'trending',   label: 'Doanh thu (T)', tone: 'gold',  suffix: null },
  ORDERS:       { icon: 'box',        label: 'Đơn hàng',      tone: 'green', suffix: null },
  PRODUCTS:     { icon: 'grid',       label: 'Sản phẩm',     tone: 'navy',  suffix: null },
  LOW_STOCK:    { icon: 'alert',      label: 'Sắp hết hàng', tone: 'warn',  suffix: null },
  REVENUE_TOTAL:{ icon: 'creditCard', label: 'Tổng doanh thu', tone: 'gold', suffix: null },
  ORDERS_TOTAL: { icon: 'box',        label: 'Tổng đơn',     tone: 'green', suffix: null },
}

const ALERT_META = {
  ORDERS_TODAY: { icon: 'box',    tone: 'blue' },
  LOW_STOCK:    { icon: 'alert',  tone: 'warn' },
  NEW_USERS:    { icon: 'users',  tone: 'green' },
}

function formatKpiValue(type, value) {
  if (type === 'REVENUE' || type === 'REVENUE_TOTAL' || type === 'REVENUE_MONTH') {
    return PriceFormatter.format(value)
  }
  return Number(value ?? 0).toLocaleString()
}

function mapKpi(raw) {
  const meta = KPI_META[raw.type] ?? { icon: 'bar', label: raw.type ?? '', tone: 'navy', suffix: null }
  const value = raw.value ?? 0
  const changeValue = raw.changeValue ?? 0
  const up = changeValue >= 0
  return {
    key: raw.type,
    icon: meta.icon,
    label: meta.label,
    tone: meta.tone,
    value: formatKpiValue(raw.type, value),
    suffix: meta.suffix,
    change: `${up ? '+' : ''}${changeValue % 1 === 0 ? changeValue : changeValue.toFixed(1)}`,
    up,
  }
}

function mapAlert(raw) {
  const meta = ALERT_META[raw.type] ?? { icon: 'info', tone: 'blue' }
  const labelMap = {
    ORDERS_TODAY: `${raw.count ?? 0} đơn hôm nay`,
    LOW_STOCK:    `${raw.count ?? 0} sản phẩm sắp hết`,
    NEW_USERS:    `${raw.count ?? 0} người dùng mới`,
  }
  const titleMap = {
    ORDERS_TODAY: 'Đơn hôm nay',
    LOW_STOCK:    'Sắp hết hàng',
    NEW_USERS:    'Người dùng mới',
  }
  return {
    icon: meta.icon,
    tone: meta.tone,
    title: titleMap[raw.type] ?? raw.type,
    desc: labelMap[raw.type] ?? `${raw.count ?? 0}`,
  }
}

export function useAdminDashboard() {
  const revenueCanvas = ref(null)
  const orderCanvas = ref(null)
  const { data: rawData, loading, bindCharts } = useAdminChartPage(adminApi.fetchDashboard.bind(adminApi))
  const data = computed(() => {
    if (!rawData.value) return null
    return {
      ...rawData.value,
      kpis: Array.isArray(rawData.value.kpis)
        ? rawData.value.kpis.map(mapKpi)
        : [],
      alerts: Array.isArray(rawData.value.alerts)
        ? rawData.value.alerts.map(mapAlert)
        : [],
      orderChart: rawData.value.orderChart ? {
        ...rawData.value.orderChart,
        labels: (rawData.value.orderChart.labels || []).map(label => getOrderStatusLabel(label))
      } : null,
      recentOrders: Array.isArray(rawData.value.recentOrders)
        ? rawData.value.recentOrders.map((order) => {
            const mapped = applyOrderStatusMapping(order)
            return {
              ...mapped,
              displayCode: mapped.orderCode || 'Chưa có mã đơn',
              total: PriceFormatter.format(mapped.totalAmount),
            }
          })
        : [],
    }
  })

  bindCharts((charts, d) => {
    if (d.revenueChart) {
      charts.renderLine(revenueCanvas.value, d.revenueChart.labels, d.revenueChart.data)
    }
    if (d.orderChart) {
      const translatedLabels = (d.orderChart.labels || []).map(label => getOrderStatusLabel(label))
      charts.renderDoughnut(orderCanvas.value, translatedLabels, d.orderChart.data)
    }
  })

  return { loading, data, revenueCanvas, orderCanvas }
}
