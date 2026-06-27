<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineProps({
  isOpen: Boolean
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeNav = computed(() => {
  const path = router?.currentRoute?.value?.path || ''
  if (path.startsWith('/products')) return 'products'
  if (route.path.startsWith('/contact')) return 'contact'
  if (path.startsWith('/room3d')) return 'room3d'
  if (path.startsWith('/khuyen-mai')) return 'promotions'
  if (path === '/') return 'home'
  return ''
})
</script>

<template>
  <div v-if="isOpen" class="mobile-nav">
    <RouterLink to="/" :class="{ 'mobile-nav-pill': activeNav === 'home' }">{{ t('nav.home') }}</RouterLink>
    <RouterLink to="/products" :class="{ 'mobile-nav-pill': activeNav === 'products' }">{{ t('nav.products') }}</RouterLink>
    <RouterLink to="/room3d" :class="{ 'mobile-nav-pill': activeNav === 'room3d' }">{{ t('nav.room3d') }}</RouterLink>
    <RouterLink to="/khuyen-mai" :class="{ 'mobile-nav-pill': activeNav === 'promotions' }">{{ t('nav.promotions') }}</RouterLink>
    <RouterLink to="/contact" :class="{ 'mobile-nav-pill': activeNav === 'contact' }">{{ t('nav.contact') }}</RouterLink>
  </div>
</template>
