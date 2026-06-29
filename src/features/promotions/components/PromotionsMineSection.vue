<script setup>
import { useI18n } from 'vue-i18n'
import AppButton from '@shared/ui/AppButton.vue'
import { conditionText, discountLabel, formatDate, isExpired } from '../lib/voucherPresentation'

const props = defineProps({
  isAuthenticated: { type: Boolean, default: false },
  filteredSavedVouchers: { type: Array, default: () => [] },
  savedVouchers: { type: Array, default: () => [] },
  typeFilter: { type: String, default: 'all' },
  timeFilter: { type: String, default: 'all' },
  voucherTypeOptions: { type: Array, default: () => [] },
  voucherTimeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['use-now', 'update:typeFilter', 'update:timeFilter'])
const { t } = useI18n()
</script>

<template>
  <section class="promo-section">
    <div class="promo-section-head">
      <div>
        <p>{{ t('promotions.sections.mineKicker') }}</p>
        <h2>{{ t('promotions.sections.mineTitle') }}</h2>
      </div>
      <div class="mine-tools">
        <span class="promo-count">{{ filteredSavedVouchers.length }} / {{ savedVouchers.length }} voucher</span>
        <select :value="typeFilter" @change="emit('update:typeFilter', $event.target.value)" :aria-label="t('promotions.filters.mineTypeAria')">
          <option v-for="option in voucherTypeOptions" :key="`mine-type-${option.value}`" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <select :value="timeFilter" @change="emit('update:timeFilter', $event.target.value)" :aria-label="t('promotions.filters.mineTimeAria')">
          <option v-for="option in voucherTimeOptions" :key="`mine-time-${option.value}`" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div v-if="isAuthenticated && filteredSavedVouchers.length" class="mine-list">
      <article v-for="voucher in filteredSavedVouchers" :key="`mine-${voucher.id}`" class="mine-row">
        <strong>{{ voucher.code }}</strong>
        <span>{{ discountLabel(voucher) }}</span>
        <small>{{ t('promotions.voucher.expires', { date: formatDate(voucher.endDate) }) }}</small>
        <AppButton v-if="!isExpired(voucher.endDate)" variant="unstyled" size="unstyled" type="button" class="claim-btn outline" @click="emit('use-now', voucher)">{{ t('promotions.voucher.useNow') }}</AppButton>
        <AppButton v-else variant="unstyled" size="unstyled" type="button" class="claim-btn muted" disabled>{{ t('promotions.voucher.status.expired') }}</AppButton>
      </article>
    </div>
    <div v-else class="empty-state">
      {{ isAuthenticated ? (savedVouchers.length ? t('promotions.empty.savedFiltered') : t('promotions.empty.savedNone')) : t('promotions.empty.loginToSave') }}
    </div>
  </section>
</template>
