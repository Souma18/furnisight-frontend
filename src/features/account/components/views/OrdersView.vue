<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAccountOrders } from '../../composables/useAccountOrders'
import { ORDER_STATUS_LABELS } from '../../composables/orderStatusLabels'
import { canRetryOrderPayment } from '@shared/lib/api/services/orders/orders.model'
import { PriceFormatter } from '@shared/lib/formatters'

const emit = defineEmits(['notify'])

const {
  filter,
  filteredOrders,
  openOrderDetail,
  cancelOrder,
  retryPayment,
} = useAccountOrders((msg, type) => emit('notify', msg, type))

function handleCancel(order, event) {
  event?.stopPropagation?.()
  if (!confirm(`Huỷ đơn ${displayCode(order)}?`)) return
  cancelOrder(order.orderCode || order.id)
}

function handleRetryPayment(order, event) {
  event?.stopPropagation?.()
  retryPayment(order)
}

const filterOptions = ['all', 'unpaid', 'payment_failed', 'paid', 'delivering', 'done', 'cancel']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? dateStr : new Intl.DateTimeFormat('vi-VN').format(date)
}

const formatMoney = PriceFormatter.format

function statusClass(status) {
  if (status === 'delivering') return 'shipping'
  if (status === 'done') return 'done'
  if (status === 'cancel') return 'cancel'
  if (status === 'payment_failed') return 'failed'
  if (status === 'paid') return 'paid'
  return 'pending'
}

function displayCode(order) {
  return order.orderCode ?? order.id
}

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}

function formatPaymentDeadline(order) {
  if (!canRetryOrderPayment(order) || !order.paymentExpiresAt) return ''
  const ms = new Date(order.paymentExpiresAt).getTime() - Date.now()
  if (ms <= 0) return ''
  const minutes = Math.max(1, Math.ceil(ms / 60000))
  return `Còn ${minutes} phút để thanh toán`
}
</script>

<template>
  <section class="orders-view">
    <h2 class="orders-title">
      <AppIcon name="box" :size="20" />
      Đơn hàng của tôi
    </h2>

    <div class="orders-filters">
      <button
        v-for="item in filterOptions"
        :key="item"
        type="button"
        :class="{ active: filter === item }"
        @click="filter = item"
      >
        {{ ORDER_STATUS_LABELS[item] ?? item }}
      </button>
    </div>

    <div class="orders-list">
      <article v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-card-head">
          <div>
            <p class="order-code">{{ displayCode(order) }}</p>
            <p class="order-meta">{{ formatDate(order.createdAt) }}</p>
            <p v-if="formatPaymentDeadline(order)" class="order-payment-deadline">
              {{ formatPaymentDeadline(order) }}
            </p>
          </div>
          <div class="order-card-right">
            <span class="status-badge" :class="statusClass(order.status)">
              <AppIcon v-if="order.status === 'delivering'" name="truck" :size="14" />
              {{ ORDER_STATUS_LABELS[order.status] ?? order.status }}
            </span>
            <strong class="order-total">{{ formatMoney(order.totalAmount) }}</strong>
          </div>
        </div>

        <div class="order-card-foot">
          <div class="order-thumbs">
            <span class="order-thumb">
              <img v-if="order.firstProductImage" :src="order.firstProductImage" class="order-thumb-img" alt="product" @error="hideBrokenImage" />
              <AppIcon name="image" :size="16" />
            </span>
          </div>
          <div class="order-card-actions">
            <button
              v-if="order.status === 'unpaid' || order.status === 'payment_failed'"
              type="button"
              class="order-cancel-btn"
              @click="handleCancel(order, $event)"
            >
              Huỷ đơn
            </button>
            <button
              v-if="canRetryOrderPayment(order)"
              type="button"
              class="order-pay-btn"
              @click="handleRetryPayment(order, $event)"
            >
              <AppIcon name="creditCard" :size="15" />
              Thanh toán lại
            </button>
            <button type="button" class="order-detail-btn" @click="openOrderDetail(order.orderCode || order.id)">
              <AppIcon name="eye" :size="15" />
              Xem chi tiết
            </button>
          </div>
        </div>
      </article>

      <p v-if="!filteredOrders.length" class="orders-empty">
        <AppIcon name="box" :size="14" />
        Không có đơn hàng ở trạng thái này.
      </p>
    </div>
  </section>
</template>

<style scoped>
.orders-view {
  display: grid;
  gap: 1rem;
}

.orders-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--account-field-text, #1a1812);
}

.orders-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.orders-filters button {
  border: 1px solid var(--auth-border, #e0d9ce);
  background: var(--account-surface, #fff);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.orders-filters button.active {
  border-color: var(--auth-brand-start, #c9922a);
  color: var(--auth-brand-start, #c9922a);
}

.orders-list {
  display: grid;
  gap: 0.85rem;
}

.order-card {
  background: #fff;
  border: 1px solid var(--auth-border, #e0d9ce);
  border-radius: 12px;
  padding: 1rem 1.1rem;
}

.order-card-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.order-code {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
}

.order-meta {
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
  color: var(--auth-text-secondary, #6b6560);
}

.order-payment-deadline {
  margin: 0.3rem 0 0;
  font-size: 0.72rem;
  color: #c9922a;
  font-weight: 500;
}

.order-card-right {
  text-align: right;
  display: grid;
  gap: 0.35rem;
  justify-items: end;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 500;
}

.status-badge.shipping {
  background: #eaf5ef;
  color: #2a7a50;
}

.status-badge.pending {
  background: #fdf6e8;
  color: #c9922a;
}

.status-badge.done {
  background: #f0f0f0;
  color: #555;
}

.status-badge.failed {
  background: #fff0df;
  color: #b95e00;
}

.status-badge.paid {
  background: #eef5ff;
  color: #2364a8;
}

.status-badge.cancel {
  background: #fdf0ee;
  color: #c0392b;
}

.order-total {
  font-size: 1rem;
  color: var(--auth-brand-start, #c9922a);
}

.order-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.order-thumbs {
  display: flex;
  gap: 0.45rem;
}

.order-thumb, .order-thumb-img, .order-thumb-more {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 8px;
  background: #f5f0e8;
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  object-fit: cover;
}
.order-thumb {
  position: relative;
  overflow: hidden;
}
.order-thumb-img {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.order-thumb-more {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--auth-brand-start, #c9922a);
}

.order-card-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.order-cancel-btn {
  border: 1px solid #e8c5c0;
  border-radius: 9px;
  padding: 0.55rem 0.85rem;
  background: #fff;
  color: #c0392b;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
}

.order-cancel-btn:hover {
  background: #fdf0ee;
}

.order-pay-btn {
  border: none;
  border-radius: 9px;
  padding: 0.55rem 0.85rem;
  background: #c9922a;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.order-pay-btn:hover {
  background: #a9781e;
}

.order-detail-btn {
  border: none;
  border-radius: 9px;
  padding: 0.55rem 0.85rem;
  background: #12202e;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.orders-empty {
  margin: 0;
  color: var(--auth-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.84rem;
}
</style>
