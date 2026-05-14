<script setup>
import HomeProductTile from './HomeProductTile.vue'

defineProps({
  products: { type: Array, default: () => [] },
  wishedProductIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-wish'])
</script>

<template>
  <section id="products" class="fade-up">
    <div class="section-head">
      <div>
        <div class="section-label">San pham ban chay</div>
        <h2 class="section-title">Duoc yeu thich <em>nhat tuan</em></h2>
      </div>
    </div>
    <div class="products-grid">
      <HomeProductTile
        v-for="product in products"
        :key="product.id"
        :product="product"
        :wished="wishedProductIds.includes(product.id)"
        @toggle-wish="emit('toggle-wish', $event)"
      />
    </div>
  </section>
</template>
