<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminChartCard from '../../components/shared/AdminChartCard.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import AdminDataTable from '../../components/shared/AdminDataTable.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminChartPage } from '../../composables/useAdminChartPage'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const monthCanvas = ref(null)

const selectedYear = ref(new Date().getFullYear())
const { data, error, loading, load, bindCharts } = useAdminChartPage(() => adminApi.fetchRevenue({ year: selectedYear.value }))

const availableYears = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let y = current; y >= 2024; y--) {
    years.push(y)
  }
  return years
})

watch(selectedYear, () => {
  load()
})

const KPI_META = {
  REVENUE_TOTAL: { icon: 'creditCard', label: 'Tổng doanh thu', tone: 'gold', suffix: null },
  REVENUE_MONTH: { icon: 'trending', label: 'Doanh thu tháng này', tone: 'gold', suffix: null },
  ORDERS_TOTAL: { icon: 'box', label: 'Tổng đơn hàng', tone: 'green', suffix: null },
  ORDERS_MONTH: { icon: 'box', label: 'Đơn hàng tháng này', tone: 'green', suffix: null },
}

import { PriceFormatter } from '@shared/lib/formatters'

const mappedKpis = computed(() => {
  if (!data.value?.kpis) return []
  return data.value.kpis.map(raw => {
    const meta = KPI_META[raw.type] ?? { icon: 'bar', label: raw.type ?? '', tone: 'navy', suffix: null }
    const value = raw.value ?? 0
    const changeValue = raw.changeValue ?? 0
    const up = changeValue >= 0
    return {
      key: raw.type,
      icon: meta.icon,
      label: meta.label,
      tone: meta.tone,
      value: (raw.type === 'REVENUE_TOTAL' || raw.type === 'REVENUE_MONTH') 
        ? PriceFormatter.format(value) 
        : Number(value).toLocaleString(),
      suffix: meta.suffix,
      change: changeValue ? `${up ? '+' : ''}${changeValue % 1 === 0 ? changeValue : changeValue.toFixed(1)}%` : null,
      up,
    }
  })
})

const hasRevenueData = computed(() =>
  Boolean(data.value?.kpis?.length || data.value?.monthlyRows?.length || data.value?.months?.length || data.value?.monthLabels?.length),
)

const monthColumns = [
  { key: 'month', label: 'Tháng' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'mom', label: 'So tháng trước' },
  { key: 'profit', label: 'Lợi nhuận gộp' },
  { key: 'refund', label: 'Hoàn trả' },
]

const topProductColumns = [
  { key: 'imageUrl', label: 'Hình ảnh' },
  { key: 'productName', label: 'Tên sản phẩm' },
  { key: 'categoryName', label: 'Danh mục' },
  { key: 'price', label: 'Đơn giá' },
  { key: 'soldCount', label: 'Đã bán' },
  { key: 'totalRevenue', label: 'Doanh thu' },
]

bindCharts((charts, d) => {
  let labels = d.monthLabels || d.months
  let chartData = d.monthData

  if ((!labels || !labels.length) && d.monthlyRows?.length) {
    // Backup: extract from monthlyRows if backend doesn't provide monthLabels
    // Assuming we want chronological order, reverse if rows are descending
    const rows = [...d.monthlyRows].reverse()
    labels = rows.map((r) => r.month)
    chartData = rows.map((r) => {
      if (typeof r.revenue === 'string') {
        return parseFloat(r.revenue.replace(/[^0-9.-]+/g, ''))
      }
      return typeof r.revenue === 'number' ? r.revenue : 0
    })
  }

  if (monthCanvas.value && labels?.length) {
    const formattedData = (chartData || []).map(val => Number(val) > 0 ? Number(val) / 1000000 : 0)
    charts.renderRevenueBar(monthCanvas.value, labels, formattedData)
  }
})
</script>

