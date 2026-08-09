<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="preview-card">
    <div class="preview-card-header">
      <div class="preview-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      <span class="preview-label">furnisight://room-visualizer</span>
      <span class="ai-badge">AI</span>
    </div>
    <div class="preview-scene" :aria-label="t('home.process.previewAria')">
      <div class="scan-line"></div>
      <div class="grid-floor"></div>
      <div class="cube-wrap" aria-hidden="true">
        <div class="cube">
          <div class="face front"></div>
          <div class="face back"></div>
          <div class="face left"></div>
          <div class="face right"></div>
          <div class="face top"></div>
          <div class="face bottom"></div>
        </div>
      </div>
    </div>
    <div class="preview-footer">
      <div class="preview-text">{{ t('home.process.previewText') }}</div>
      <RouterLink to="/room3d" class="preview-start">{{ t('home.process.previewStart') }}</RouterLink>
    </div>
  </div>
</template>
