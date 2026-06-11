<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  shopVoucher: { type: Object, default: null },
  shippingVoucher: { type: Object, default: null },
  selectedCombo: { type: Object, default: null },
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
        Voucher LUXNEST
      </h2>
    </div>

    <div class="co-voucher-wrap">
      <div class="co-voucher-row">
        <span>🏷️</span>
        <span class="co-voucher-label">Voucher của Shop</span>
        <div v-if="shopVoucher" class="co-voucher-applied">
          <span class="co-voucher-code">{{ shopVoucher.code }}</span>
          <span v-if="shopDiscount">−{{ formatMoney(shopDiscount) }} ✓</span>
          <button type="button" class="co-voucher-remove" @click="$emit('remove-voucher', 'shop')">✕</button>
        </div>
        <button v-else type="button" class="co-voucher-btn" @click="$emit('open-voucher', 'shop')">
          Chọn Voucher
        </button>
      </div>

      <hr style="border: none; border-top: 1px solid var(--co-cream-dark, #f0e9dd); margin: 0">

      <div class="co-voucher-row">
        <span>🎁</span>
        <span class="co-voucher-label">Combo khuyến mãi</span>
        <div v-if="selectedCombo" class="co-voucher-applied">
          <span class="co-voucher-code">{{ selectedCombo.name }}</span>
          <span v-if="comboDiscount">−{{ formatMoney(comboDiscount) }} ✓</span>
        </div>
        <span v-else class="co-voucher-muted">Chưa đủ sản phẩm combo</span>
      </div>

      <hr style="border: none; border-top: 1px solid var(--co-cream-dark, #f0e9dd); margin: 0">

      <div class="co-voucher-row">
        <span>🚚</span>
        <span class="co-voucher-label">Voucher vận chuyển</span>
        <div v-if="shippingVoucher" class="co-voucher-applied">
          <span class="co-voucher-code">{{ shippingVoucher.code }}</span>
          <span v-if="shippingDiscount">−{{ formatMoney(shippingDiscount) }} ✓</span>
          <button type="button" class="co-voucher-remove" @click="$emit('remove-voucher', 'ship')">✕</button>
        </div>
        <button v-else type="button" class="co-voucher-btn" @click="$emit('open-voucher', 'ship')">
          Chọn Voucher
        </button>
      </div>
    </div>
  </section>
</template>
