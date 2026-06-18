<script setup>
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

const itemQty = () => props.lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0)

const merchandiseSubtotal = () =>
  props.lines.reduce((sum, line) => sum + calcLineTotal(line), 0)
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
        <img v-if="line.imageUrl" :src="line.imageUrl" :alt="line.name" class="co-prod-thumb-img" @error="hideBrokenImage">
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
        <button type="button" aria-label="Giảm" :disabled="Number(line.qty || 1) <= 1" @click="changeQty(line, -1)">−</button>
        <span>{{ line.qty }}</span>
        <button type="button" aria-label="Tăng" :disabled="cannotIncrease(line)" @click="changeQty(line, 1)">+</button>
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
        <strong>{{ insuranceOption.label }}</strong>
        <span v-if="insuranceOption.badge" class="co-addon-badge">{{ insuranceOption.badge }}</span>
        <br>
        {{ insuranceOption.description }}
      </div>
      <span class="co-addon-price">+{{ formatMoney(insuranceOption.price) }}</span>
    </label>

    <div class="co-shop-options">
      <div class="co-opt-row">
        <span class="co-opt-label">Lời nhắn:</span>
        <input
          class="co-opt-input"
          type="text"
          placeholder="Lưu ý cho người bán..."
          :value="sellerNote"
          @input="$emit('update-note', $event.target.value)"
        >
      </div>
      <div class="co-opt-row">
        <span class="co-opt-label">Vận chuyển:</span>
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
                {{ option.name }}
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
              {{ option.isFree ? 'Miễn phí' : formatMoney(option.fee) }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="co-subtotal-row">
      <span>Tổng số tiền ({{ itemQty() }} sản phẩm):</span>
      <span class="co-subtotal-val">{{ formatMoney(merchandiseSubtotal()) }}</span>
    </div>
  </section>
</template>
