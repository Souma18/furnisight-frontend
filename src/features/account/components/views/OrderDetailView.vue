<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import { useAccountOrders } from '../../composables/useAccountOrders'
import { usePaymentCountdown } from '../../composables/usePaymentCountdown'
import { ORDER_STATUS_LABELS } from '../../composables/orderStatusLabels'
import { canRetryOrderPayment, parseOrderDate, shouldShowRetryPayment } from '@shared/lib/api/services/orders/orders.model'
import { PriceFormatter } from '@shared/lib/formatters'

const emit = defineEmits(['notify'])
const router = useRouter()

const {
  selectedOrder: order,
  backToOrders,
  cancelOrder,
  retryPayment,
  retryingOrderCode,
} = useAccountOrders((msg, type) => emit('notify', msg, type))

const cancelDialogOpen = ref(false)
const canceling = ref(false)
const { formatCountdown, isPaymentTimeRemaining } = usePaymentCountdown()

function handleCancel() {
  if (!order.value || !['unpaid', 'payment_failed'].includes(order.value.status)) return
  cancelDialogOpen.value = true
}

function closeCancelDialog() {
  if (canceling.value) return
  cancelDialogOpen.value = false
}

async function confirmCancel() {
  if (!order.value || canceling.value) return
  canceling.value = true
  const success = await cancelOrder(order.value.orderCode || order.value.id)
  canceling.value = false
  if (success) cancelDialogOpen.value = false
}

function handleRetryPayment() {
  if (!order.value) return
  retryPayment(order.value)
}

const retryingPayment = computed(() =>
  Boolean(order.value) && retryingOrderCode.value === (order.value.orderCode || order.value.id),
)

const canRetryPaymentNow = computed(() =>
  Boolean(order.value)
    && canRetryOrderPayment(order.value)
    && isPaymentTimeRemaining(order.value),
)

const formatMoney = PriceFormatter.format

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = parseOrderDate(dateStr)
  return date ? new Intl.DateTimeFormat('vi-VN').format(date) : dateStr
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const date = parseOrderDate(dateStr)
  return date
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : dateStr
}

function orderItemImage(item = {}) {
  return item.imageUrl || item.productSnapshot?.imageUrl || ''
}

function orderItemProductId(item = {}) {
  return item.productId || item.productSnapshot?.productId || ''
}

function reviewProduct(item) {
  const productId = orderItemProductId(item)
  if (!productId || order.value?.status !== 'done') return
  router.push({
    name: 'product-detail',
    params: { id: productId },
    query: { tab: 'review' },
  })
}

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}

const statusLabel = computed(() => ORDER_STATUS_LABELS[order.value?.status] ?? order.value?.status ?? '')

const paymentStatusLabel = computed(() => {
  const rawStatus = String(order.value?.paymentDetail?.paymentStatus || order.value?.rawStatus || '').toUpperCase()
  if (rawStatus === 'PAID') return 'Đã thanh toán'
  if (['FAILED', 'PAYMENT_FAILED'].includes(rawStatus)) return 'Thanh toán thất bại'
  if (order.value?.status === 'unpaid') return 'Chờ thanh toán'
  return rawStatus || 'Chưa ghi nhận'
})

const transactionTimeline = computed(() => {
  const current = order.value
  if (!current) return []

  const timeline = current.paymentTimeline || {}
  const items = [
    {
      key: 'created',
      title: 'Đơn hàng được tạo',
      sub: 'Hệ thống đã ghi nhận đơn hàng.',
      time: timeline.orderCreatedAt || current.createdAt,
      state: 'done',
      icon: 'clipboardList',
    },
  ]

  if (timeline.paymentInitiatedAt) {
    items.push({
      key: 'initiated',
      title: 'Khởi tạo thanh toán',
      sub: `Phương thức ${current.paymentDetail?.paymentMethod || current.paymentMethod || 'thanh toán'}.`,
      time: timeline.paymentInitiatedAt,
      state: 'done',
      icon: 'creditCard',
    })
  }

  if (timeline.paymentCompletedAt || current.paymentDetail?.paidAt) {
    items.push({
      key: 'completed',
      title: 'Thanh toán thành công',
      sub: `Đã ghi nhận ${formatMoney(current.paymentDetail?.paidAmount || current.totalAmount)}.`,
      time: timeline.paymentCompletedAt || current.paymentDetail?.paidAt,
      state: 'done',
      icon: 'check',
    })
  } else if (timeline.paymentFailedAt || current.status === 'payment_failed') {
    items.push({
      key: 'failed',
      title: 'Thanh toán thất bại',
      sub: 'Giao dịch chưa được cổng thanh toán chấp nhận.',
      time: timeline.paymentFailedAt,
      state: 'failed',
      icon: 'ban',
    })
  } else {
    items.push({
      key: 'pending',
      title: 'Chờ thanh toán',
      sub: canRetryPaymentNow.value
        ? 'Bạn vẫn có thể tiếp tục thanh toán đơn hàng.'
        : 'Đơn hàng đã hết thời gian thanh toán.',
      time: timeline.paymentExpiresAt || current.paymentExpiresAt,
      state: canRetryPaymentNow.value ? 'active' : 'pending',
      icon: 'clock',
    })
  }

  return items
})

