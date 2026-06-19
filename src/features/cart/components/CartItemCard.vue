<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'
import { isOverStock, resolveStockLimit, stockLimitLabel } from '../lib/stockGuards'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-check', 'open-variant', 'change-qty', 'remove'])
const { t } = useI18n()

const variantLabel = computed(() => {
  const color = props.item.selectedColor ?? ''
  const size = props.item.selectedSize ?? ''
  if (color && size) return `${color} / ${size}`
  return color || size || t('account.cart.chooseVariant')
})

const summaryLabel = computed(() => {
  const color = props.item.selectedColor ?? ''
  const size = props.item.selectedSize ?? ''
  if (color && size) return `${color} / ${size}`
  return color || size || t('account.cart.defaultVariant')
})

const detailRoute = computed(() => {
  const detailId = props.item?.detailId || props.item?.slug || ''
  return detailId ? `/products/${detailId}` : ''
})

const stockLimit = computed(() => resolveStockLimit(props.item))
const cannotIncrease = computed(() => stockLimit.value != null && Number(props.item.qty || 1) >= stockLimit.value)
const stockWarning = computed(() => {
  if (props.item.outOfStock || stockLimit.value === 0) return t('account.cart.outOfStock')
  if (isOverStock(props.item) || cannotIncrease.value) return stockLimitLabel(props.item)
  return ''
})

const formatPrice = PriceFormatter.format
</script>

<template>
  <article class="item">
    <div class="item-selection">
      <label v-if="!item.outOfStock && !isOverStock(item)" class="select-box" :aria-label="t('account.cart.selectItem', { name: item.name })">
        <input
          class="select-box-input"
          type="checkbox"
          :checked="checked"
          @change="$emit('toggle-check', item.id)"
        >
        <span class="select-box-ui"></span>
      </label>
      <span v-else class="stock-badge">{{ stockWarning || t('account.cart.outOfStock') }}</span>
    </div>

    <RouterLink v-if="detailRoute" :to="detailRoute" class="thumb thumb-link">
      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="thumb-image">
      <template v-else>{{ item.imageFallback ?? item.emoji ?? 'SP' }}</template>
    </RouterLink>
    <div v-else class="thumb">
      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="thumb-image">
      <template v-else>{{ item.imageFallback ?? item.emoji ?? 'SP' }}</template>
    </div>

    <div class="name-wrap">
      <p class="category">{{ item.categoryLabel || t('account.cart.product') }}</p>
      <RouterLink v-if="detailRoute" :to="detailRoute" class="name name-link">{{ item.name }}</RouterLink>
      <p v-else class="name">{{ item.name }}</p>
      <p class="summary">{{ summaryLabel }}</p>
      <p v-if="stockWarning" class="stock-note">{{ stockWarning }}</p>
    </div>

    <button type="button" class="variant-btn" @click="$emit('open-variant', item)">
      <span class="variant-btn-label">{{ t('account.cart.variantLabel', { value: variantLabel }) }}</span>
      <AppIcon name="chevronDown" :size="15" />
    </button>

    <div class="qty-wrap">
      <button type="button" :aria-label="t('account.cart.decreaseQty')" :disabled="Number(item.qty || 1) <= 1" @click="$emit('change-qty', item, -1)">
        <AppIcon name="minus" :size="15" />
      </button>
      <span>{{ item.qty }}</span>
      <button type="button" :aria-label="t('account.cart.increaseQty')" :disabled="cannotIncrease" @click="$emit('change-qty', item, 1)">
        <AppIcon name="plus" :size="15" />
      </button>
    </div>

    <p class="line-total">{{ formatPrice(item.price * item.qty) }}</p>

    <button type="button" class="delete-btn" :aria-label="t('account.cart.removeItem')" @click="$emit('remove', item.id)">
      <AppIcon name="trash" :size="22" />
    </button>
  </article>
