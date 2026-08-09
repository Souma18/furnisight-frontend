<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { CHECKOUT_SHOP } from '../composables/checkoutContent'
import { calcLineTotal } from '../utils/checkoutPricing'
import { resolveStockLimit, stockLimitLabel } from '@features/cart/lib/stockGuards'

const props = defineProps({
  lines: { type: Array, default: () => [] },
  formatMoney: { type: Function, required: true },
  insuranceOption: { type: Object, default: null },
  hasInsurance: { type: Boolean, default: false },
  sellerNote: { type: String, default: '' },
  shippingOptions: { type: Array, default: () => [] },
  selectedShippingId: { type: String, default: '' },
  itemQty: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
})

const emit = defineEmits(['update-qty', 'update-insurance', 'update-note', 'update-shipping'])

function variantTags(line) {
  const tags = []
  if (line.selectedSize) tags.push(line.selectedSize)
  if (line.selectedColor) tags.push(line.selectedColor)
  return tags
}

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}

function changeQty(line, delta) {
  const stockLimit = resolveStockLimit(line)
  const requested = Math.max(1, Number(line.qty || 1) + delta)
  const next = stockLimit == null ? requested : Math.min(requested, Math.max(1, stockLimit))
  emit('update-qty', line.id, next)
}

function cannotIncrease(line) {
  const stockLimit = resolveStockLimit(line)
  return stockLimit != null && Number(line.qty || 1) >= stockLimit
}

function stockText(line) {
  return cannotIncrease(line) ? stockLimitLabel(line) : ''
}

function selectShipping(id) {
  emit('update-shipping', id)
}
</script>

<template>
  <section class="checkout-card">
    <div class="co-shop-head">
      <div class="co-shop-icon">
        <AppIcon name="store" :size="14" />
      </div>
      <span class="co-shop-name">{{ CHECKOUT_SHOP.name }}</span>
    </div>

    <div
      v-for="line in lines"
      :key="line.id"
      class="co-prod-row"
    >
      <div class="co-prod-thumb">
        <AppImage v-if="line.imageUrl" :src="line.imageUrl" :alt="line.name" class="co-prod-thumb-img" @error="hideBrokenImage" />
        <AppIcon v-else name="image" :size="20" />
      </div>
      <div>
        <p class="co-prod-name">{{ line.name }}</p>
        <p v-if="variantTags(line).length" class="co-prod-variant">
          <span v-for="tag in variantTags(line)" :key="tag">{{ tag }}</span>
        </p>
        <p v-if="stockText(line)" class="co-prod-stock">{{ stockText(line) }}</p>
      </div>
      <div>
        <div class="co-prod-unit">{{ formatMoney(line.price) }}</div>
      </div>
      <div class="co-qty">
        <AppButton type="button" variant="unstyled" aria-label="Giảm" :disabled="Number(line.qty || 1) <= 1" @click="changeQty(line, -1)">−</AppButton>
        <span>{{ line.qty }}</span>
        <AppButton type="button" variant="unstyled" aria-label="Tăng" :disabled="cannotIncrease(line)" @click="changeQty(line, 1)">+</AppButton>
      </div>
      <div class="co-prod-total">{{ formatMoney(calcLineTotal(line)) }}</div>
    </div>

    <label v-if="insuranceOption" class="co-addon">
      <input
        type="checkbox"
        :checked="hasInsurance"
        @change="$emit('update-insurance', $event.target.checked)"
      >
      <AppIcon name="shield" :size="18" />
      <div class="co-addon-label">
        <strong>{{ $t('checkout.options.insurance.label', insuranceOption.label) }}</strong>
        <span v-if="insuranceOption.badge" class="co-addon-badge">{{ insuranceOption.badge }}</span>
        <br>
        {{ insuranceOption.description ? $t('checkout.options.insurance.description', insuranceOption.description) : '' }}
      </div>
      <span class="co-addon-price">+{{ formatMoney(insuranceOption.price) }}</span>
    </label>

    <div class="co-shop-options">
      <div class="co-opt-row">
        <span class="co-opt-label">{{ $t('checkout.shop.note') }}</span>
        <input
          class="co-opt-input"
          type="text"
          :placeholder="$t('checkout.shop.notePlaceholder')"
          :value="sellerNote"
          @input="$emit('update-note', $event.target.value)"
        />
      </div>
      <div class="co-opt-row">
        <span class="co-opt-label">{{ $t('checkout.shop.shipping') }}</span>
        <div class="co-ship-options">
          <label
            v-for="option in shippingOptions"
            :key="option.id"
            class="co-ship-option"
            :class="{ active: selectedShippingId === option.id }"
          >
            <input
              type="radio"
              name="checkout-shipping"
              :value="option.id"
              :checked="selectedShippingId === option.id"
              @change="selectShipping(option.id)"
            >
            <div>
              <div class="co-ship-name">
                {{ $t(`checkout.options.shipping.${option.id}`, option.name) }}
                <span
                  v-if="option.badge"
                  class="co-ship-badge"
                  :class="{ gold: option.badgeTone === 'gold' }"
                >{{ option.badge }}</span>
              </div>
              <p v-if="option.eta" class="co-ship-eta">{{ option.eta }}</p>
              <p v-if="option.note" class="co-ship-eta">{{ option.note }}</p>
            </div>
            <span class="co-ship-price" :class="{ free: option.isFree }">
              {{ option.isFree ? $t('checkout.shop.free') : formatMoney(option.fee) }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="co-subtotal-row">
      <span>{{ $t('checkout.shop.subtotal', { qty: itemQty }) }}</span>
      <span class="co-subtotal-val">{{ formatMoney(subtotal) }}</span>
    </div>
  </section>
</template>
