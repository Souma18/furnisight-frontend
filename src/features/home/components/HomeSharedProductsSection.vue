<script setup>
import ProductGrid from '@shared/ui/ProductGrid.vue'

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
        <div class="section-label">Sản phẩm bán chạy</div>
        <h2 class="section-title">Được yêu thích <em>nhất tuần</em></h2>
      </div>
    </div>

    <ProductGrid
      :products="products"
      :wished-product-ids="wishedProductIds"
      :columns="4"
      empty-text="Chưa có sản phẩm nổi bật."
      @toggle-wish="emit('toggle-wish', $event)"
    />
  </section>
</template>
