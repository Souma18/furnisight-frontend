<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import { ordersApi } from '@shared/lib/api/services'
import { OrderDetailResponse } from '@shared/lib/api/services/orders/orders.model'
import { formatVietnamAddress, PriceFormatter } from '@shared/lib/formatters'

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
  refund_pending: { label: 'Chờ hoàn tiền', className: 'b-pending' },
}

const statusMeta = computed(() => statusMap[order.value?.status] ?? {
  label: order.value?.rawStatus || order.value?.status || '',
  className: 'b-pending',
})

const shippingAddress = computed(() => {
  const detail = order.value?.shippingDetail || {}
  return formatVietnamAddress({
    detail: detail.shippingAddressDetail,
    wardName: detail.wardName,
    provinceName: detail.provinceName,
  })
})

const paymentStatusMeta = computed(() => {
  const status = String(order.value?.paymentDetail?.paymentStatus || order.value?.rawStatus || '').toUpperCase()
  if (status === 'PAID') return { label: 'Đã thanh toán', className: 'b-success' }
  if (status === 'FAILED' || status === 'PAYMENT_FAILED') return { label: 'Thanh toán lỗi', className: 'b-cancel' }
  if (order.value?.status === 'refund_pending') return { label: 'Chờ hoàn tiền', className: 'b-pending' }
  if (order.value?.status === 'unpaid') return { label: 'Chờ thanh toán', className: 'b-pending' }
  return { label: status || 'Chưa rõ', className: 'b-pending' }
})

const paymentRows = computed(() => {
  const payment = order.value?.paymentDetail || {}
  const timeline = order.value?.paymentTimeline || {}
  return [
    { label: 'Mã giao dịch nội bộ', value: payment.transactionCode || order.value?.orderCode || 'Chưa có' },
    { label: 'Phương thức', value: payment.paymentMethod || order.value?.paymentMethod || 'Chưa rõ' },
    { label: 'Trạng thái thanh toán', value: paymentStatusMeta.value.label },
    { label: 'Số tiền đã ghi nhận', value: formatMoney(payment.paidAmount || 0) },
    { label: 'Thời điểm thanh toán', value: formatDateTime(payment.paidAt || timeline.paymentCompletedAt) || 'Chưa ghi nhận' },
    { label: 'Hạn thanh toán', value: formatDateTime(timeline.paymentExpiresAt || order.value?.paymentExpiresAt) || 'Không áp dụng' },
  ]
})

