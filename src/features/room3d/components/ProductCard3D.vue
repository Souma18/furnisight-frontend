<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

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
  formatCurrency: {
    type: Function,
    required: true,
  },
  shapeStep: {
    type: Number,
    default: 0,
  },
})

defineEmits(['add'])

const productImage = computed(() => props.product.image || props.product.imageUrl || '')
const canDragToScene = computed(() => Boolean(props.product.modelUrl))
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
  if (!event.dataTransfer) return
  const payload = JSON.stringify({ productId: props.product.id })
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/x-room3d-product', payload)
  // text/plain dạng số thuần để trình duyệt nào cũng đọc được.
  event.dataTransfer.setData('text/plain', String(props.product.id))
}
</script>

<template>
  <article
    class="card"
    :class="{ added }"
    :style="{ '--pc-step': shapeStep }"
    :draggable="canDragToScene"
    @dragstart="onDragStart"
  >
    <div class="preview">
      <span v-if="product.tags?.includes?.('new')" class="new-badge">Mới</span>
      <img v-if="productImage" class="product-image" :src="productImage" :alt="product.name" />
      <div v-else class="product-icon"><AppIcon :name="productIconName" :size="34" /></div>
    </div>

    <div class="content">
      <h4 class="name">{{ product.name }}</h4>
      <p v-if="product.categoryName" class="category">{{ product.categoryName }}</p>

      <div class="bottom">
        <div class="prices">
          <p class="price-current">{{ formatCurrency(product.price) }}</p>
          <p v-if="product.oldPrice" class="price-old">{{ formatCurrency(product.oldPrice) }}</p>
        </div>

        <button type="button" class="add-btn" :disabled="added" @click.stop="$emit('add', product)">
          <AppIcon v-if="added" name="check" :size="15" :stroke-width="2.4" />
          <span v-else>Giỏ</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  border: 2px solid #f2c36a;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  min-height: calc(13.4rem + (var(--pc-step) * 0.38rem));
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
  border-color: #e1ab47;
  box-shadow: 0 6px 16px rgba(15, 63, 92, 0.13);
  transform: translateY(-2px);
}

.card:active {
  transform: translateY(0);
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

.new-badge {
  position: absolute;
  left: calc(0.45rem * var(--pc-content-scale));
  top: calc(0.4rem * var(--pc-content-scale));
  background: #f6b22f;
  color: #0f3f5c;
  border-radius: calc(0.55rem * var(--pc-content-scale));
  padding: calc(0.2rem * var(--pc-content-scale)) calc(0.45rem * var(--pc-content-scale));
  font-weight: 700;
  font-size: calc(0.58rem * var(--pc-content-scale));
  letter-spacing: 0.02em;
}

.product-icon {
  width: 100%;
  color: #876844;
  text-align: center;
  line-height: 1;
  transition: transform 0.2s ease;
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
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding: calc(0.45rem * var(--pc-content-scale)) calc(0.5rem * var(--pc-content-scale))
    calc(0.55rem * var(--pc-content-scale));
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

.bottom {
  margin-top: auto;
  padding-top: calc(0.48rem * var(--pc-content-scale));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(0.25rem * var(--pc-content-scale));
  min-height: calc(1.7rem + (0.28rem * var(--pc-content-scale)));
}

.prices {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: calc(100% - (2.75rem + (0.5rem * var(--pc-content-scale))));
}

.price-current {
  margin: 0;
  display: block;
  color: #9a744f;
  font-size: calc(0.58rem + (0.2rem * var(--pc-content-scale)));
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-old {
  margin: 0.08rem 0 0;
  color: #9ca3af;
  font-size: calc(0.56rem + (0.08rem * var(--pc-content-scale)));
  line-height: 1.1;
  text-decoration: line-through;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-btn {
  min-width: calc(2.45rem + (0.28rem * var(--pc-content-scale)));
  height: calc(1.7rem + (0.28rem * var(--pc-content-scale)));
  padding: 0 0.45rem;
  flex: 0 0 auto;
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
