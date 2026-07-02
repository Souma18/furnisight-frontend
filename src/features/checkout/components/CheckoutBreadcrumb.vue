<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const BREADCRUMB = computed(() => [
  { label: t('checkout.breadcrumb.home'), to: '/' },
  { label: t('checkout.breadcrumb.cart'), to: '/account?view=cart' },
  { label: t('checkout.breadcrumb.checkout') },
])
</script>

<template>
  <div class="checkout-bc">
    <nav class="checkout-bc-inner" aria-label="Breadcrumb">
      <template v-for="(item, index) in BREADCRUMB" :key="`${item.label}-${index}`">
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else class="cur">{{ item.label }}</span>
        <span v-if="index < BREADCRUMB.length - 1">›</span>
      </template>
    </nav>
  </div>
</template>
