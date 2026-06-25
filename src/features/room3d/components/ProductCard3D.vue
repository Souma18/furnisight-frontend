<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  added: {
    type: Boolean,
    default: false,
  },
  suggested: {
    type: Boolean,
    default: false,
  },
  shapeStep: {
    type: Number,
    default: 0,
  },
  cartQty: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['add', 'open-detail'])
const { t } = useI18n()

const productImage = computed(() => props.product.image || props.product.imageUrl || '')
const canDragToScene = computed(() => Boolean(props.product.variants?.some(v => v.modelUrl || v.supports3d)))
const priceLabel = computed(() => {
  const price = Number(props.product.price)
  return Number.isFinite(price) && price > 0 ? PriceFormatter.format(price) : t('room3d.product.contactPrice')
})
const isDragging = ref(false)
const productIconName = computed(() => {
  const raw = `${props.product.categoryName ?? ''} ${props.product.category ?? ''}`.toLowerCase()
  if (raw.includes('sofa')) return 'sofa'
  if (raw.includes('chair') || raw.includes('ghế')) return 'armchair'
  if (raw.includes('bed') || raw.includes('giường')) return 'bed'
  if (raw.includes('table') || raw.includes('bàn')) return 'table'
  if (raw.includes('kệ') || raw.includes('shelf')) return 'box'
  return 'box'
})

function onDragStart(event) {
  if (!canDragToScene.value) {
    event.preventDefault()
    return
  }
  isDragging.value = true
  if (!event.dataTransfer) return
  const payload = JSON.stringify({ productId: props.product.id })
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/x-room3d-product', payload)
  // text/plain dạng số thuần để trình duyệt nào cũng đọc được.
  event.dataTransfer.setData('text/plain', String(props.product.id))
}

function onDragEnd() {
  window.setTimeout(() => {
    isDragging.value = false
  }, 0)
}

function openDetail() {
  if (isDragging.value) return
  emit('open-detail', props.product)
}
</script>

<template>
  <article
    class="card"
    :class="{ added }"
    :style="{ '--pc-step': shapeStep }"
    :draggable="canDragToScene"
    role="link"
    tabindex="0"
    :aria-label="t('room3d.product.detailAria', { name: product.name })"
    @click="openDetail"
    @keydown.enter.self.prevent="openDetail"
    @keydown.space.self.prevent="openDetail"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="preview">
      <span v-if="cartQty > 0" class="cart-badge">{{ cartQty }}</span>
      <img v-if="productImage" class="product-image" :src="productImage" :alt="product.name" />
      <div v-else class="product-icon"><AppIcon :name="productIconName" :size="34" /></div>
    </div>

    <div class="content">
      <h4 class="name">{{ product.name }}</h4>
      <p v-if="product.categoryName" class="category">{{ product.categoryName }}</p>

      <div class="prices">
        <p class="price-current" :title="priceLabel">{{ priceLabel }}</p>
      </div>

      <button
        type="button"
        class="add-btn"
        :aria-label="t('room3d.product.addToCart')"
        :title="t('room3d.product.addToCart')"
        @click.stop="$emit('add', product)"
      >
        <AppIcon name="cart" :size="15" :stroke-width="2.4" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  border: 1px solid #ddd3c6;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  min-height: calc(14.9rem + (var(--pc-step) * 0.38rem));
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
  --pc-step: 0;
  --pc-content-scale: clamp(0.7, calc(1 - (var(--pc-step) * 0.1)), 1);
}

.card:hover {
  border-color: #c9922a;
  box-shadow: 0 6px 16px rgba(15, 63, 92, 0.13);
  transform: translateY(-2px);
}

.card:active {
  transform: translateY(0);
}

.card:focus-visible {
  outline: 2px solid rgba(201, 146, 42, 0.65);
  outline-offset: 2px;
}

.card.added {
  border-color: #5ab36f;
  background: #fbfffc;
}

.preview {
  position: relative;
  min-height: calc(5.8rem + (var(--pc-step) * 0.3rem));
  flex: 0 0 auto;
  background: #ede9e2;
  display: grid;
  place-items: center;
  padding: calc(0.4rem * var(--pc-content-scale));
  transition: background-color 0.2s ease;
}

.card:hover .preview {
  background: #f2ede5;
}

.product-icon {
  width: 100%;
  color: #876844;
  text-align: center;
  line-height: 1;
  transition: transform 0.2s ease;
  color: #c9922a;
}

.cart-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #0f3f5c;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(15, 63, 92, 0.3);
}

.product-image {
  width: 100%;
  height: calc(5.25rem + (var(--pc-step) * 0.3rem));
  object-fit: cover;
  display: block;
}

.card:hover .product-icon {
  transform: scale(1.06);
}

.content {
  position: relative;
  background: #ffffff;
  flex: 1 1 auto;
  min-height: 0;
  padding: calc(0.45rem * var(--pc-content-scale)) calc(0.5rem * var(--pc-content-scale))
    calc(2.65rem * var(--pc-content-scale));
}

.name {
  margin: 0;
  color: #0f172a;
  font-size: calc(0.62rem + (0.2rem * var(--pc-content-scale)));
  line-height: 1.18;
  min-height: calc(2.25em * var(--pc-content-scale));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category {
  margin: 0.18rem 0 0;
  color: #6f7b86;
  font-size: calc(0.58rem + (0.08rem * var(--pc-content-scale)));
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prices {
  margin-top: calc(0.55rem * var(--pc-content-scale));
  padding-right: calc(2.25rem * var(--pc-content-scale));
  min-width: 0;
  width: 100%;
  max-width: 100%;
  min-height: 1.4rem;
}

.price-current {
  margin: 0;
  display: block;
  width: 100%;
  color: #7a542a;
  font-size: calc(0.56rem + (0.18rem * var(--pc-content-scale)));
  font-weight: 800;
  line-height: 1.25;
  white-space: nowrap;
}

.add-btn {
  position: absolute;
  right: calc(0.5rem * var(--pc-content-scale));
  bottom: calc(0.5rem * var(--pc-content-scale));
  width: calc(1.86rem + (0.14rem * var(--pc-content-scale)));
  min-width: 0;
  height: calc(1.86rem + (0.14rem * var(--pc-content-scale)));
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #fff;
  font-size: calc(0.72rem * var(--pc-content-scale));
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease,
    background 0.18s ease;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.06);
  box-shadow: 0 6px 12px rgba(197, 141, 47, 0.34);
  filter: saturate(1.06);
}

.add-btn:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.add-btn:disabled {
  opacity: 1;
  cursor: default;
  background: linear-gradient(180deg, #63c27a 0%, #4ca862 100%);
  box-shadow: none;
}
</style>
