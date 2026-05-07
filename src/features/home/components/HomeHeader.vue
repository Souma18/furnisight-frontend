<script setup>
defineProps({
  navItems: { type: Array, default: () => [] },
})
</script>

<template>
  <header class="hn-header">
    <a class="hn-logo" href="#">
      <span class="hn-logo-icon">🪺</span>
      <span class="hn-logo-text">LUXNEST</span>
    </a>

    <nav class="hn-nav">
      <a
        v-for="item in navItems"
        :key="item.label"
        :href="item.href"
        :class="['hn-nav-link', { 'is-active': item.active }]"
      >
        {{ item.label }}
      </a>
    </nav>

    <div class="hn-header-right">
      <a href="/room3d" class="hn-btn-3d"><span>🏠</span> Truc quan 3D</a>
      <button type="button" class="hn-icon-btn">🔔</button>
      <button type="button" class="hn-icon-btn">🛒</button>
      <button type="button" class="hn-icon-btn">👤</button>
    </div>
  </header>
</template>
