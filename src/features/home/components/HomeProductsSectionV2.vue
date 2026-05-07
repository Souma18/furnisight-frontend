<script setup>
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
      <article v-for="product in products" :key="product.id" class="product-card">
        <div class="product-img">
          <img :src="product.image" :alt="product.name" @error="$event.target.style.display = 'none'" />
          <span :class="['product-tag', `tag-${product.tagType}`]">{{ product.tag }}</span>
          <button type="button" class="product-wish" @click="emit('toggle-wish', product.id)">
            {{ wishedProductIds.includes(product.id) ? '♥' : '♡' }}
          </button>
          <span class="product-fallback">{{ product.placeholder }}</span>
        </div>
        <div class="product-body">
          <div class="product-cat">{{ product.category }}</div>
          <div class="product-name">{{ product.name }}</div>
          <div class="product-footer">
            <div>
              <span class="product-price">{{ product.price }}</span>
              <span v-if="product.oldPrice" class="product-price-old">{{ product.oldPrice }}</span>
            </div>
            <button type="button" class="add-btn">+</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
