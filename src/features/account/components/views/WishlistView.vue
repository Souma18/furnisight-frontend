<script setup>
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import AccountSectionCard from '../AccountSectionCard.vue'
import ProductGrid from '@shared/ui/ProductGrid.vue'
import { useWishlistStore } from '../../store/wishlistStore'
import { useLocaleStore } from '@shared/stores/localeStore'

const emit = defineEmits(['notify'])
const { t } = useI18n()
const wishlistStore = useWishlistStore()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

const items = computed(() => wishlistStore.wishlist)
const products = computed(() => items.value.map((item) => item.product || item).filter(Boolean))
const wishedProductIds = computed(() => products.value.map((item) => item.id).filter(Boolean))

async function removeFavorite(productId) {
  if (!productId) return
  try {
    await wishlistStore.removeFavorite(productId)
    emit('notify', t('account.wishlist.removed'))
  } catch (error) {
    emit('notify', error?.response?.data?.message || t('account.wishlist.removeError'), 'error')
  }
}

onMounted(() => {
  wishlistStore.loadWishlist().catch((error) => {
    emit('notify', error?.response?.data?.message || t('account.wishlist.loadError'), 'error')
  })
})

watch(locale, () => {
  wishlistStore.loadWishlist().catch((error) => {
    emit('notify', error?.response?.data?.message || t('account.wishlist.loadError'), 'error')
  })
})
</script>

<template>
  <AccountSectionCard :title="t('account.wishlist.title')">
    <div v-if="!items.length" class="empty-state">{{ t('account.wishlist.empty') }}</div>

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
