<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminChartCard from '../../components/shared/AdminChartCard.vue'
import AdminKpiGrid from '../../components/shared/AdminKpiGrid.vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminChartPage } from '../../composables/useAdminChartPage'
import { useAdminUiStore } from '../../store/adminUiStore'
import { PriceFormatter } from '@shared/lib/formatters'

const ui = useAdminUiStore()
const userCanvas = ref(null)
const catCanvas = ref(null)
const { data, bindCharts } = useAdminChartPage(adminApi.fetchStats.bind(adminApi))

const formatCurrency = PriceFormatter.format

const kpis = computed(() => {
  const user = data.value?.user || {}
  const orders = data.value?.orders || {}
  const products = data.value?.products || {}

  return [
    {
      key: 'users',
      label: 'Người dùng',
      value: String(user.total || 0),
      change: `${user.newThisMonth || 0} mới tháng này`,
      up: true,
      tone: 'blue',
      icon: 'users',
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
      value: String(orders.total || 0),
      change: `${orders.today || 0} hôm nay`,
      up: true,
      tone: 'red',
      icon: 'box',
    },
    {
      key: 'revenue',
      label: 'Doanh thu',
      value: formatCurrency(orders.totalRevenue),
      change: `${formatCurrency(orders.revenueThisMonth)} tháng này`,
      up: true,
      tone: 'gold',
      icon: 'trendingUp',
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      value: String(products.total || 0),
      change: `${products.lowStock || 0} sắp hết`,
      up: Number(products.lowStock || 0) === 0,
      tone: 'green',
      icon: 'armchair',
    },
  ]
})

bindCharts((charts, d) => {
  const user = d.user || {}
  const categories = Array.isArray(d.topCategories) ? d.topCategories : []

  charts.renderBar(
    userCanvas.value,
    ['Tổng', 'Hoạt động', 'Bị khóa', 'Mới tháng'],
    [user.total || 0, user.active || 0, user.banned || 0, user.newThisMonth || 0],
  )
  charts.renderDoughnut(
    catCanvas.value,
    categories.map((category) => category.name),
    categories.map((category) => category.productCount || 0),
  )
})
</script>

<template>
  <AdminPageHeader eyebrow="Phân tích" title-html="Thống kê <em>& Báo cáo</em>" subtitle="Tổng hợp dữ liệu kinh doanh">
    <template #actions>
      <AppButton variant="unstyled" type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất báo cáo', subtitle: 'Đang tạo file PDF...' })">
        <AppIcon name="download" :size="15" />Xuất PDF
      </AppButton>
    </template>
  </AdminPageHeader>

  <template v-if="data">
    <AdminKpiGrid :kpis="kpis" />
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