const transactionRows = computed(() => {
  const current = order.value
  if (!current) return []

  const payment = current.paymentDetail || {}
  const timeline = current.paymentTimeline || {}
  return [
    { label: 'Mã giao dịch', value: payment.transactionCode || current.orderCode || 'Chưa có' },
    { label: 'Trạng thái', value: paymentStatusLabel.value },
    { label: 'Số tiền ghi nhận', value: formatMoney(payment.paidAmount || 0) },
    { label: 'Thời điểm thanh toán', value: formatDateTime(payment.paidAt || timeline.paymentCompletedAt) || 'Chưa ghi nhận' },
    { label: 'Hạn thanh toán', value: formatDateTime(timeline.paymentExpiresAt || current.paymentExpiresAt) || 'Không áp dụng' },
  ]
})

const paymentDeadline = computed(() => {
  if (!order.value || !canRetryPaymentNow.value) return ''
  return `Còn ${formatCountdown(order.value)} để hoàn tất thanh toán`
})
</script>

<template>
  <section v-if="order" class="order-detail">
    <button type="button" class="order-detail-back" @click="backToOrders">
      <AppIcon name="chevronLeft" :size="15" />
      Quay lại đơn hàng
    </button>

    <header class="order-detail-head">
      <div>
        <h1 class="order-detail-title">Đơn hàng {{ order.orderCode }}</h1>
        <p class="order-detail-meta">
          <AppIcon name="calendar" :size="14" />
          Đặt ngày {{ formatDate(order.createdAt) }}
        </p>
      </div>
      <div class="order-detail-head-actions">
        <span class="status-badge" :class="order.status">{{ statusLabel }}</span>
        <button
          v-if="shouldShowRetryPayment(order)"
          type="button"
          class="order-pay-btn"
          :disabled="!canRetryPaymentNow || retryingPayment"
          :title="canRetryPaymentNow ? 'Tiếp tục thanh toán đơn hàng' : 'Đơn hàng đã quá hạn thanh toán'"
          @click="handleRetryPayment"
        >
          <AppIcon :name="retryingPayment ? 'refresh' : 'creditCard'" :size="14" :class="{ 'spin-icon': retryingPayment }" />
          {{ retryingPayment ? 'Đang tạo thanh toán...' : 'Thanh toán lại' }}
        </button>
        <button v-if="order.status === 'unpaid' || order.status === 'payment_failed'" type="button" class="order-cancel-btn" @click="handleCancel">
          <AppIcon name="close" :size="14" />
          Huỷ đơn
        </button>
      </div>
    </header>

    <div class="order-detail-grid">
      <div class="order-detail-main">
        <article class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="history" :size="16" />
            Lịch sử giao dịch
          </h2>
          <ol class="transaction-timeline">
            <li
              v-for="item in transactionTimeline"
              :key="item.key"
              class="transaction-timeline-item"
              :class="`is-${item.state}`"
            >
              <span class="transaction-timeline-icon">
                <AppIcon :name="item.icon" :size="14" />
              </span>
              <div>
                <p class="timeline-title">{{ item.title }}</p>
                <p class="timeline-sub">{{ item.sub }}</p>
                <p class="timeline-time">{{ formatDateTime(item.time) || 'Chưa ghi nhận thời điểm' }}</p>
              </div>
            </li>
          </ol>
        </article>

        <article v-if="order.timeline && order.timeline.length" class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="mapPin" :size="16" />
            Trạng thái vận chuyển
          </h2>
          <ol class="timeline">
            <li
              v-for="(step, index) in order.timeline"
              :key="index"
              class="timeline-item"
              :class="{ done: step.done, active: step.active, pending: step.pending }"
            >
              <span class="timeline-dot" />
              <div>
                <p class="timeline-title">{{ step.title }}</p>
                <p class="timeline-sub">{{ step.sub }}</p>
                <p v-if="step.time" class="timeline-time">{{ step.time }}</p>
              </div>
            </li>
          </ol>
        </article>

        <article class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="box" :size="16" />
            Sản phẩm đặt mua
          </h2>
          <div class="order-lines">
            <div v-for="(item, index) in order.items" :key="index" class="order-line">
              <span class="order-line-thumb">
                <img v-if="orderItemImage(item)" :src="orderItemImage(item)" alt="product" class="line-thumb-img" @error="hideBrokenImage" />
                <AppIcon name="image" :size="16" />
              </span>
              <div class="order-line-info">
                <p class="order-line-name">{{ item.productSnapshot?.productName || 'Sản phẩm' }}</p>
                <p v-if="item.productSnapshot?.color || item.productSnapshot?.material" class="order-line-var">
                  {{ [item.productSnapshot?.color, item.productSnapshot?.material].filter(Boolean).join(' - ') }}
                </p>
              </div>
              <span class="order-line-qty">SL: {{ item.quantity }}</span>
              <span class="order-line-price">{{ formatMoney(item.price * item.quantity) }}</span>
              <button
                v-if="order.status === 'done' && orderItemProductId(item)"
                type="button"
                class="order-review-btn"
                @click="reviewProduct(item)"
              >
                <AppIcon name="star" :size="14" />
                Đánh giá
              </button>
            </div>
          </div>
        </article>
      </div>

      <aside class="order-detail-side">
        <article class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="badgePercent" :size="16" />
            Tóm tắt thanh toán
          </h2>
          <div class="summary-rows">
            <div class="summary-row"><span>Tạm tính</span><span>{{ formatMoney(order.subTotal) }}</span></div>
            <div class="summary-row">
              <span>Phí vận chuyển</span>
              <span>{{ order.fee?.shippingFee ? formatMoney(order.fee.shippingFee) : 'Miễn phí' }}</span>
            </div>
            <div v-if="order.fee?.shippingDiscount" class="summary-row">
              <span>Giảm giá vận chuyển</span>
              <span>−{{ formatMoney(order.fee.shippingDiscount) }}</span>
            </div>
            <div v-if="order.fee?.discountAmount" class="summary-row">
              <span>Giảm giá</span>
              <span>−{{ formatMoney(order.fee.discountAmount) }}</span>
            </div>
            <div class="summary-row total">
              <span>Tổng cộng</span>
              <span>{{ formatMoney(order.totalAmount) }}</span>
            </div>
          </div>
          <p class="payment-label">Phương thức thanh toán</p>
          <p class="payment-value">{{ order.paymentDetail?.paymentMethod || 'Chưa rõ' }}</p>
          <p v-if="paymentDeadline" class="payment-deadline">{{ paymentDeadline }}</p>
        </article>

        <article class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="creditCard" :size="16" />
            Thông tin giao dịch
          </h2>
          <div class="transaction-rows">
            <div v-for="row in transactionRows" :key="row.label" class="transaction-row">
              <span>{{ row.label }}</span>
              <strong>{{ row.value }}</strong>
            </div>
          </div>
        </article>

        <article v-if="order.shippingDetail" class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="mapPin" :size="16" />
            Địa chỉ giao hàng
          </h2>
          <p class="address-block">
            <strong>{{ order.shippingDetail.shippingAddressName }}</strong>
            {{ order.shippingDetail.shippingAddressPhone }}<br>
            {{ order.shippingDetail.shippingAddressDetail }}
          </p>
        </article>

        <article v-if="order.shippingDetail?.shippingMethod" class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="truck" :size="16" />
            Thông tin vận chuyển
          </h2>
          <div class="summary-rows">
            <div class="summary-row"><span>Đơn vị</span><span>{{ order.shippingDetail.shippingMethod }}</span></div>
          </div>
        </article>
      </aside>
    </div>

    <ConfirmDialog
      :open="cancelDialogOpen"
      title="Xác nhận hủy đơn"
      :message="`Bạn có chắc muốn hủy đơn ${order.orderCode}? Thao tác này không thể hoàn tác.`"
      confirm-label="Hủy đơn"
      cancel-label="Giữ đơn"
      :loading="canceling"
      danger
      @close="closeCancelDialog"
      @confirm="confirmCancel"
    />
  </section>

  <p v-else class="order-detail-missing">Không tìm thấy đơn hàng.</p>
