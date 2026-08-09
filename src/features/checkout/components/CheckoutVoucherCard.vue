<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  shopVoucher: { type: Object, default: null },
  shippingVoucher: { type: Object, default: null },
  selectedCombo: { type: Object, default: null },
  comboMessage: { type: String, default: '' },
  formatMoney: { type: Function, required: true },
  shopDiscount: { type: Number, default: 0 },
  shippingDiscount: { type: Number, default: 0 },
  comboDiscount: { type: Number, default: 0 },
})

defineEmits(['open-voucher', 'remove-voucher'])
</script>

<template>
  <section class="checkout-card">
    <div class="checkout-card-head">
      <h2 class="checkout-card-title">
        <AppIcon name="badgePercent" :size="16" />
        {{ $t('checkout.voucher.title') }}
      </h2>
    </div>

    <div class="co-voucher-wrap">
      <div class="co-voucher-row">
        <AppIcon name="tag" :size="17" />
        <span class="co-voucher-label">{{ $t('checkout.voucher.shop') }}</span>
        <div v-if="shopVoucher" class="co-voucher-applied">
          <span class="co-voucher-code">{{ shopVoucher.code }}</span>
          <span v-if="shopDiscount" class="co-voucher-discount">
            -{{ formatMoney(shopDiscount) }}
            <AppIcon name="check" :size="13" />
          </span>
          <AppButton variant="unstyled" type="button" class="co-voucher-remove" :aria-label="$t('checkout.voucher.remove')" @click="$emit('remove-voucher', 'shop')">
            <AppIcon name="close" :size="14" />
          </AppButton>
        </div>
        <AppButton v-else variant="unstyled" type="button" class="co-voucher-btn" @click="$emit('open-voucher', 'shop')">
          {{ $t('checkout.voucher.choose') }}
        </AppButton>
      </div>

      <hr style="border: none; border-top: 1px solid var(--co-cream-dark, #f0e9dd); margin: 0">

      <div class="co-voucher-row">
        <AppIcon name="gift" :size="17" />
        <span class="co-voucher-label">{{ $t('checkout.voucher.combo') }}</span>
        <div v-if="selectedCombo" class="co-voucher-applied">
          <span class="co-voucher-code">{{ selectedCombo.name }}</span>
          <span v-if="comboDiscount" class="co-voucher-discount">
            -{{ formatMoney(comboDiscount) }}
            <AppIcon name="check" :size="13" />
          </span>
        </div>
        <span v-else class="co-voucher-muted">{{ comboMessage || $t('checkout.voucher.noCombo') }}</span>
      </div>

      <hr style="border: none; border-top: 1px solid var(--co-cream-dark, #f0e9dd); margin: 0">

      <div class="co-voucher-row">
        <AppIcon name="truck" :size="17" />
        <span class="co-voucher-label">{{ $t('checkout.voucher.shipping') }}</span>
        <div v-if="shippingVoucher" class="co-voucher-applied">
          <span class="co-voucher-code">{{ shippingVoucher.code }}</span>
          <span v-if="shippingDiscount" class="co-voucher-discount">
            -{{ formatMoney(shippingDiscount) }}
            <AppIcon name="check" :size="13" />
          </span>
          <AppButton variant="unstyled" type="button" class="co-voucher-remove" :aria-label="$t('checkout.voucher.remove')" @click="$emit('remove-voucher', 'ship')">
            <AppIcon name="close" :size="14" />
          </AppButton>
        </div>
        <AppButton v-else variant="unstyled" type="button" class="co-voucher-btn" @click="$emit('open-voucher', 'ship')">
          {{ $t('checkout.voucher.choose') }}
        </AppButton>
      </div>
    </div>
  </section>
</template>
