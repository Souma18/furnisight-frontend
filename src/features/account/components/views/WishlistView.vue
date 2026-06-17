<script setup>
import { computed, onMounted } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import ProductGrid from '@shared/ui/ProductGrid.vue'
import { useWishlistStore } from '../../store/wishlistStore'

const emit = defineEmits(['notify'])
const wishlistStore = useWishlistStore()

const items = computed(() => wishlistStore.wishlist)
const products = computed(() => items.value.map((item) => item.product || item).filter(Boolean))
const wishedProductIds = computed(() => products.value.map((item) => item.id).filter(Boolean))

async function removeFavorite(productId) {
  if (!productId) return
  try {
    await wishlistStore.removeFavorite(productId)
    emit('notify', 'Đã bỏ sản phẩm khỏi danh sách yêu thích.')
  } catch (error) {
    emit('notify', error?.response?.data?.message || 'Không thể bỏ yêu thích sản phẩm. Vui lòng thử lại.', 'error')
  }
}

onMounted(() => {
  wishlistStore.loadWishlist().catch((error) => {
    emit('notify', error?.response?.data?.message || 'Không tải được danh sách yêu thích.', 'error')
  })
})
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
