<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  paymentMethods: { type: Array, default: () => [] },
  selectedPaymentId: { type: String, default: 'cod' },
  codNote: { type: String, default: '' },
})

defineEmits(['update-payment'])
</script>

<template>
  <section class="checkout-card">
    <div class="checkout-card-head">
      <h2 class="checkout-card-title">
        <AppIcon name="creditCard" :size="16" />
        Phương thức thanh toán
      </h2>
    </div>

    <div class="co-pay-wrap">
      <div class="co-pay-grid">
        <label
          v-for="method in paymentMethods"
          :key="method.id"
          class="co-pay-method"
          :class="{ active: selectedPaymentId === method.id }"
        >
          <input
            type="radio"
            name="checkout-payment"
            :value="method.id"
            :checked="selectedPaymentId === method.id"
            @change="$emit('update-payment', method.id)"
          >
          <span class="co-pay-icon">
            <AppIcon v-if="method.icon" :name="method.icon" :size="18" />
          </span>
          <div>
            <div class="co-pay-name">{{ method.name }}</div>
            <div class="co-pay-sub">{{ method.sub }}</div>
          </div>
          <AppIcon v-if="selectedPaymentId === method.id" class="co-pay-selected" name="check" :size="13" />
        </label>
      </div>

      <p v-if="selectedPaymentId === 'cod' && codNote" class="co-cod-note">{{ codNote }}</p>
    </div>
  </section>
</template>
