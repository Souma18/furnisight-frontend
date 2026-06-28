<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { formatCurrency } from '../lib/voucherPresentation'

const props = defineProps({
  activeVoucherCount: { type: Number, default: 0 },
  comboTotal: { type: Number, default: 0 },
  maxSavedAmount: { type: Number, default: 0 },
})

const emit = defineEmits(['scroll-to'])
const { t } = useI18n()
</script>

<template>
  <section class="promo-hero">
    <nav class="promo-breadcrumb" aria-label="Breadcrumb">
      <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
      <span>›</span>
      <span>{{ t('nav.promotions') }}</span>
    </nav>
    <div class="promo-hero-inner">
      <div class="promo-hero-copy">
        <p class="promo-eyebrow">{{ t('promotions.hero.eyebrow') }}</p>
        <h1>{{ t('promotions.hero.titlePrefix') }} <em>{{ t('promotions.hero.titleEmphasis') }}</em></h1>
        <p class="promo-desc">
          {{ t('promotions.hero.subtitle') }}
        </p>
        <div class="promo-actions">
          <AppButton type="button" class="promo-btn primary" @click="emit('scroll-to', 'voucher-section')">
            <AppIcon name="badgePercent" :size="16" />{{ t('promotions.hero.claimVoucher') }}
          </AppButton>
          <AppButton type="button" class="promo-btn ghost" @click="emit('scroll-to', 'combo-section')">
            <AppIcon name="armchair" :size="16" />{{ t('promotions.hero.viewCombos') }}
          </AppButton>
        </div>
      </div>

      <aside class="promo-overview" :aria-label="t('promotions.hero.overviewAria')">
        <p class="promo-overview-label">{{ t('promotions.hero.overviewLabel') }}</p>
        <div class="promo-stats">
          <span><b>{{ activeVoucherCount }}</b><small>{{ t('promotions.hero.availableVouchers') }}</small></span>
          <span><b>{{ comboTotal }}</b><small>{{ t('promotions.hero.comboDeals') }}</small></span>
          <span><b>{{ formatCurrency(maxSavedAmount) }}</b><small>{{ t('promotions.hero.highlightSaving') }}</small></span>
        </div>
        <p class="promo-overview-note">{{ t('promotions.hero.overviewNote') }}</p>
      </aside>
    </div>
  </section>
</template>
