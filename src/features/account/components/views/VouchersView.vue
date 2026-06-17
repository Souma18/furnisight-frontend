<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAccountVouchers } from '../../composables/useAccountVouchers'
import {
  conditionText,
  discountLabel,
  formatDate,
  isShippingVoucher,
  voucherStatusClass,
  voucherStatusLabel,
} from '@features/promotions/lib/voucherPresentation'

const emit = defineEmits(['notify'])
const {
  loading,
  typeFilter,
  timeFilter,
  typeOptions,
  timeOptions,
  filteredVouchers,
  fetchVouchers,
  copyCode,
} = useAccountVouchers((message, type) => emit('notify', message, type))
</script>

<template>
  <section class="vouchers-view">
    <header class="vouchers-head">
      <h2>
        <AppIcon name="badgePercent" :size="20" />
        Voucher của tôi
      </h2>
      <button type="button" class="refresh-btn" :disabled="loading" @click="fetchVouchers">
        <AppIcon name="refresh" :size="15" />
        Làm mới
      </button>
    </header>

    <div class="voucher-filters">
      <label>
        <span>Loại voucher</span>
        <select v-model="typeFilter">
          <option v-for="option in typeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label>
        <span>Thời gian</span>
        <select v-model="timeFilter">
          <option v-for="option in timeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="loading" class="voucher-state">
      <AppIcon name="refresh" :size="16" />
      Đang tải voucher...
    </div>

    <div v-else class="voucher-list">
      <article v-for="voucher in filteredVouchers" :key="voucher.id || voucher.code" class="voucher-card">
        <div class="voucher-mark">
          <AppIcon :name="isShippingVoucher(voucher) ? 'truck' : 'badgePercent'" :size="22" />
        </div>
        <div class="voucher-info">
          <div class="voucher-title-row">
            <h3>{{ voucher.name || voucher.code }}</h3>
            <span class="voucher-status" :class="voucherStatusClass(voucher)">{{ voucherStatusLabel(voucher) }}</span>
          </div>
          <p class="voucher-code">{{ voucher.code }}</p>
          <p class="voucher-discount">{{ discountLabel(voucher) }}</p>
          <p class="voucher-meta">
            {{ conditionText(voucher) }} · HSD {{ formatDate(voucher.endDate) }}
          </p>
        </div>
        <button type="button" class="copy-btn" @click="copyCode(voucher.code)">
          <AppIcon name="copy" :size="15" />
          Sao chép
        </button>
      </article>

      <p v-if="!filteredVouchers.length" class="voucher-state">
        <AppIcon name="badgePercent" :size="16" />
        Không có voucher phù hợp bộ lọc.
      </p>
    </div>
  </section>
</template>

<style scoped>
.vouchers-view {
  display: grid;
  gap: 1rem;
}

.vouchers-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.vouchers-head h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--account-field-text, #1a1812);
}

.refresh-btn,
.copy-btn {
  border: 1px solid var(--auth-border, #e0d9ce);
  background: var(--account-surface, #fff);
  color: var(--account-field-text, #1a1812);
  border-radius: 10px;
  min-height: 2.25rem;
  padding: 0 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.voucher-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 220px));
  gap: 0.75rem;
}

.voucher-filters label {
  display: grid;
  gap: 0.35rem;
  color: var(--auth-text-secondary, #6b6560);
  font-size: 0.78rem;
}

.voucher-filters select {
  min-height: 2.45rem;
  border: 1px solid var(--auth-border, #e0d9ce);
  border-radius: 10px;
  padding: 0 0.7rem;
  background: var(--account-field-bg, #fff);
  color: var(--account-field-text, #1a1812);
}

.voucher-list {
  display: grid;
  gap: 0.8rem;
}

.voucher-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  background: var(--account-surface, #fff);
  border: 1px solid var(--auth-border, #e0d9ce);
  border-radius: 14px;
  padding: 1rem;
}

.voucher-mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #8a5c00;
  background: color-mix(in srgb, var(--auth-brand-start, #c9922a) 18%, var(--account-surface, #fff));
}

.voucher-info {
  min-width: 0;
}

.voucher-title-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.voucher-title-row h3 {
  margin: 0;
  font-size: 0.98rem;
  color: var(--account-field-text, #1a1812);
}

.voucher-code {
  margin: 0.25rem 0 0;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--auth-brand-start, #c9922a);
}

.voucher-discount {
  margin: 0.35rem 0 0;
  color: var(--account-field-text, #1a1812);
  font-weight: 500;
}

.voucher-meta {
  margin: 0.25rem 0 0;
  color: var(--auth-text-secondary, #6b6560);
  font-size: 0.78rem;
}

.voucher-status {
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  background: var(--account-ghost-bg, #eef2f7);
  color: var(--account-text-strong, #334155);
}

.voucher-status.active {
  background: color-mix(in srgb, var(--account-stat-success, #15803d) 12%, var(--account-surface, #fff));
  color: var(--account-stat-success, #15803d);
}

.voucher-status.expiring,
.voucher-status.upcoming {
  background: color-mix(in srgb, var(--auth-brand-start, #c9922a) 14%, var(--account-surface, #fff));
  color: #946200;
}

.voucher-status.expired,
.voucher-status.off {
  background: color-mix(in srgb, var(--account-stat-danger, #be123c) 10%, var(--account-surface, #fff));
  color: var(--account-stat-danger, #be123c);
}

.voucher-state {
  border: 1px dashed var(--auth-border, #e0d9ce);
  border-radius: 14px;
  padding: 1.4rem;
  color: var(--auth-text-secondary, #6b6560);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

@media (max-width: 720px) {
  .voucher-filters,
  .voucher-card {
    grid-template-columns: 1fr;
  }

  .copy-btn {
    width: 100%;
  }
}
</style>
