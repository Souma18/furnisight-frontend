<script setup>
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminChartCard from '../../components/shared/AdminChartCard.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import { fetchStatsMock } from '../../api/adminMockApi'
import { useAdminChartPage } from '../../composables/useAdminChartPage'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const userCanvas = ref(null)
const catCanvas = ref(null)
const { data, bindCharts } = useAdminChartPage(fetchStatsMock)

bindCharts((charts, d) => {
  charts.renderBar(userCanvas.value, d.userLabels, d.userData)
  charts.renderDoughnut(catCanvas.value, d.categoryLabels, d.categoryData)
})
</script>

<template>
  <AdminPageHeader eyebrow="Phân tích" title-html="Thống kê <em>& Báo cáo</em>" subtitle="Tổng hợp dữ liệu kinh doanh">
    <template #actions>
      <button type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo', subtitle: 'Đang tạo file PDF...' })">
        <AppIcon name="download" :size="15" />Xuất PDF
      </button>
    </template>
  </AdminPageHeader>

  <template v-if="data">
    <AdminKpiGrid :kpis="data.kpis" />
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px">
      <AdminChartCard title="Người dùng mới theo tháng" subtitle="2026">
        <canvas ref="userCanvas" />
      </AdminChartCard>
      <AdminChartCard title="Top danh mục bán chạy" subtitle="Theo doanh thu">
        <canvas ref="catCanvas" />
      </AdminChartCard>
    </div>
  </template>
</template>
