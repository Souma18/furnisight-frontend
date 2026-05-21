<script setup>
import CartView from '@features/account/components/views/CartView.vue'
</script>

<template>
  <section class="cart-page">
    <div class="cart-page-inner">
      <CartView />
    </div>
  </section>
</template>

<style scoped>
.cart-page {
  min-height: calc(100svh - 62px);
  padding: 1rem;
  background:
    radial-gradient(circle at top left, rgba(201, 146, 42, 0.12), transparent 28%),
    linear-gradient(180deg, #fbf8f3 0%, #f4efe7 100%);
}

.cart-page-inner {
  max-width: 1240px;
  margin: 0 auto;
}

@media (max-width: 720px) {
  .cart-page {
    padding: 0.75rem;
  }
}
</style>
