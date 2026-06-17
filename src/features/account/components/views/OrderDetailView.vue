<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import { useOrderDetailView } from '../../composables/useOrderDetailView'

const emit = defineEmits(['notify'])
const {
  order,
  backToOrders,
  cancelDialogOpen,
  canceling,
  retryingPayment,
  canRetryPaymentNow,
  canCancelCurrentOrder,
  statusLabel,
  transactionTimeline,
  transactionRows,
  paymentDeadline,
  shouldShowRetryPayment,
  formatMoney,
  formatDate,
  formatDateTime,
  orderItemImage,
  orderItemProductId,
  openProductDetail,
  reviewProduct,
  hideBrokenImage,
  paymentMethodLabel,
  handleCancel,
  closeCancelDialog,
  confirmCancel,
  handleRetryPayment,
} = useOrderDetailView((msg, type) => emit('notify', msg, type))
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
        <button v-if="canCancelCurrentOrder" type="button" class="order-cancel-btn" @click="handleCancel">
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
              <button
                type="button"
                class="order-line-thumb"
                :class="{ clickable: orderItemProductId(item) }"
                :disabled="!orderItemProductId(item)"
                :aria-label="`Xem chi tiết ${item.productSnapshot?.productName || 'sản phẩm'}`"
                @click="openProductDetail(item)"
              >
                <img v-if="orderItemImage(item)" :src="orderItemImage(item)" alt="product" class="line-thumb-img" @error="hideBrokenImage" />
                <AppIcon name="image" :size="16" />
              </button>
              <div class="order-line-info">
                <button
                  v-if="orderItemProductId(item)"
                  type="button"
                  class="order-line-name order-line-name-btn"
                  @click="openProductDetail(item)"
                >
                  {{ item.productSnapshot?.productName || 'Sản phẩm' }}
                </button>
                <p v-else class="order-line-name">{{ item.productSnapshot?.productName || 'Sản phẩm' }}</p>
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
          <p class="payment-value">{{ paymentMethodLabel(order) }}</p>
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

.status-badge.cod_pending_confirmation {
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

.status-badge.cod_confirmed {
  background: #eef5ff;
  color: #2364a8;
}

.status-badge.in_transit {
  background: #eaf5ef;
  color: #2a7a50;
}

.status-badge.refund_pending {
  background: #fff6e6;
  color: #9a6500;
}

.status-badge.refunded {
  background: #eaf5ef;
  color: #2a7a50;
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
  border: 0;
  padding: 0;
  color: inherit;
}
.order-line-thumb.clickable {
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease;
}
.order-line-thumb.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(18, 32, 46, .16);
}
.order-line-thumb:disabled {
  cursor: default;
}
.line-thumb-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;
}
.order-line-cat { margin: 0; font-size: 0.65rem; color: #c9922a; font-weight: 600; text-transform: uppercase; }
.order-line-name { margin: 0.15rem 0 0; font-size: 0.84rem; font-weight: 500; }
.order-line-name-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 600;
}
.order-line-name-btn:hover {
  color: #c9922a;
  text-decoration: underline;
}
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