</template>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 64px 60px minmax(0, 1.7fr) minmax(110px, 142px) 88px minmax(92px, 104px) 38px;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--auth-border);
  border-radius: 20px;
  padding: 1rem 0.95rem;
  background:
    radial-gradient(circle at top, rgba(201, 146, 42, 0.08), transparent 60%),
    var(--account-surface);
  box-shadow: 0 10px 30px rgba(18, 32, 46, 0.06);
}
.item-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.select-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.select-box-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}
.select-box-ui {
  position: relative;
  display: inline-block;
  width: 1.05rem;
  height: 1.05rem;
  border: 1px solid #ccb993;
  border-radius: 4px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.85);
}
.select-box-ui::after {
  content: '';
  position: absolute;
  left: 0.3rem;
  top: 0.08rem;
  width: 0.26rem;
  height: 0.56rem;
  border-right: 2px solid #8b6a21;
  border-bottom: 2px solid #8b6a21;
  transform: rotate(45deg) scale(0.7);
  opacity: 0;
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.select-box-input:checked + .select-box-ui {
  background: rgba(229, 184, 74, 0.18);
  border-color: #c9922a;
}
.select-box-input:checked + .select-box-ui::after {
  opacity: 1;
  transform: rotate(45deg) scale(1);
}
.stock-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.7rem;
  min-width: 56px;
  padding: 0 0.55rem;
  border-radius: 999px;
  background: #a3a3a3;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.05;
  text-align: center;
}
.thumb {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7f1e8, #ffffff);
  display: grid;
  place-items: center;
  font-size: 22px;
  border: 1px solid rgba(201, 146, 42, 0.15);
  overflow: hidden;
  color: #8b6a21;
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 800;
}
.thumb-link:hover,
.thumb-link:focus,
.thumb-link:focus-visible {
  color: #8b6a21;
  outline: none;
  text-decoration: none;
}
.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name-wrap { min-width: 0; }
.category {
  margin: 0 0 0.2rem;
  color: var(--account-badge);
  font-size: 0.64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.name {
  margin: 0;
  font-weight: 500;
  line-height: 1.3;
  font-size: 0.84rem;
  color: #1a1a1a;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.name-link {
  text-decoration: none;
}
.name-link:hover,
.name-link:focus,
.name-link:focus-visible {
  color: #8b6a21;
  outline: none;
  text-decoration: none;
}
.summary {
  margin: 0.3rem 0 0;
  color: var(--auth-text-secondary);
  font-size: 0.67rem;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stock-note {
  margin: 0.22rem 0 0;
  color: #b45309;
  font-size: 0.66rem;
  font-weight: 600;
}
.variant-btn {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid var(--auth-border);
  border-radius: 999px;
  padding: 0.54rem 0.68rem;
  background: linear-gradient(180deg, #f2f2f2, #e9e9e9);
  color: #8b8b8b;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.7rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}
.variant-btn-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-total {
  margin: 0;
  text-align: right;
  font-weight: 600;
  font-size: 0.84rem;
  min-width: 0;
  color: var(--account-badge);
}
.qty-wrap {
  display: inline-flex;
  align-items: center;
  justify-self: center;
  border: 1px solid #e5dcca;
  border-radius: 10px;
  overflow: hidden;
  background: #f5efe6;
}
.qty-wrap button {
  width: 28px;
  height: 30px;
  border: none;
  background: transparent;
  color: #9a8d7a;
  cursor: pointer;
}
.qty-wrap button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}
.qty-wrap span {
  width: 32px;
  height: 30px;
  display: grid;
  place-items: center;
  text-align: center;
  border-inline: 1px solid #e5dcca;
  background: rgba(255,255,255,0.45);
  color: #8b7d68;
}
.delete-btn {
  justify-self: center;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid #d7d0c4;
  background: transparent;
  color: #7d776d;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-btn:hover {
  background: #f5efe6;
  color: #5f5950;
}

@media (max-width: 1280px) {
  .item {
    grid-template-columns: 84px minmax(0, 1fr);
    grid-template-areas:
      'select select'
      'thumb name'
      'thumb variant'
      'qty total'
      'delete delete';
  }
  .item-selection { grid-area: select; justify-content: flex-start; }
  .thumb { grid-area: thumb; width: 72px; height: 64px; }
  .name-wrap { grid-area: name; }
  .variant-btn { grid-area: variant; justify-self: start; }
  .qty-wrap { grid-area: qty; }
  .line-total { grid-area: total; text-align: right; align-self: center; }
  .delete-btn { grid-area: delete; justify-self: start; }
}

@media (max-width: 720px) {
  .item {
    grid-template-columns: 74px minmax(0, 1fr);
    gap: 10px;
    padding: 0.75rem;
  }
  .thumb { width: 70px; height: 62px; font-size: 26px; }
  .item {
    grid-template-areas:
      'select select'
      'thumb name'
      'variant variant'
      'qty qty'
      'total delete';
  }
  .variant-btn { width: 100%; }
  .qty-wrap { justify-self: start; }
  .line-total { text-align: left; }
}
</style>
