<script setup>
import { useI18n } from 'vue-i18n'
import ProductGrid from '@shared/ui/ProductGrid.vue'

defineProps({
  products: { type: Array, default: () => [] },
  wishedProductIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle-wish'])
const { t } = useI18n()
</script>

<template>
  <section id="products" class="fade-up">
    <div class="section-head">
      <div>
        <div class="section-label">{{ t('home.products.label') }}</div>
        <h2 class="section-title">{{ t('home.products.titlePrefix') }} <em>{{ t('home.products.titleEmphasis') }}</em></h2>
      </div>
    </div>

    <ProductGrid
      :products="products"
      :wished-product-ids="wishedProductIds"
      :columns="4"
      :empty-text="t('home.products.empty')"
      @toggle-wish="emit('toggle-wish', $event)"
    />
  </section>
</template>
