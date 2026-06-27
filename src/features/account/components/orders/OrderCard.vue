<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { PriceFormatter } from '@shared/lib/formatters'
import { formatDate as formatDisplayDate } from '@shared/lib/formatters'
import {
  canRetryOrderPayment,
  isOrderPaymentExpired,
  shouldShowRetryPayment,
} from '@shared/lib/api/services/orders/orders.model'
import { usePaymentCountdown } from '../../composables/usePaymentCountdown'

const props = defineProps({
  order: { type: Object, required: true },
  isRetrying: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'pay', 'detail'])
const { t } = useI18n()
const { formatCountdown, isPaymentTimeRemaining } = usePaymentCountdown()

const formatMoney = PriceFormatter.format
const formatDate = (dateStr) => formatDisplayDate(dateStr)

const CANCELABLE_ORDER_STATUSES = ['unpaid', 'payment_failed', 'paid', 'shipping']

const statusClass = computed(() => {
  const status = props.order.status
  if (status === 'shipping' || status === 'in_transit') return 'shipping'
  if (status === 'delivered' || status === 'refunded') return 'done'
  if (status === 'cancelled') return 'cancel'
  if (status === 'refund_pending') return 'refund'
  if (status === 'payment_failed') return 'failed'
  if (status === 'paid') return 'paid'
  return 'pending'
})

const displayCode = computed(() => props.order.orderCode || t('account.orders.noCode'))

const orderListImg = computed(() => {
  const order = props.order
  return order.firstProductImage
    || order.items?.[0]?.imageUrl
    || order.items?.[0]?.productSnapshot?.imageUrl
    || ''
})

const canRetry = computed(() => canRetryOrderPayment(props.order))
const showRetry = computed(() => shouldShowRetryPayment(props.order))

const retryTitle = computed(() => {
  if (canRetry.value) return t('account.orders.retryTitle.available')
  if (isOrderPaymentExpired(props.order)) return t('account.orders.retryTitle.expired')
  return t('account.orders.retryTitle.unavailable')
})

const paymentDeadline = computed(() => {
  if (!canRetry.value || !props.order.paymentExpiresAt || !isPaymentTimeRemaining(props.order)) return ''
  return t('account.orders.deadlineList', { time: formatCountdown(props.order) })
})

const canCancel = computed(() => CANCELABLE_ORDER_STATUSES.includes(props.order.status))

const displayStatusLabel = computed(() => {
  if (props.order.statusLabel) return props.order.statusLabel
  const rawStatus = String(props.order.status || 'unpaid').toLowerCase()
  return t(`account.orders.status.${rawStatus}`) ?? props.order.status
})
</script>

<template>
  <article class="order-card">
    <div class="order-card-head">
      <div>
        <p class="order-code">{{ displayCode }}</p>
        <p class="order-meta">{{ formatDate(order.createdAt) }}</p>
        <p v-if="paymentDeadline" class="order-payment-deadline">
          {{ paymentDeadline }}
        </p>
      </div>
      <div class="order-card-right">
        <AppBadge :variant="statusClass">
          <AppIcon v-if="order.status === 'shipping' || order.status === 'in_transit'" name="truck" :size="14" />
          {{ displayStatusLabel }}
        </AppBadge>
        <strong class="order-total">{{ formatMoney(order.totalAmount) }}</strong>
      </div>
    </div>

    <div class="order-card-foot">
      <div class="order-thumbs">
        <AppImage :src="orderListImg" class="order-thumb" alt="product" />
      </div>
      <div class="order-card-actions">
        <AppButton
          v-if="canCancel"
          type="button"
          class="order-cancel-btn"
          @click="$emit('cancel', order)"
        >
          {{ t('account.orders.cancel') }}
        </AppButton>
        <AppButton
          v-if="showRetry"
          type="button"
          class="order-pay-btn"
          :disabled="!canRetry || isRetrying"
          :title="retryTitle"
          @click="$emit('pay', order)"
        >
          <AppIcon :name="isRetrying ? 'refresh' : 'creditCard'" :size="15" :class="{ 'spin-icon': isRetrying }" />
          {{ isRetrying ? t('account.orders.creatingPayment') : t('account.orders.retryPayment') }}
        </AppButton>
        <AppButton type="button" class="order-detail-btn" :disabled="!order.orderCode" @click="$emit('detail', order.orderCode)">
          <AppIcon name="eye" :size="15" />
          {{ t('account.orders.viewDetail') }}
        </AppButton>
      </div>
    </div>
  </article>
</template>

<style scoped>
.order-card {
  background: var(--acc-surface, var(--app-surface));
  border: 1px solid var(--acc-line, var(--app-border));
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

.status-badge.refund {
  background: #fff6e6;
  color: #9a6500;
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

.order-thumb {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 8px;
  font-size: 1.25rem;
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
  background: var(--acc-surface, var(--app-surface));
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

.order-pay-btn:disabled {
  background: #b7b0a5;
  cursor: not-allowed;
  opacity: 0.78;
}

.spin-icon {
  animation: order-spin 0.8s linear infinite;
}

@keyframes order-spin {
  to { transform: rotate(360deg); }
}

.order-detail-btn {
  border: none;
  border-radius: 9px;
  padding: 0.55rem 0.85rem;
  background: var(--acc-ink, var(--app-heading));
  color: var(--app-bg);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}


</style>
