<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import { ordersApi } from '@shared/lib/api/services'
import { OrderDetailResponse } from '@shared/lib/api/services/orders/orders.model'

const props = defineProps({
  orderCode: { type: String, required: true },
})

const router = useRouter()
const order = ref(null)
const loading = ref(false)
const error = ref('')

const statusMap = {
  unpaid: { label: 'Chờ thanh toán', className: 'b-pending' },
  payment_failed: { label: 'Thanh toán lỗi', className: 'b-cancel' },
  paid: { label: 'Đã thanh toán', className: 'b-success' },
  delivering: { label: 'Đang giao', className: 'b-shipping' },
  done: { label: 'Hoàn thành', className: 'b-success' },
  cancel: { label: 'Đã hủy', className: 'b-cancel' },
}

const statusMeta = computed(() => statusMap[order.value?.status] ?? {
  label: order.value?.rawStatus || order.value?.status || '',
  className: 'b-pending',
})

const shippingAddress = computed(() => {
  const detail = order.value?.shippingDetail || {}
  return [
    detail.shippingAddressDetail,
    detail.wardName,
    detail.districtName,
    detail.provinceName,
  ].filter(Boolean).join(', ')
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await ordersApi.getOrderDetail(props.orderCode)
    order.value = new OrderDetailResponse(data)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Không tải được chi tiết đơn hàng.'
  } finally {
    loading.value = false
  }
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date)
}

function itemName(item = {}) {
  return item.productSnapshot?.productName || item.productSnapshot?.name || 'Sản phẩm'
}

function itemImage(item = {}) {
  return item.imageUrl || item.productSnapshot?.imageUrl || ''
}

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}

onMounted(load)
</script>

<template>
  <AdminPageHeader
    eyebrow="Quản lý hệ thống"
    :title-html="`Chi tiết <em>${order?.orderCode || props.orderCode}</em>`"
    subtitle="Thông tin sản phẩm, giao hàng và thanh toán"
  >
    <template #actions>
      <button type="button" class="btn-export" @click="router.push({ name: 'admin-orders' })">
        <AppIcon name="chevronLeft" :size="15" />Quay lại
      </button>
    </template>
  </AdminPageHeader>

  <div v-if="loading" class="admin-detail-state">Đang tải chi tiết đơn hàng...</div>
  <div v-else-if="error" class="admin-detail-state admin-detail-state--error">{{ error }}</div>

  <section v-else-if="order" class="admin-order-detail">
    <article class="admin-detail-card admin-detail-card--main">
      <div class="admin-detail-card-head">
        <div>
          <p class="admin-detail-label">Mã đơn</p>
          <h2>{{ order.orderCode }}</h2>
          <p class="admin-detail-muted">Ngày đặt: {{ formatDate(order.createdAt) }}</p>
        </div>
        <span class="badge" :class="statusMeta.className">{{ statusMeta.label }}</span>
      </div>

      <div class="admin-order-lines">
        <div v-for="item in order.items" :key="item.id" class="admin-order-line">
          <span class="admin-order-thumb">
            <img v-if="itemImage(item)" :src="itemImage(item)" alt="" @error="hideBrokenImage">
            <AppIcon v-else name="image" :size="18" />
          </span>
          <div>
            <strong>{{ itemName(item) }}</strong>
            <p>{{ [item.productSnapshot?.color, item.productSnapshot?.material].filter(Boolean).join(' - ') }}</p>
          </div>
          <span>SL: {{ item.quantity }}</span>
          <strong>{{ formatMoney(item.price * item.quantity) }}</strong>
        </div>
      </div>
    </article>

    <aside class="admin-detail-side">
      <article class="admin-detail-card">
        <h3>Thanh toán</h3>
        <div class="admin-summary-row"><span>Tạm tính</span><strong>{{ formatMoney(order.subTotal) }}</strong></div>
        <div class="admin-summary-row"><span>Giảm giá</span><strong>{{ formatMoney(order.savedAmount) }}</strong></div>
        <div class="admin-summary-row"><span>Phí vận chuyển</span><strong>{{ formatMoney(order.fee?.shippingFee) }}</strong></div>
        <div class="admin-summary-row admin-summary-row--total"><span>Tổng cộng</span><strong>{{ formatMoney(order.totalAmount) }}</strong></div>
        <p class="admin-detail-muted">Phương thức: {{ order.paymentDetail?.paymentMethod || order.paymentMethod || 'Chưa rõ' }}</p>
      </article>

      <article class="admin-detail-card">
        <h3>Giao hàng</h3>
        <p class="admin-detail-text">
          <strong>{{ order.shippingDetail?.shippingAddressName || 'Khách hàng' }}</strong><br>
          {{ order.shippingDetail?.shippingAddressPhone || '' }}<br>
          {{ shippingAddress || order.shippingDetail?.shippingAddressDetail || 'Chưa có địa chỉ' }}
        </p>
        <p v-if="order.shippingDetail?.shippingMethod" class="admin-detail-muted">
          Đơn vị: {{ order.shippingDetail.shippingMethod }}
        </p>
      </article>

      <article v-if="order.customerNote" class="admin-detail-card">
        <h3>Ghi chú khách hàng</h3>
        <p class="admin-detail-text">{{ order.customerNote }}</p>
      </article>
    </aside>
  </section>
</template>

<style scoped>
.admin-detail-state {
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  color: var(--text2);
}
.admin-detail-state--error { color: var(--red2); }
.admin-order-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}
.admin-detail-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  box-shadow: var(--shadow-sm);
}
.admin-detail-card h2,
.admin-detail-card h3 {
  margin: 0;
}
.admin-detail-card h2 { font-size: 24px; }
.admin-detail-card h3 { margin-bottom: 14px; font-size: 15px; }
.admin-detail-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.admin-detail-label {
  margin: 0 0 4px;
  color: var(--text3);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.admin-detail-muted {
  margin: 8px 0 0;
  color: var(--text3);
  font-size: 12px;
}
.admin-detail-text {
  margin: 0;
  color: var(--text2);
  line-height: 1.55;
}
.admin-detail-side {
  display: grid;
  gap: 14px;
  align-content: start;
}
.admin-order-lines {
  display: grid;
  gap: 10px;
}
.admin-order-line {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.admin-order-line p {
  margin: 4px 0 0;
  color: var(--text3);
  font-size: 12px;
}
.admin-order-thumb {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: var(--cream);
  overflow: hidden;
}
.admin-order-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.admin-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  color: var(--text2);
  border-bottom: 1px solid var(--border);
}
.admin-summary-row--total {
  border-bottom: 0;
  color: var(--text);
  font-size: 16px;
}
@media (max-width: 960px) {
  .admin-order-detail { grid-template-columns: 1fr; }
  .admin-order-line { grid-template-columns: 52px minmax(0, 1fr); }
}
</style>
