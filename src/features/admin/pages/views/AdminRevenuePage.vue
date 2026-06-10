<script setup>
import { ref } from 'vue'
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

const { data, loading, bindCharts } = useAdminChartPage(adminApi.fetchRevenue.bind(adminApi))

const monthColumns = [
  { key: 'month', label: 'Tháng' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'mom', label: 'So tháng trước' },
  { key: 'profit', label: 'Lợi nhuận gộp' },
  { key: 'refund', label: 'Hoàn trả' },
]

bindCharts((charts, d) => {
  // Biểu đồ bar doanh thu tháng (đơn vị triệu VNĐ)
  if (monthCanvas.value && d.monthLabels?.length) {
    charts.renderRevenueBar(monthCanvas.value, d.monthLabels, d.monthData)
  }
})
</script>

<template>
  <AdminPageHeader eyebrow="Tài chính" title-html="Doanh <em>thu</em>"
    :subtitle="data?.snapshotAt ? `Cập nhật lúc ${data.snapshotAt}` : 'Đang tải...'">
    <template #actions>
      <button type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo doanh thu' })">
        <AppIcon name="download" :size="15" />Xuất báo cáo
      </button>
    </template>
  </AdminPageHeader>

  <div v-if="loading && !data" class="rev-state">
    <AppIcon name="trendingUp" :size="28" style="opacity:.3;margin-bottom:8px" />
    <span>Đang tải dữ liệu doanh thu...</span>
  </div>

  <template v-if="data">
    <AdminKpiGrid :kpis="data.kpis" variant="rev" />
    <div class="rev-charts">
      <AdminChartCard title="Doanh thu theo tháng" subtitle="12 tháng gần nhất · Triệu VNĐ">
        <canvas ref="monthCanvas" />
      </AdminChartCard>
    </div>
    <AdminDataTable :columns="monthColumns" :rows="data.monthlyRows">
      <template #cell-revenue="{ row }">
        <span style="font-weight:700;color:var(--gold)">{{ row.revenue }}</span>
      </template>
      <template #cell-mom="{ row }">
        <span :style="{ color: row.momClass === 'up' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '12px' }">
          {{ row.mom }}
        </span>
      </template>
      <template #cell-profit="{ row }">
        <span style="color:var(--text3)">{{ row.profit }}</span>
      </template>
      <template #cell-refund="{ row }">
        <span style="color:var(--red);font-size:12px">{{ row.refund }}</span>
      </template>
    </AdminDataTable>
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
}
.rev-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 16px 0;
}
</style>
