<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import ConfirmDialog from '@shared/ui/ConfirmDialog.vue'
import OrderCard from '../orders/OrderCard.vue'
import { useOrdersView } from '../../composables/useOrdersView'

const emit = defineEmits(['notify'])
const { t } = useI18n()
const {
  filter,
  filteredOrders,
  cancelTarget,
  canceling,
  filterOptions,
  statusLabels,
  openOrderDetail,
  handleCancel,
  closeCancelDialog,
  confirmCancel,
  handleRetryPayment,
  isRetrying,
  displayCode,
} = useOrdersView((msg, type) => emit('notify', msg, type))
</script>

<template>
  <section class="orders-view">
    <h2 class="orders-title">
      <AppIcon name="box" :size="20" />
      {{ t('account.orders.title') }}
    </h2>

    <div class="orders-filters">
      <AppButton
        v-for="item in filterOptions"
        :key="item"
        type="button"
        variant="unstyled"
        class="order-filter-btn"
        :class="{ active: filter === item }"
        @click="filter = item"
      >
        {{ statusLabels[item] ?? item }}
      </AppButton>
    </div>

    <div class="orders-list">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.orderCode || order.id"
        :order="order"
        :is-retrying="isRetrying(order)"
        @cancel="handleCancel(order, $event)"
        @pay="handleRetryPayment(order, $event)"
        @detail="openOrderDetail"
      />

      <p v-if="!filteredOrders.length" class="orders-empty">
        <AppIcon name="box" :size="14" />
        {{ t('account.orders.empty') }}
      </p>
    </div>

    <ConfirmDialog
      :open="Boolean(cancelTarget)"
      :title="t('account.orders.cancelDialogTitle')"
      :message="t('account.orders.cancelDialogMessage', { code: cancelTarget ? displayCode(cancelTarget) : '' })"
      :confirm-label="t('account.orders.cancelConfirm')"
      :cancel-label="t('account.orders.keepOrder')"
      :loading="canceling"
      danger
      @close="closeCancelDialog"
      @confirm="confirmCancel"
    />
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

.orders-filters .order-filter-btn {
  border: 1px solid var(--acc-line, var(--app-border));
  background: var(--acc-surface, var(--app-surface));
  color: var(--acc-muted, var(--app-text-muted));
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.orders-filters .order-filter-btn.active {
  border-color: var(--auth-brand-start, #c9922a);
  color: var(--auth-brand-start, #c9922a);
}

.orders-list {
  display: grid;
  gap: 0.85rem;
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
