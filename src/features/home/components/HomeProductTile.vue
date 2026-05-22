<script setup>
import { RouterLink } from 'vue-router'
import { useProductNavigation } from '@features/product/composables/useProductNavigation'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  product: { type: Object, required: true },
  wished: { type: Boolean, default: false },
  wishReadonly: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-wish'])

const { getDetailRoute } = useProductNavigation()

function handleToggleWish() {
  if (props.wishReadonly) return
  emit('toggle-wish', props.product.id)
}
</script>

<template>
  <article class="product-card">
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
      <span v-if="product.tag" :class="['product-tag', `tag-${product.tagType}`]">{{ product.tag }}</span>
      <button
        type="button"
        class="product-wish"
        :class="{ 'product-wish--active': wished }"
        :disabled="wishReadonly"
        aria-label="Yêu thích"
        @click="handleToggleWish"
      >
        <AppIcon name="heart" :size="15" :stroke-width="1.9" class="product-wish-icon" />
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
        <span class="product-sold">Đã bán {{ product.soldCount ?? 0 }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card { background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.06); position: relative; }
.product-img { height: 200px; background: #f0e9dd; position: relative; overflow: hidden; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-img-disabled { width: 100%; height: 100%; object-fit: cover; opacity: .92; }
.product-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 64px; }
.product-tag { position: absolute; top: 12px; left: 12px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 6px; color: #fff; }
.tag-hot { background: #e64444; }
.tag-new { background: #12202e; }
.tag-ai { background: #7c3aed; }
.tag-sale { background: #c9922a; color: #12202e; }
.product-wish {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,.85);
  border: none;
  cursor: pointer;
  color: #4b5563;
  line-height: 1;
}
.product-wish-icon {
  flex: 0 0 auto;
}
.product-wish :deep(svg) {
  display: block;
  fill: transparent;
}
.product-wish--active {
  color: #e25555;
}
.product-wish--active :deep(svg) {
  fill: currentColor;
}
.product-wish:disabled {
  cursor: default;
  opacity: 1;
}
.product-body { padding: 16px; }
.product-cat { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
.product-name-link { text-decoration: none; color: inherit; }
.product-name { font-size: 15px; font-weight: 500; margin-bottom: 10px; line-height: 1.35; }
.product-name-disabled { color: #444; cursor: default; }
.product-footer { display: flex; align-items: center; justify-content: space-between; }
.product-price { font-size: 16px; font-weight: 600; color: #c9922a; }
.product-price-old { font-size: 12px; color: #888; text-decoration: line-through; margin-left: 6px; }
.product-sold { color: #7e7c77; font-size: 12px; font-weight: 500; white-space: nowrap; }
</style>
