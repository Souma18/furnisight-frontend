<script setup>

import AppImage from '@shared/ui/AppImage.vue'
import { PriceFormatter } from '@shared/lib/formatters'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})


const formatPrice = PriceFormatter.format

function openProduct() {
  const url = props.product.slug ? `/san-pham/${props.product.slug}` : `/san-pham/${props.product.id}`
  window.open(url, '_blank')
}
</script>

<template>
  <article class="chat-product-card" style="cursor: pointer;" @click="openProduct">
    <div class="cpc-img">
      <AppImage style="width: 100%; height: 100%; object-fit: cover;" :src="product.image" :alt="product.name" loading="lazy"  />
    </div>
    <div class="cpc-body">
      <div class="cpc-cat">{{ product.category }}</div>
      <div class="cpc-name">{{ product.name }}</div>
      <div class="cpc-row">
        <span class="cpc-price">{{ formatPrice(product.price) }}</span>
      </div>
    </div>
  </article>
</template>
