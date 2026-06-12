<script setup>
import { computed } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import ProductGrid from '@shared/ui/ProductGrid.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['remove-favorite'])

const products = computed(() => props.items.map((item) => item.product || item).filter(Boolean))
const wishedProductIds = computed(() => products.value.map((item) => item.id).filter(Boolean))

function removeFavorite(productId) {
  if (!productId) return
  emit('remove-favorite', productId)
}
</script>

<template>
  <AccountSectionCard title="Sản phẩm yêu thích">
    <div v-if="!items.length" class="empty-state">Chưa có sản phẩm nào trong danh sách yêu thích.</div>

    <ProductGrid
      v-else
      :products="products"
      :wished-product-ids="wishedProductIds"
      :columns="3"
      @toggle-wish="removeFavorite"
    />
  </AccountSectionCard>
</template>

<style scoped>
.empty-state {
  border: 1px dashed var(--auth-border);
  border-radius: 14px;
  padding: 1rem;
  color: var(--auth-text-secondary);
  text-align: center;
}

</style>
