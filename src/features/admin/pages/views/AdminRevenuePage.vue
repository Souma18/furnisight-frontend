<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, ref } from 'vue'
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

const { data, error, loading, load, bindCharts } = useAdminChartPage(adminApi.fetchRevenue.bind(adminApi))
const hasRevenueData = computed(() =>
  Boolean(data.value?.kpis?.length || data.value?.monthlyRows?.length || data.value?.monthLabels?.length),
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
      <AppButton type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo doanh thu' })">
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
    <AppButton type="button" class="btn-export rev-retry" @click="load">Tải lại</AppButton>
  </div>

  <div v-else-if="data && !hasRevenueData" class="rev-state">
    <AppIcon name="trendingUp" :size="28" style="opacity:.3;margin-bottom:8px" />
    <strong>Chưa có dữ liệu doanh thu</strong>
    <span>Hệ thống đã phản hồi nhưng chưa có snapshot hoặc đơn hàng phù hợp.</span>
    <AppButton type="button" class="btn-export rev-retry" @click="load">Tải lại</AppButton>
  </div>

  <template v-if="data && hasRevenueData">
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
          <span style="color:var(--text3)">{{ row.price }}</span>
        </template>
        <template #cell-soldCount="{ row }">
          <span style="font-weight: 600; color: var(--text)">{{ row.soldCount }}</span>
        </template>
        <template #cell-totalRevenue="{ row }">
          <span style="font-weight:700;color:var(--gold)">{{ row.totalRevenue }}</span>
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
