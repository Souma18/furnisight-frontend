<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import HomeRoomVisualizerPreview from './HomeRoomVisualizerPreview.vue'

const { t } = useI18n()
</script>

<template>
  <section id="home-room-visualizer" class="home-section home-process fade-up">
    <div class="process-3d-wrap">
      <div class="process-3d-left">
        <div class="section-label process-label">{{ t('home.process.label') }}</div>
        <h2 class="section-title process-title">{{ t('home.process.title') }}</h2>
        <p class="process-sub">
          {{ t('home.process.subtitle') }}
        </p>

        <div class="process-steps">
          <div class="process-step"><span>01</span><strong>{{ t('home.process.step1Title') }}</strong><small>{{ t('home.process.step1Text') }}</small></div>
          <div class="process-step"><span>02</span><strong>{{ t('home.process.step2Title') }}</strong><small>{{ t('home.process.step2Text') }}</small></div>
          <div class="process-step"><span>03</span><strong>{{ t('home.process.step3Title') }}</strong><small>{{ t('home.process.step3Text') }}</small></div>
        </div>

        <div class="process-actions">
          <RouterLink to="/room3d" class="btn-primary">{{ t('home.process.start') }}</RouterLink>
          <RouterLink to="/products" class="btn-outline btn-outline-dark">{{ t('home.process.products') }}</RouterLink>
        </div>
      </div>

      <div class="process-3d-right process-visualizer">
        <HomeRoomVisualizerPreview />
      </div>
    </div>
  </section>
</template>