<template>
  <AdminPageHeader eyebrow="Tài chính" title-html="Doanh <em>thu</em>"
    :subtitle="data?.snapshotAt ? `Cập nhật lúc ${data.snapshotAt}` : 'Đang tải...'">
    <template #actions>
      <select v-model="selectedYear" class="app-input" style="width: 120px; padding: 6px 12px; height: 32px;">
        <option v-for="y in availableYears" :key="y" :value="y">Năm {{ y }}</option>
      </select>
      <AppButton variant="unstyled" type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo doanh thu' })">
        <AppIcon name="download" :size="15" />Xuất báo cáo
      </AppButton>
    </template>
  </AdminPageHeader>

  <div v-if="loading && !data" class="rev-state">
    <AppIcon name="trendingUp" :size="28" style="opacity:.3;margin-bottom:8px" />
    <span>Đang tải dữ liệu doanh thu...</span>
  </div>

  <div v-else-if="error" class="rev-state rev-state--error">
    <AppIcon name="alert" :size="28" style="opacity:.45;margin-bottom:8px" />
    <strong>Không tải được dữ liệu doanh thu</strong>
    <span>{{ error }}</span>
    <AppButton variant="unstyled" type="button" class="btn-export rev-retry" @click="load">Tải lại</AppButton>
  </div>

  <div v-else-if="data && !hasRevenueData" class="rev-state">
    <AppIcon name="trendingUp" :size="28" style="opacity:.3;margin-bottom:8px" />
    <strong>Chưa có dữ liệu doanh thu</strong>
    <span>Hệ thống đã phản hồi nhưng chưa có snapshot hoặc đơn hàng phù hợp.</span>
    <AppButton variant="unstyled" type="button" class="btn-export rev-retry" @click="load">Tải lại</AppButton>
  </div>

  <template v-if="data && hasRevenueData">
    <AdminKpiGrid :kpis="mappedKpis" variant="rev" />
    <div class="rev-charts">
      <AdminChartCard title="Doanh thu theo tháng" subtitle="12 tháng gần nhất · Triệu VNĐ">
        <canvas ref="monthCanvas" />
      </AdminChartCard>
    </div>
    <AdminDataTable :columns="monthColumns" :rows="data.monthlyRows">
      <template #cell-revenue="{ row }">
        <span style="font-weight:700;color:var(--gold)">{{ PriceFormatter.format(row.revenue) }}</span>
      </template>
      <template #cell-mom="{ row }">
        <span :style="{ color: row.mom >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '12px' }">
          {{ row.mom != null ? (row.mom > 0 ? '+' : '') + (row.mom % 1 === 0 ? row.mom : row.mom.toFixed(1)) + '%' : '—' }}
        </span>
      </template>
      <template #cell-profit="{ row }">
        <span style="color:var(--text3)">{{ row.profit }}</span>
      </template>
      <template #cell-refund="{ row }">
        <span style="color:var(--red);font-size:12px">{{ row.refund }}</span>
      </template>
    </AdminDataTable>

    <div class="top-selling-section" style="margin-top: 32px;">
      <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600; color: var(--text)">Top 5 sản phẩm bán chạy nhất</h3>
      <AdminDataTable :columns="topProductColumns" :rows="data.topProducts">
        <template #cell-imageUrl="{ row }">
          <AppImage v-if="row.imageUrl" :src="row.imageUrl" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;" alt=""  />
          <span v-else style="color:var(--text3); font-size:12px;">—</span>
        </template>
        <template #cell-productName="{ row }">
          <span style="font-weight: 600; color: var(--text)">{{ row.productName }}</span>
        </template>
        <template #cell-price="{ row }">
          <span style="color:var(--text3)">{{ PriceFormatter.format(row.price) }}</span>
        </template>
        <template #cell-soldCount="{ row }">
          <span style="font-weight: 600; color: var(--text)">{{ row.soldCount }}</span>
        </template>
        <template #cell-totalRevenue="{ row }">
          <span style="font-weight:700;color:var(--gold)">{{ PriceFormatter.format(row.totalRevenue) }}</span>
        </template>
      </AdminDataTable>
    </div>
  </template>
</template>

<style scoped>
.rev-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  color: var(--text3);
  font-size: 13px;
  gap: 4px;
  text-align: center;
}
.rev-state--error {
  color: var(--red);
  border-color: rgba(192, 57, 43, .3);
  background: var(--red-bg);
}
.rev-retry {
  margin-top: 10px;
}
.rev-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 16px 0;
}
</style>
