<script setup>
import { RouterLink } from 'vue-router'
import { useProductNavigation } from '@features/product/composables/useProductNavigation'

defineProps({
  products: { type: Array, default: () => [] },
  wishedProductIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-wish'])

const { getDetailRoute } = useProductNavigation()
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
      <RouterLink
        v-for="product in products"
        :key="product.id"
        :to="getDetailRoute(product.detailId ?? product.id) || '#'"
        class="product-card"
        :class="{ 'product-card-disabled': !getDetailRoute(product.detailId ?? product.id) }"
      >
        <div class="product-img">
          <RouterLink v-if="getDetailRoute(product.detailId ?? product.id)" :to="getDetailRoute(product.detailId ?? product.id)">
            <img :src="product.image" :alt="product.name" @error="$event.target.style.display = 'none'" />
          </RouterLink>
          <img
            v-else
            :src="product.image"
            :alt="product.name"
            class="product-img-disabled"
            @error="$event.target.style.display = 'none'"
          />
          <span :class="['product-tag', `tag-${product.tagType}`]">{{ product.tag }}</span>
          <button type="button" class="product-wish" @click.prevent.stop="emit('toggle-wish', product.id)">
            {{ wishedProductIds.includes(product.id) ? '♥' : '♡' }}
          </button>
          <span class="product-fallback">{{ product.placeholder }}</span>
        </div>
        <div class="product-body">
          <div class="product-cat">{{ product.category }}</div>
          <RouterLink
            v-if="getDetailRoute(product.detailId ?? product.id)"
            :to="getDetailRoute(product.detailId ?? product.id)"
            class="product-name-link"
          >
            <div class="product-name">{{ product.name }}</div>
          </RouterLink>
          <div v-else class="product-name product-name-disabled">{{ product.name }}</div>
          <div class="product-footer">
            <div>
              <span class="product-price">{{ product.price }}</span>
              <span v-if="product.oldPrice" class="product-price-old">{{ product.oldPrice }}</span>
            </div>
            <button type="button" class="add-btn" @click.prevent.stop="">+</button>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
