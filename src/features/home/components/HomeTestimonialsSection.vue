<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  testimonials: { type: Array, default: () => [] },
})

const { t } = useI18n()
</script>

<template>
  <section class="home-testimonials fade-up">
    <div class="section-head">
      <div>
        <div class="section-label">{{ t('home.testimonials.label') }}</div>
        <h2 class="section-title">{{ t('home.testimonials.title') }}</h2>
      </div>
    </div>
    <div class="testimonials-grid">
      <article v-for="item in testimonials" :key="item.id" class="testi-card">
        <p class="testi-text">"{{ item.text }}"</p>
        <div class="testi-footer">
          <div>
            <div class="testi-name">{{ item.name }}</div>
            <div v-if="item.role" class="testi-role">{{ item.role }}</div>
          </div>
          <div class="testi-stars" :aria-label="t('home.testimonials.stars', { count: Math.round(item.rating || 5) })">
            {{ '★'.repeat(Math.round(item.rating || 5)) }}
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
