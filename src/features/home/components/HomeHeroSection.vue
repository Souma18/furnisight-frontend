<script setup>
import AppImage from '@shared/ui/AppImage.vue'
import { RouterLink } from 'vue-router'

defineProps({
  hero: { type: Object, required: true },
})

function scrollToVisualizer() {
  const target = document.getElementById('home-room-visualizer')
  if (!target) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.history.replaceState(null, '', '#home-room-visualizer')
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <div class="hero">
    <div class="hero-content">
      <div class="hero-copy">
        <div class="hero-tag">{{ hero.tag }}</div>
        <h1 class="hero-title">
          {{ hero.titleTop }}<br />
          <em>{{ hero.titleEmphasis }}</em><br />
          <strong>{{ hero.titleBottom }}</strong>
        </h1>
        <p class="hero-sub">{{ hero.subtitle }}</p>
        <div class="hero-actions">
          <RouterLink to="/room3d" class="btn-primary">{{ hero.try3d }}</RouterLink>
          <RouterLink to="/products" class="btn-outline">{{ hero.exploreProducts }}</RouterLink>
        </div>
      </div>

      <div class="hero-gallery" :aria-label="hero.galleryAria">
        <figure class="hero-image hero-image-main">
          <AppImage src="/home/rooms/livingroom.jpeg" :alt="hero.mainAlt"  />
        </figure>
        <figure class="hero-image hero-image-small">
          <AppImage src="/home/rooms/bedroom.jpg" :alt="hero.smallAlt"  />
        </figure>
        <a class="hero-note" href="#home-room-visualizer" @click.prevent="scrollToVisualizer">
          <span>{{ hero.noteLabel }}</span>
          <strong>{{ hero.noteText }}</strong>
        </a>
      </div>
    </div>
  </div>
</template>
