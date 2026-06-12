<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  hero: { type: Object, required: true },
})
</script>

<template>
  <div class="hero">
    <div class="hero-bg"></div>
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>
    <div class="hero-content">
      <div>
        <div class="hero-tag">{{ hero.tag }}</div>
        <h1 class="hero-title">
          {{ hero.titleTop }}<br />
          <em>{{ hero.titleEmphasis }}</em><br />
          <strong>{{ hero.titleBottom }}</strong>
        </h1>
        <p class="hero-sub">{{ hero.subtitle }}</p>
        <div class="hero-actions">
          <RouterLink to="/room3d" class="btn-primary">Thử trực quan 3D</RouterLink>
          <RouterLink to="/products" class="btn-outline">Khám phá sản phẩm</RouterLink>
        </div>
      </div>
      <div class="preview-card">
        <div class="preview-card-header">
          <div class="preview-dots"><span></span><span></span><span></span></div>
          <span class="preview-label">luxnest://room-visualizer</span>
          <span class="ai-badge">AI</span>
        </div>
        <div class="preview-scene">
          <div class="scan-line"></div>
          <div class="grid-floor"></div>
          <div class="cube-wrap">
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
          <div class="preview-text">Tải ảnh phòng hoặc chọn phòng có sẵn để bắt đầu.</div>
          <RouterLink to="/room3d" class="preview-start">Bắt đầu</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
