<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { conditionText, discountLabel, formatDate, isExpiring, isShippingVoucher } from '../lib/voucherPresentation'

const props = defineProps({
  filteredVouchers: { type: Array, default: () => [] },
  activeFilter: { type: String, default: 'all' },
  voucherTotal: { type: Number, default: 0 },
  claimingCode: { type: String, default: '' },
  hasMoreVouchers: { type: Boolean, default: false },
  loadingMoreVouchers: { type: Boolean, default: false },
})

const emit = defineEmits([
  'start-drag',
  'move-drag',
  'stop-drag',
  'view-detail',
  'claim',
  'use-now',
  'load-more'
])

const { t } = useI18n()

const voucherRail = ref(null)

defineExpose({
  voucherRail
})
</script>

<template>
  <section id="voucher-section" class="promo-section">
    <div class="promo-section-head">
      <div>
        <p>{{ t('promotions.sections.voucherKicker') }}</p>
        <h2>{{ t('promotions.sections.voucherTitle') }}</h2>
      </div>
      <span class="promo-count">{{ t('promotions.voucher.count', { count: activeFilter === 'saved' ? filteredVouchers.length : voucherTotal }) }}</span>
    </div>

    <div
      v-if="filteredVouchers.length"
      ref="voucherRail"
      class="voucher-rail"
      @pointerdown="emit('start-drag', $event)"
      @pointermove="emit('move-drag', $event)"
      @pointerup="emit('stop-drag', $event)"
      @pointercancel="emit('stop-drag', $event)"
      @pointerleave="emit('stop-drag', $event)"
    >
      <article v-for="voucher in filteredVouchers" :key="voucher.id" class="voucher-card" :class="{ disabled: voucher.used || !voucher.active }">
        <div class="voucher-stub">
          <span>{{ isShippingVoucher(voucher) ? 'Freeship' : 'Voucher' }}</span>
          <strong>{{ voucher.code }}</strong>
        </div>
        <div class="voucher-body">
          <AppButton type="button" class="info-btn" @click="emit('view-detail', voucher)" :aria-label="t('promotions.voucher.detail')">
            <AppIcon name="info" :size="14" />
          </AppButton>
          <h3>{{ discountLabel(voucher) }}</h3>
          <p>{{ voucher.description || conditionText(voucher) }}</p>
          <div class="voucher-meta">
            <span><AppIcon name="creditCard" :size="13" />{{ conditionText(voucher) }}</span>
            <span :class="{ danger: isExpiring(voucher.endDate) }"><AppIcon name="calendar" :size="13" />{{ t('promotions.voucher.expires', { date: formatDate(voucher.endDate) }) }}</span>
          </div>
          <div class="voucher-footer">
            <span class="status" :class="{ saved: voucher.saved, used: voucher.used }">
              {{ voucher.used ? t('promotions.voucher.used') : voucher.saved ? t('promotions.voucher.saved') : t('promotions.voucher.notClaimed') }}
            </span>
            <AppButton
              v-if="!voucher.saved && !voucher.used"
              type="button"
              class="claim-btn"
              :disabled="claimingCode === voucher.code"
              @click="emit('claim', voucher)"
            >
              <AppIcon name="download" :size="14" />{{ t('promotions.voucher.claim') }}
            </AppButton>
            <AppButton v-else-if="!voucher.used" type="button" class="claim-btn outline" @click="emit('use-now', voucher)">
              <AppIcon name="cart" :size="14" />{{ t('promotions.voucher.useNow') }}
            </AppButton>
            <AppButton v-else type="button" class="claim-btn muted" disabled>{{ t('promotions.voucher.used') }}</AppButton>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="empty-state">{{ t('promotions.empty.vouchers') }}</div>
    <div v-if="activeFilter !== 'saved' && hasMoreVouchers" class="load-more-wrap">
      <AppButton type="button" class="load-more" :disabled="loadingMoreVouchers" @click="emit('load-more')">
        {{ loadingMoreVouchers ? t('common.loading') : t('promotions.voucher.loadMore') }}
      </AppButton>
    </div>
  </section>
</template>