</template>

<style scoped>
.order-detail { display: grid; gap: 1rem; }
.order-detail-back {
  border: none; background: none; color: var(--auth-brand-start, #c9922a);
  font-size: 0.82rem; cursor: pointer; padding: 0; width: fit-content;
  display: inline-flex; align-items: center; gap: 0.3rem;
}
.order-detail-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;
}
.order-detail-title { margin: 0; font-size: 1.6rem; font-weight: 500; }
.order-detail-meta {
  margin: 0.35rem 0 0; font-size: 0.78rem; color: var(--auth-text-secondary);
  display: inline-flex; align-items: center; gap: 0.3rem;
}
.order-detail-head-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
}

.status-badge {
  padding: 0.35rem 0.7rem;
  border-radius: 20px;
  font-size: 0.72rem;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fdf6e8;
  color: #c9922a;
}

.status-badge.unpaid {
  background: #fdf6e8;
  color: #c9922a;
}

.status-badge.payment_failed {
  background: #fff0df;
  color: #b95e00;
}

.status-badge.paid {
  background: #eef5ff;
  color: #2364a8;
}

.status-badge.delivering {
  background: #eaf5ef;
  color: #2a7a50;
}

.status-badge.done {
  background: #f0f0f0;
  color: #555;
}

.status-badge.cancel {
  background: #fdf0ee;
  color: #c0392b;
}

