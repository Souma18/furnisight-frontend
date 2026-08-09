<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
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
    class="room3d-product-card"
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
      <AppImage v-if="productImage" class="product-image" :src="productImage" :alt="product.name"  />
      <div v-else class="product-icon"><AppIcon :name="productIconName" :size="34" /></div>
    </div>

    <div class="content">
      <h4 class="name">{{ product.name }}</h4>
      <p v-if="product.categoryName" class="category">{{ product.categoryName }}</p>

      <div class="prices">
        <p class="price-current" :title="priceLabel">{{ priceLabel }}</p>
        <AppButton
          type="button"
          variant="unstyled"
          class="add-btn"
          :aria-label="t('room3d.product.addToCart')"
          :title="t('room3d.product.addToCart')"
          @click.stop="$emit('add', product)"
        >
          <AppIcon name="cart" :size="20" :stroke-width="2.4" />
        </AppButton>
      </div>
    </div>
  </article>
</template>
