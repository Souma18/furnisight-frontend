<script setup>
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
        Voucher FurniSight
      </h2>
    </div>

    <div class="co-voucher-wrap">
      <div class="co-voucher-row">
        <AppIcon name="tag" :size="17" />
        <span class="co-voucher-label">Voucher của Shop</span>
        <div v-if="shopVoucher" class="co-voucher-applied">
          <span class="co-voucher-code">{{ shopVoucher.code }}</span>
          <span v-if="shopDiscount" class="co-voucher-discount">
            −{{ formatMoney(shopDiscount) }}
            <AppIcon name="check" :size="13" />
          </span>
          <button type="button" class="co-voucher-remove" aria-label="Bỏ voucher" @click="$emit('remove-voucher', 'shop')">
            <AppIcon name="close" :size="14" />
          </button>
        </div>
        <button v-else type="button" class="co-voucher-btn" @click="$emit('open-voucher', 'shop')">
          Chọn Voucher
        </button>
      </div>

      <hr style="border: none; border-top: 1px solid var(--co-cream-dark, #f0e9dd); margin: 0">

      <div class="co-voucher-row">
        <AppIcon name="gift" :size="17" />
        <span class="co-voucher-label">Combo khuyến mãi</span>
        <div v-if="selectedCombo" class="co-voucher-applied">
          <span class="co-voucher-code">{{ selectedCombo.name }}</span>
          <span v-if="comboDiscount" class="co-voucher-discount">
            −{{ formatMoney(comboDiscount) }}
            <AppIcon name="check" :size="13" />
          </span>
        </div>
        <span v-else class="co-voucher-muted">{{ comboMessage || 'Chưa đủ sản phẩm combo' }}</span>
      </div>

      <hr style="border: none; border-top: 1px solid var(--co-cream-dark, #f0e9dd); margin: 0">

      <div class="co-voucher-row">
        <AppIcon name="truck" :size="17" />
        <span class="co-voucher-label">Voucher vận chuyển</span>
        <div v-if="shippingVoucher" class="co-voucher-applied">
          <span class="co-voucher-code">{{ shippingVoucher.code }}</span>
          <span v-if="shippingDiscount" class="co-voucher-discount">
            −{{ formatMoney(shippingDiscount) }}
            <AppIcon name="check" :size="13" />
          </span>
          <button type="button" class="co-voucher-remove" aria-label="Bỏ voucher vận chuyển" @click="$emit('remove-voucher', 'ship')">
            <AppIcon name="close" :size="14" />
          </button>
        </div>
        <button v-else type="button" class="co-voucher-btn" @click="$emit('open-voucher', 'ship')">
          Chọn Voucher
        </button>
      </div>
    </div>
  </section>
</template>