const timelineItems = computed(() => {
  const current = order.value
  if (!current) return []

  const timeline = current.paymentTimeline || {}
  const items = [
    {
      key: 'created',
      title: 'Đơn hàng được tạo',
      desc: 'Hệ thống ghi nhận đơn và khóa thông tin sản phẩm tại thời điểm đặt.',
      at: timeline.orderCreatedAt || current.createdAt,
      state: 'done',
      icon: 'clipboardList',
    },
  ]

  if (timeline.paymentInitiatedAt) {
    items.push({
      key: 'payment_initiated',
      title: 'Khởi tạo thanh toán',
      desc: `Khách chọn phương thức ${current.paymentDetail?.paymentMethod || current.paymentMethod || 'thanh toán'}.`,
      at: timeline.paymentInitiatedAt,
      state: 'done',
      icon: 'creditCard',
    })
  } else {
    items.push({
      key: 'payment_waiting',
      title: 'Chờ khởi tạo thanh toán',
      desc: 'Chưa có thời điểm khởi tạo thanh toán từ cổng thanh toán.',
      at: null,
      state: current.status === 'unpaid' ? 'current' : 'muted',
      icon: 'clock',
    })
  }

  if (timeline.paymentCompletedAt || current.paymentDetail?.paidAt) {
    items.push({
      key: 'payment_completed',
      title: 'Thanh toán thành công',
      desc: `Đã ghi nhận ${formatMoney(current.paymentDetail?.paidAmount || current.totalAmount)}.`,
      at: timeline.paymentCompletedAt || current.paymentDetail?.paidAt,
      state: 'done',
      icon: 'check',
    })
  } else if (timeline.paymentFailedAt || current.status === 'payment_failed') {
    items.push({
      key: 'payment_failed',
      title: 'Thanh toán thất bại',
      desc: 'Cổng thanh toán trả trạng thái lỗi hoặc giao dịch không hợp lệ.',
      at: timeline.paymentFailedAt,
      state: 'failed',
      icon: 'ban',
    })
  } else if (current.status === 'unpaid') {
    items.push({
      key: 'payment_pending',
      title: 'Đang chờ thanh toán',
      desc: current.canRetryPayment ? 'Khách vẫn còn trong thời hạn thanh toán.' : 'Đã quá thời hạn thanh toán hoặc không thể thanh toán lại.',
      at: timeline.paymentExpiresAt || current.paymentExpiresAt,
      state: current.canRetryPayment ? 'current' : 'failed',
      icon: 'clock',
    })
  }

  if (['delivering', 'done'].includes(current.status)) {
    items.push({
      key: 'shipping',
      title: 'Đơn đang giao',
      desc: 'Đơn đã được chuyển sang trạng thái vận chuyển.',
      at: null,
      state: 'done',
      icon: 'truck',
    })
  }

  if (current.status === 'done') {
    items.push({
      key: 'done',
      title: 'Hoàn thành',
      desc: 'Đơn hàng đã hoàn tất.',
      at: null,
      state: 'done',
      icon: 'checkCheck',
    })
  }

  if (current.status === 'cancel') {
    items.push({
      key: 'cancel',
      title: 'Đơn đã hủy',
      desc: 'Đơn hàng đã được chuyển sang trạng thái hủy.',
      at: null,
      state: 'failed',
      icon: 'ban',
    })
  }

  if (current.status === 'refund_pending') {
    items.push({
      key: 'refund_pending',
      title: 'Chờ hoàn tiền',
      desc: 'Đơn đã thanh toán được hủy trước khi giao và đang chờ xử lý hoàn tiền.',
      at: null,
      state: 'current',
      icon: 'refresh',
    })
  }

  return items
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

const formatMoney = PriceFormatter.format

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date)
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
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

watch(() => props.orderCode, load, { immediate: true })
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

      <div class="admin-order-timeline">
        <div class="admin-detail-section-head">
          <div>
            <p class="admin-detail-label">Minh bạch xử lý</p>
            <h3>Timeline đơn hàng</h3>
          </div>
        </div>
        <div class="admin-timeline-list">
          <div v-for="item in timelineItems" :key="item.key" class="admin-timeline-item" :class="`is-${item.state}`">
            <span class="admin-timeline-dot">
              <AppIcon :name="item.icon" :size="14" />
            </span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
              <small>{{ formatDateTime(item.at) || 'Chưa ghi nhận thời điểm' }}</small>
            </div>
          </div>
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
        <div class="admin-detail-card-head admin-detail-card-head--compact">
          <h3>Giao dịch</h3>
          <span class="badge" :class="paymentStatusMeta.className">{{ paymentStatusMeta.label }}</span>
        </div>
        <div class="admin-transaction-list">
          <div v-for="row in paymentRows" :key="row.label" class="admin-transaction-row">
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>
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
.admin-detail-card-head--compact {
  align-items: center;
  margin-bottom: 12px;
}
.admin-detail-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
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
.admin-order-timeline {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
.admin-timeline-list {
  display: grid;
  gap: 12px;
}
.admin-timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--cream);
}
.admin-timeline-item strong {
  display: block;
  color: var(--text);
  font-size: 13px;
}
.admin-timeline-item p {
  margin: 4px 0 0;
  color: var(--text2);
  font-size: 12px;
  line-height: 1.45;
}
.admin-timeline-item small {
  display: block;
  margin-top: 5px;
  color: var(--text4);
  font-size: 11px;
}
.admin-timeline-dot {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--white);
  color: var(--text3);
  border: 1px solid var(--border);
}
.admin-timeline-item.is-done .admin-timeline-dot {
  color: var(--green);
  background: var(--green-bg);
  border-color: rgba(42, 122, 80, .18);
}
.admin-timeline-item.is-current .admin-timeline-dot {
  color: var(--gold);
  background: var(--gold-pale);
  border-color: rgba(201, 146, 42, .24);
}
.admin-timeline-item.is-failed .admin-timeline-dot {
  color: var(--red);
  background: var(--red-bg);
  border-color: rgba(192, 57, 43, .18);
}
.admin-timeline-item.is-muted {
  opacity: .72;
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
.admin-transaction-list {
  display: grid;
  gap: 8px;
}
.admin-transaction-row {
  display: grid;
  grid-template-columns: minmax(0, 120px) minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.admin-transaction-row:last-child {
  border-bottom: 0;
}
.admin-transaction-row span {
  color: var(--text3);
  font-size: 12px;
}
.admin-transaction-row strong {
  min-width: 0;
  color: var(--text);
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere;
}
@media (max-width: 960px) {
  .admin-order-detail { grid-template-columns: 1fr; }
  .admin-order-line { grid-template-columns: 52px minmax(0, 1fr); }
  .admin-transaction-row { grid-template-columns: 1fr; }
  .admin-transaction-row strong { text-align: left; }
}
</style>
