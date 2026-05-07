<script setup>
defineProps({
  product: { type: Object, required: true },
  wished: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-wish'])
</script>

<template>
  <article class="hn-product-card">
    <div class="hn-product-media">
      <img
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        @error="$event.target.style.display = 'none'"
      />
      <span :class="['hn-tag', `is-${product.tagType}`]">{{ product.tag }}</span>
      <button type="button" class="hn-wish-btn" @click="emit('toggle-wish', product.id)">
        {{ wished ? '♥' : '♡' }}
      </button>
      <span class="hn-product-fallback">{{ product.placeholder }}</span>
    </div>
    <div class="hn-product-body">
      <p class="hn-product-category">{{ product.category }}</p>
      <h3 class="hn-product-name">{{ product.name }}</h3>
      <div class="hn-product-footer">
        <div>
          <span class="hn-product-price">{{ product.price }}</span>
          <span v-if="product.oldPrice" class="hn-product-old">{{ product.oldPrice }}</span>
        </div>
        <button type="button" class="hn-add-btn">+</button>
      </div>
    </div>
  </article>
</template>
