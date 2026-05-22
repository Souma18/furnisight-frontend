<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { ORDER_STATUS_LABELS } from '../../mock/ordersMockData'

const props = defineProps({
  order: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['back', 'cancel-order'])

function handleCancel() {
  if (!props.order || props.order.status !== 'pending') return
  if (!confirm(`Huỷ đơn ${props.order.orderCode}?`)) return
  emit('cancel-order', props.order.id)
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

const statusLabel = computed(() => ORDER_STATUS_LABELS[props.order?.status] ?? props.order?.status ?? '')
</script>

<template>
  <section v-if="order" class="order-detail">
    <button type="button" class="order-detail-back" @click="$emit('back')">
      ← Quay lại đơn hàng
    </button>

    <header class="order-detail-head">
      <div>
        <h1 class="order-detail-title">Đơn hàng {{ order.orderCode }}</h1>
        <p class="order-detail-meta">
          <AppIcon name="calendar" :size="14" />
          Đặt ngày {{ order.placedAt }}
        </p>
      </div>
      <div class="order-detail-head-actions">
        <span class="status-badge" :class="order.status">{{ statusLabel }}</span>
        <button v-if="order.status === 'pending'" type="button" class="order-cancel-btn" @click="handleCancel">
          <AppIcon name="close" :size="14" />
          Huỷ đơn
        </button>
      </div>
    </header>

    <div class="order-detail-grid">
      <div class="order-detail-main">
        <article class="detail-card">
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
            <div v-for="(line, index) in order.lines" :key="index" class="order-line">
              <span class="order-line-thumb">{{ line.thumb }}</span>
              <div class="order-line-info">
                <p class="order-line-cat">{{ line.categoryLabel }}</p>
                <p class="order-line-name">{{ line.name }}</p>
                <p class="order-line-var">{{ line.variant }}</p>
              </div>
              <span class="order-line-qty">SL: {{ line.qty }}</span>
              <span class="order-line-price">{{ formatMoney(line.price * line.qty) }}</span>
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
            <div class="summary-row"><span>Tạm tính</span><span>{{ formatMoney(order.summary?.subtotal) }}</span></div>
            <div class="summary-row">
              <span>Vận chuyển</span>
              <span>{{ order.summary?.shipFee ? formatMoney(order.summary.shipFee) : 'Miễn phí' }}</span>
            </div>
            <div v-if="order.summary?.discount" class="summary-row">
              <span>Giảm giá</span>
              <span>−{{ formatMoney(order.summary.discount) }}</span>
            </div>
            <div class="summary-row total">
              <span>Tổng cộng</span>
              <span>{{ formatMoney(order.summary?.total) }}</span>
            </div>
          </div>
          <p class="payment-label">Phương thức thanh toán</p>
          <p class="payment-value">{{ order.paymentLabel }}</p>
        </article>

        <article v-if="order.address" class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="mapPin" :size="16" />
            Địa chỉ giao hàng
          </h2>
          <p class="address-block">
            <strong>{{ order.address.fullName }}</strong>
            {{ order.address.phone }}<br>
            {{ order.address.detail }}, {{ order.address.wardName }}<br>
            {{ order.address.districtName }}, {{ order.address.provinceName }}
          </p>
        </article>

        <article class="detail-card">
          <h2 class="detail-card-title">
            <AppIcon name="truck" :size="16" />
            Thông tin vận chuyển
          </h2>
          <div class="summary-rows">
            <div class="summary-row"><span>Đơn vị</span><span>{{ order.carrier }}</span></div>
            <div v-if="order.trackingCode" class="summary-row">
              <span>Mã vận đơn</span>
              <span>{{ order.trackingCode }}</span>
            </div>
            <div class="summary-row"><span>Dự kiến</span><span>{{ order.eta }}</span></div>
          </div>
        </article>
      </aside>
    </div>
  </section>

  <p v-else class="order-detail-missing">Không tìm thấy đơn hàng.</p>
</template>

<style scoped>
.order-detail { display: grid; gap: 1rem; }
.order-detail-back {
  border: none; background: none; color: var(--auth-brand-start, #c9922a);
  font-size: 0.82rem; cursor: pointer; padding: 0; width: fit-content;
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
.order-lines { display: grid; gap: 0; }
.order-line {
  display: grid; grid-template-columns: 64px minmax(0, 1fr) auto auto;
  gap: 0.65rem; align-items: center; padding: 0.85rem 0;
  border-bottom: 1px solid var(--auth-border);
}
.order-line:last-child { border-bottom: none; }
.order-line-thumb {
  width: 64px; height: 64px; border-radius: 9px; background: #f5f0e8;
  display: grid; place-items: center; font-size: 1.6rem;
}
.order-line-cat { margin: 0; font-size: 0.65rem; color: #c9922a; font-weight: 600; text-transform: uppercase; }
.order-line-name { margin: 0.15rem 0 0; font-size: 0.84rem; font-weight: 500; }
.order-line-var { margin: 0.15rem 0 0; font-size: 0.72rem; color: var(--auth-text-secondary); }
.order-line-qty { font-size: 0.75rem; color: var(--auth-text-secondary); }
.order-line-price { font-size: 0.82rem; font-weight: 600; white-space: nowrap; }
.summary-rows { display: grid; gap: 0.35rem; }
.summary-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--auth-text-secondary); }
.summary-row.total { font-weight: 600; color: var(--account-field-text); border-top: 1px solid var(--auth-border); padding-top: 0.5rem; margin-top: 0.25rem; }
.payment-label { margin: 0.85rem 0 0.25rem; font-size: 0.72rem; color: var(--auth-text-secondary); }
.payment-value { margin: 0; font-size: 0.82rem; font-weight: 500; }
.address-block { margin: 0; font-size: 0.8rem; line-height: 1.6; color: var(--auth-text-secondary); }
.order-detail-missing { color: var(--auth-text-secondary); }
@media (max-width: 980px) {
  .order-detail-grid { grid-template-columns: 1fr; }
  .order-line { grid-template-columns: 64px minmax(0, 1fr); }
}
</style>

