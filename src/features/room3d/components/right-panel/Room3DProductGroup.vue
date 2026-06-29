<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import ProductCard3D from '../shared/ProductCard3D.vue'

const props = defineProps({
  groupId: { type: String, required: true },
  icon: { type: String, default: 'box' },
  title: { type: String, required: true },
  products: { type: Array, required: true },
  emptyMessage: { type: String, default: 'Không có sản phẩm nào.' },
  openGroups: { type: Array, required: true },
  productColumns: { type: Number, default: 2 },
  productCardStep: { type: Number, default: 0 },
  placedProductIds: { type: Array, default: () => [] },
  selectedRoom: { type: Object, default: null },
  cartItems: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle', 'add-product', 'open-product'])

const isOpen = computed(() => props.openGroups.includes(props.groupId))

function toggle() {
  emit('toggle', props.groupId)
}

function getCartQty(productId) {
  return props.cartItems
    .filter((item) => String(item.productId ?? item.id ?? '').split('::')[0] === String(productId))
    .reduce((sum, item) => sum + (item.quantity || 1), 0)
}
</script>

<template>
  <div class="product-group">
    <div class="group-header" @click="toggle">
      <div class="group-title">
        <AppIcon :name="icon" :size="16" />
        <strong>{{ title }}</strong>
        <small>({{ products.length }})</small>
      </div>
      <AppIcon :name="isOpen ? 'chevronUp' : 'chevronDown'" :size="16" class="toggle-icon" />
    </div>
    <div v-show="isOpen" class="group-content grid" :style="{ '--product-columns': productColumns }">
      <div v-if="products.length === 0" class="products-empty" style="min-height: 4rem;">
        {{ emptyMessage }}
      </div>
      <ProductCard3D
        v-for="product in products"
        :key="product.id"
        :product="product"
        :added="placedProductIds.includes(String(product.id))"
        :suggested="selectedRoom && Array.isArray(product.roomTypes) ? product.roomTypes.includes(selectedRoom.type) : false"
        :shape-step="productCardStep"
        :cart-qty="getCartQty(product.id)"
        @add="$emit('add-product', $event)"
        @open-detail="$emit('open-product', $event)"
      />
    </div>
  </div>
</template>
