<script setup>
defineProps({
  hero: { type: Object, required: true },
})
</script>

<template>
  <section class="hn-hero">
    <div class="hn-hero-bg" />
    <div class="hn-orb hn-orb-1" />
    <div class="hn-orb hn-orb-2" />
    <div class="hn-orb hn-orb-3" />

    <div class="hn-hero-content">
      <div>
        <p class="hn-hero-tag">{{ hero.tag }}</p>
        <h1 class="hn-hero-title">
          {{ hero.titleTop }}<br />
          <em>{{ hero.titleEmphasis }}</em><br />
          <strong>{{ hero.titleBottom }}</strong>
        </h1>
        <p class="hn-hero-sub">{{ hero.subtitle }}</p>

        <div class="hn-hero-actions">
          <a href="/room3d" class="hn-btn-primary">Thu truc quan 3D</a>
          <a href="#products" class="hn-btn-outline">Kham pha san pham</a>
        </div>

        <div class="hn-hero-stats">
          <div v-for="item in hero.stats" :key="item.label">
            <div class="hn-stat-num">{{ item.value }}</div>
            <div class="hn-stat-label">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <div class="hn-preview-card">
        <div class="hn-preview-head">
          <div class="hn-preview-dots"><span /><span /><span /></div>
          <span class="hn-preview-url">luxnest://room-visualizer</span>
          <span class="hn-ai-pill">AI</span>
        </div>
        <div class="hn-preview-body">
          <div class="hn-scan-line" />
          <div class="hn-grid-floor" />
          <div class="hn-preview-cube-wrap">
            <div class="hn-preview-cube">
              <div class="hn-cube-face hn-cube-front" />
              <div class="hn-cube-face hn-cube-back" />
              <div class="hn-cube-face hn-cube-left" />
              <div class="hn-cube-face hn-cube-right" />
              <div class="hn-cube-face hn-cube-top" />
              <div class="hn-cube-face hn-cube-bottom" />
            </div>
          </div>
        </div>
        <div class="hn-preview-foot">
          <p>Tai anh phong hoac chon mau san de bat dau.</p>
          <a href="/room3d" class="hn-preview-btn">Bat dau</a>
        </div>
      </div>
    </div>
  </section>
</template>
