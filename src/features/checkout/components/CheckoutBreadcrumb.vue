<script setup>
import { CHECKOUT_BREADCRUMB } from '../composables/checkoutContent'
</script>

<template>
  <div class="checkout-bc">
    <nav class="checkout-bc-inner" aria-label="Breadcrumb">
      <template v-for="(item, index) in CHECKOUT_BREADCRUMB" :key="`${item.label}-${index}`">
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else class="cur">{{ item.label }}</span>
        <span v-if="index < CHECKOUT_BREADCRUMB.length - 1">›</span>
      </template>
    </nav>
  </div>
</template>
