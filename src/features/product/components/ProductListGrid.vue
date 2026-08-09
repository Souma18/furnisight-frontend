<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'
import ProductGrid from '@shared/ui/ProductGrid.vue'

defineProps({
  products: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  activeTags: { type: Array, default: () => [] },
  viewMode: { type: String, default: 'grid' },
  loading: { type: Boolean, default: false },
  wishedProductIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-wish', 'clear'])
const { t } = useI18n()
</script>

<template>
  <div class="pl-body">
    <header class="pl-result-head">
      <div class="pl-result-copy">
        <span>{{ t('products.catalog') }}</span>
        <p>{{ t('products.resultCount', { count: total }) }}</p>
      </div>
      <div class="pl-result-controls">
        <AppButton v-if="activeTags.length" type="button" class="pl-clear-tags" @click="emit('clear')">{{ t('products.clearFilters') }}</AppButton>
      </div>
    </header>

    <div v-if="activeTags.length" class="pl-tags" :aria-label="t('products.sidebar.title')">
      <span v-for="tag in activeTags" :key="tag" class="pl-tag">{{ tag }}</span>
    </div>

    <ProductGrid
      :products="products"
      :view-mode="viewMode"
      layout="catalog"
      :columns="4"
      :loading="loading"
      :wished-product-ids="wishedProductIds"
      :show-clear-action="activeTags.length > 0"
      :empty-text="t('products.empty')"
      @toggle-wish="emit('toggle-wish', $event)"
      @clear="emit('clear')"
    />
  </div>
</template>
