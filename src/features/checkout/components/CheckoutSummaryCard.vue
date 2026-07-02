<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  lines: { type: Array, default: () => [] },
  summary: { type: Object, required: true },
  formatMoney: { type: Function, required: true },
  agreedTerms: { type: Boolean, default: true },
  placing: { type: Boolean, default: false },
})

defineEmits(['update-agreed', 'place-order'])
</script>

<template>
  <aside class="checkout-summary">
    <div class="co-sum-card">
      <div class="co-sum-head">
        <p class="co-sum-title" v-html="$t('checkout.summary.title')"></p>
        <p class="co-sum-count">{{ $t('checkout.summary.count', { count: summary.itemQty }) }}</p>
      </div>

      <div class="co-sum-products">
        <div v-for="line in lines" :key="line.id" class="co-sum-item">
          <div class="co-sum-thumb">
            <AppImage v-if="line.imageUrl" :src="line.imageUrl" :alt="line.name" class="co-sum-thumb-img" />
            <AppIcon v-else name="image" :size="18" />
            <span class="co-sum-qty">{{ line.qty }}</span>
          </div>
          <span class="co-sum-name">{{ line.name }}</span>
          <span class="co-sum-price">{{ formatMoney(line.price * line.qty) }}</span>
        </div>
      </div>

      <div class="co-sum-rows">
        <div class="co-sum-row">
          <span>{{ $t('checkout.summary.subtotal') }}</span>
          <span>{{ formatMoney(summary.subtotal) }}</span>
        </div>
        <div class="co-sum-row">
          <span>{{ $t('checkout.summary.shippingFee') }}</span>
          <span>{{ formatMoney(summary.shipFee) }}</span>
        </div>
        <div v-if="summary.shippingDiscount" class="co-sum-row">
          <span>{{ $t('checkout.summary.shippingVoucher') }}</span>
          <span class="green">-{{ formatMoney(summary.shippingDiscount) }}</span>
        </div>
        <div v-if="summary.comboDiscount" class="co-sum-row">
          <span>{{ $t('checkout.summary.comboDiscount') }}</span>
          <span class="green">-{{ formatMoney(summary.comboDiscount) }}</span>
        </div>
        <div class="co-sum-row">
          <span>{{ $t('checkout.summary.shopVoucher') }}</span>
          <span :class="{ green: summary.shopDiscount }">
            {{ summary.shopDiscount ? `-${formatMoney(summary.shopDiscount)}` : $t('checkout.summary.notApplied') }}
          </span>
        </div>
        <div class="co-sum-row">
          <span>{{ $t('checkout.summary.insurance') }}</span>
          <span :class="{ green: summary.insuranceAmount }">
            {{ summary.insuranceAmount ? formatMoney(summary.insuranceAmount) : $t('checkout.summary.none') }}
          </span>
        </div>
        <div v-if="summary.saved" class="co-sum-row">
          <span>{{ $t('checkout.summary.saved') }}</span>
          <span class="green">-{{ formatMoney(summary.saved) }}</span>
        </div>
      </div>

      <div class="co-sum-total">
        <p style="font-size: 0.78rem; color: var(--co-text-mid, #555)">{{ $t('checkout.summary.total') }}</p>
        <p class="co-sum-total-val">{{ formatMoney(summary.total) }}</p>
        <p v-if="summary.saved" class="co-sum-saving">
          <AppIcon name="partyPopper" :size="14" />
          {{ $t('checkout.summary.savedNote', { amount: formatMoney(summary.saved) }) }}
        </p>
      </div>

      <div class="co-sum-confirm">
        <label class="co-agree">
          <input
            type="checkbox"
            :checked="agreedTerms"
            @change="$emit('update-agreed', $event.target.checked)"
          >
          <span>
            {{ $t('checkout.summary.termsPrefix') }}
            <a href="#">{{ $t('checkout.summary.termsOfService') }}</a> {{ $t('checkout.summary.and') }} <a href="#">{{ $t('checkout.summary.privacyPolicy') }}</a> {{ $t('checkout.summary.termsSuffix') }}
          </span>
        </label>
        <AppButton
          variant="unstyled"
          type="button"
          class="co-btn-order"
          :disabled="placing"
          @click="$emit('place-order')"
        >
          <AppIcon name="creditCard" :size="17" />
          {{ $t('checkout.summary.order') }} - {{ formatMoney(summary.total) }}
        </AppButton>
        <p class="co-btn-order-sub">
          <AppIcon name="lockKeyhole" :size="13" />
          {{ $t('checkout.summary.secure') }}
        </p>
      </div>
    </div>
  </aside>
</template>
