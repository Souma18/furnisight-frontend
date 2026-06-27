<script setup>
import '../styles/home.css'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HomeHeroSection from '../components/HomeHeroSection.vue'
import HomeProcess3DSection from '../components/HomeProcess3DSection.vue'
import HomeFeaturesStripSection from '../components/HomeFeaturesStripSection.vue'
import HomeCategoriesSection from '../components/HomeCategoriesSection.vue'
import HomeCombosSection from '../components/HomeCombosSection.vue'
import HomeSharedProductsSection from '../components/HomeSharedProductsSection.vue'
import HomeTestimonialsSection from '../components/HomeTestimonialsSection.vue'
import HomeNewsletterSection from '../components/HomeNewsletterSection.vue'
import { useHomePage } from '../composables/useHomePage'

const { t } = useI18n()
const {
  categories,
  combos,
  products,
  wishedProductIds,
  topReviews,
  comboBuyingId,
  comboAddingId,
  comboMessage,
  addComboToCart,
  buyCombo,
  toggleWish,
} = useHomePage()

const translatedHero = computed(() => ({
  tag: t('home.hero.tag'),
  titleTop: t('home.hero.titleTop'),
  titleEmphasis: t('home.hero.titleEmphasis'),
  titleBottom: t('home.hero.titleBottom'),
  subtitle: t('home.hero.subtitle'),
  try3d: t('home.hero.try3d'),
  exploreProducts: t('home.hero.exploreProducts'),
  galleryAria: t('home.hero.galleryAria'),
  mainAlt: t('home.hero.mainAlt'),
  smallAlt: t('home.hero.smallAlt'),
  noteLabel: t('home.hero.noteLabel'),
  noteText: t('home.hero.noteText'),
}))

const translatedFeatures = computed(() => [
  { icon: 'truck', title: t('home.features.shippingTitle'), subtitle: t('home.features.shippingSubtitle') },
  { icon: 'refresh', title: t('home.features.returnTitle'), subtitle: t('home.features.returnSubtitle') },
  { icon: 'shield', title: t('home.features.warrantyTitle'), subtitle: t('home.features.warrantySubtitle') },
  { icon: 'phone', title: t('home.features.supportTitle'), subtitle: t('home.features.supportSubtitle') },
])
</script>

<template>
  <div class="home-page">
    <HomeHeroSection :hero="translatedHero" />
    <HomeFeaturesStripSection :items="translatedFeatures" />

    <HomeCategoriesSection :categories="categories" />

    <HomeCombosSection
      :combos="combos"
      :buying-id="comboBuyingId"
      :adding-id="comboAddingId"
      @add="addComboToCart"
      @buy="buyCombo"
    />
    <p v-if="comboMessage" class="home-combo-message" role="status">{{ comboMessage }}</p>

    <HomeSharedProductsSection
      :products="products"
      :wished-product-ids="wishedProductIds"
      @toggle-wish="toggleWish"
    />

    <HomeProcess3DSection />
    <HomeTestimonialsSection :testimonials="topReviews" />
    <HomeNewsletterSection />
  </div>
</template>