.order-cancel-btn {
  border: 1px solid #e8c5c0;
  border-radius: 9px;
  padding: 0.45rem 0.75rem;
  background: #fff;
  color: #c0392b;
  font-size: 0.78rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.order-cancel-btn:hover {
  background: #fdf0ee;
}

.order-pay-btn {
  border: none;
  border-radius: 9px;
  padding: 0.45rem 0.75rem;
  background: #c9922a;
  color: #fff;
  font-size: 0.78rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.order-pay-btn:hover {
  background: #a9781e;
}
.order-pay-btn:disabled {
  background: #b7b0a5;
  cursor: not-allowed;
  opacity: 0.78;
}
.spin-icon { animation: order-spin 0.8s linear infinite; }
@keyframes order-spin { to { transform: rotate(360deg); } }
.order-detail-grid {
  display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 1rem; align-items: start;
}
.detail-card {
  background: #fff; border: 1px solid var(--auth-border, #e0d9ce);
  border-radius: 12px; padding: 1rem; margin-bottom: 0.85rem;
}
.detail-card-title {
  margin: 0 0 0.85rem; font-size: 0.9rem; font-weight: 600;
  display: inline-flex; align-items: center; gap: 0.4rem;
}
.timeline { list-style: none; margin: 0; padding: 0 0 0 0.5rem; }
.timeline-item {
  position: relative; padding-left: 1.25rem; padding-bottom: 1rem;
  border-left: 2px solid var(--auth-border, #e0d9ce);
}
.timeline-item:last-child { border-left-color: transparent; padding-bottom: 0; }
.timeline-dot {
  position: absolute; left: -0.45rem; top: 0.2rem; width: 0.7rem; height: 0.7rem;
  border-radius: 50%; background: var(--auth-border); border: 2px solid #fff;
}
.timeline-item.done .timeline-dot { background: #2a7a50; }
.timeline-item.active .timeline-dot { background: #c9922a; }
.timeline-title { margin: 0; font-size: 0.82rem; font-weight: 600; }
.timeline-sub { margin: 0.2rem 0 0; font-size: 0.75rem; color: var(--auth-text-secondary); }
.timeline-time { margin: 0.25rem 0 0; font-size: 0.68rem; color: var(--auth-text-secondary); }
.timeline-item.pending .timeline-title { color: var(--auth-text-secondary); }
.transaction-timeline { list-style: none; margin: 0; padding: 0; display: grid; }
.transaction-timeline-item {
  position: relative; display: grid; grid-template-columns: 32px minmax(0, 1fr);
  gap: 0.65rem; padding-bottom: 1rem;
}
.transaction-timeline-item:not(:last-child)::before {
  content: ''; position: absolute; left: 15px; top: 30px; bottom: 0;
  width: 2px; background: var(--auth-border, #e0d9ce);
}
.transaction-timeline-item:last-child { padding-bottom: 0; }
.transaction-timeline-icon {
  width: 32px; height: 32px; border-radius: 50%; display: inline-flex;
  align-items: center; justify-content: center; color: #777;
  background: #f3eee6; border: 1px solid var(--auth-border, #e0d9ce); z-index: 1;
}
.transaction-timeline-item.is-done .transaction-timeline-icon { color: #fff; background: #2a7a50; border-color: #2a7a50; }
.transaction-timeline-item.is-active .transaction-timeline-icon { color: #fff; background: #c9922a; border-color: #c9922a; }
.transaction-timeline-item.is-failed .transaction-timeline-icon { color: #fff; background: #c0392b; border-color: #c0392b; }
.transaction-timeline-item.is-pending { opacity: 0.68; }
.order-lines { display: grid; gap: 0; }
.order-line {
  display: grid; grid-template-columns: 64px minmax(0, 1fr) auto auto auto;
  gap: 0.65rem; align-items: center; padding: 0.85rem 0;
  border-bottom: 1px solid var(--auth-border);
}
.order-line:last-child { border-bottom: none; }
.order-line-thumb {
  width: 64px; height: 64px; border-radius: 9px; background: #f5f0e8;
  display: grid; place-items: center; font-size: 1.6rem; overflow: hidden;
  position: relative;
}
.line-thumb-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;
}
.order-line-cat { margin: 0; font-size: 0.65rem; color: #c9922a; font-weight: 600; text-transform: uppercase; }
.order-line-name { margin: 0.15rem 0 0; font-size: 0.84rem; font-weight: 500; }
.order-line-var { margin: 0.15rem 0 0; font-size: 0.72rem; color: var(--auth-text-secondary); }
.order-line-qty { font-size: 0.75rem; color: var(--auth-text-secondary); }
.order-line-price { font-size: 0.82rem; font-weight: 600; white-space: nowrap; }
.order-review-btn {
  min-height: 34px;
  padding: 0.4rem 0.7rem;
  border: 1px solid #c9922a;
  border-radius: 8px;
  background: #fffaf0;
  color: #9a6817;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.order-review-btn:hover { background: #c9922a; color: #fff; }
.summary-rows { display: grid; gap: 0.35rem; }
.summary-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--auth-text-secondary); }
.summary-row.total { font-weight: 600; color: var(--account-field-text); border-top: 1px solid var(--auth-border); padding-top: 0.5rem; margin-top: 0.25rem; }
.payment-label { margin: 0.85rem 0 0.25rem; font-size: 0.72rem; color: var(--auth-text-secondary); }
.payment-value { margin: 0; font-size: 0.82rem; font-weight: 500; }
.payment-deadline { margin: 0.5rem 0 0; font-size: 0.74rem; color: #c9922a; font-weight: 500; }
.transaction-rows { display: grid; }
.transaction-row {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid var(--auth-border, #e0d9ce);
  font-size: 0.76rem;
}
.transaction-row:last-child { border-bottom: none; }
.transaction-row span { color: var(--auth-text-secondary); }
.transaction-row strong { text-align: right; font-weight: 500; overflow-wrap: anywhere; }
.address-block { margin: 0; font-size: 0.8rem; line-height: 1.6; color: var(--auth-text-secondary); }
.order-detail-missing { color: var(--auth-text-secondary); }
@media (max-width: 980px) {
  .order-detail-grid { grid-template-columns: 1fr; }
  .order-line { grid-template-columns: 64px minmax(0, 1fr); }
  .order-line-qty,
  .order-line-price,
  .order-review-btn { grid-column: 2; justify-self: start; }
  .transaction-row { grid-template-columns: 1fr; gap: 0.2rem; }
  .transaction-row strong { text-align: left; }
}
</style>
