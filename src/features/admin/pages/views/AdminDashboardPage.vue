<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminChartCard from '../../components/shared/AdminChartCard.vue'
import { useAdminDashboard } from '../../composables/useAdminDashboard'
import { useAdminLayout } from '../../composables/useAdminLayout'

const { data, revenueCanvas, orderCanvas } = useAdminDashboard()
const { simUser } = useAdminLayout()

const badgeMap = {
  success: 'b-success',
  shipping: 'b-shipping',
  pending: 'b-pending',
  unpaid: 'b-pending',
  payment_failed: 'b-cancel',
  paid: 'b-success',
  cod_pending_confirmation: 'b-pending',
  cod_confirmed: 'b-success',
  in_transit: 'b-shipping',
  delivering: 'b-shipping',
  done: 'b-success',
  refund_pending: 'b-pending',
  refunded: 'b-success',
  cancel: 'b-cancel',
  low: 'b-low',
}
</script>

<template>
  <div v-if="data">
    <div class="welcome-banner">
      <div class="welcome-left">
        <div class="welcome-greeting">Xin chào trở lại</div>
        <div class="welcome-name">Admin <span>{{ simUser.name.split(' ').pop() }}</span></div>
        <div class="welcome-desc">Hệ thống vận hành ổn định. Mọi thao tác đang được ghi nhận tại nhật ký bảo mật.</div>
      </div>
      <div class="welcome-stats">
        <div class="welcome-stat"><div class="ws-val">{{ data.welcome.revenueLabel }}</div><div class="ws-label">Doanh thu T5</div></div>
        <div class="welcome-stat"><div class="ws-val">{{ data.welcome.ordersToday }}</div><div class="ws-label">Đơn hôm nay</div></div>
        <div class="welcome-stat"><div class="ws-val">{{ data.welcome.users }}</div><div class="ws-label">Người dùng</div></div>
      </div>
    </div>

    <div class="kpi-grid">
      <div v-for="kpi in data.kpis" :key="kpi.key" class="kpi-card" :class="`kpi-${kpi.tone}`">
        <div class="kpi-accent" />
        <div class="kpi-label"><AppIcon :name="kpi.icon" :size="16" />{{ kpi.label }}</div>
        <div class="kpi-value">{{ kpi.value }}<small v-if="kpi.suffix" style="font-size:18px">{{ kpi.suffix }}</small></div>
        <div class="kpi-change" :class="kpi.up ? 'kpi-up' : 'kpi-down'"><AppIcon :name="kpi.up ? 'trendingUp' : 'alert'" :size="13" />{{ kpi.change }}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:14px;margin-bottom:18px">
      <AdminChartCard title="Doanh thu theo thời gian" subtitle="Triệu VNĐ">
        <canvas ref="revenueCanvas" />
      </AdminChartCard>
      <AdminChartCard title="Đơn theo trạng thái" subtitle="Tháng này">
        <canvas ref="orderCanvas" />
      </AdminChartCard>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
      <div class="tcard">
        <div class="tcard-header"><div class="tcard-title"><AppIcon name="box" :size="17" />Đơn hàng gần đây</div></div>
        <table class="mini-table">
          <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
          <tbody>
            <tr v-for="o in data.recentOrders" :key="o.id">
              <td><span style="font-weight:500">{{ o.id }}</span></td>
              <td>{{ o.customer }}</td>
              <td style="font-weight:600;color:var(--gold)">{{ o.total }}</td>
              <td><span class="badge" :class="badgeMap[o.status]">{{ o.statusLabel }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="tcard">
        <div class="tcard-header"><div class="tcard-title"><AppIcon name="alert" :size="17" />Sắp hết hàng</div></div>
        <table class="mini-table">
          <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Tồn kho</th></tr></thead>
          <tbody>
            <tr v-for="p in data.lowStock" :key="p.name">
              <td><span class="cell-name">{{ p.name }}</span></td>
              <td>{{ p.category }}</td>
              <td><span class="badge" :class="p.level === 'empty' ? 'b-cancel' : 'b-low'">{{ p.stock }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
      <div v-for="a in data.alerts" :key="a.title" class="alert-card">
        <div class="alert-icon" :class="`ai-${a.tone}`"><AppIcon :name="a.icon" :size="19" /></div>
        <div><div class="alert-title">{{ a.title }}</div><div class="alert-desc">{{ a.desc }}</div></div>
      </div>
    </div>
  </div>
</template>
