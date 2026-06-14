<script setup>
import { PriceFormatter } from '@shared/lib/formatters'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart'])

const formatPrice = PriceFormatter.format
</script>

<template>
  <article class="chat-product-card" @click="emit('add-to-cart', product)">
    <div class="cpc-img">
      <img :src="product.image" :alt="product.name" loading="lazy" />
    </div>
    <div class="cpc-body">
      <div class="cpc-cat">{{ product.category }}</div>
      <div class="cpc-name">{{ product.name }}</div>
      <div class="cpc-row">
        <span class="cpc-price">{{ formatPrice(product.price) }}</span>
        <button type="button" class="cpc-add" @click.stop="emit('add-to-cart', product)">+ Giỏ</button>
      </div>
    </div>
  </article>
</template>
