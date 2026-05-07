<script setup>
import HomeProductCard from './HomeProductCard.vue'

defineProps({
  products: { type: Array, default: () => [] },
  wishedProductIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-wish'])
</script>

<template>
  <section id="products" class="hn-section js-reveal">
    <div class="hn-section-head">
      <div>
        <p class="hn-label">San pham ban chay</p>
        <h2 class="hn-title">Duoc yeu thich <em>nhat tuan</em></h2>
      </div>
      <a href="/products" class="hn-link">Xem tat ca</a>
    </div>

    <div class="hn-products-grid">
      <HomeProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :wished="wishedProductIds.includes(product.id)"
        @toggle-wish="emit('toggle-wish', $event)"
      />
    </div>
  </section>
</template>
