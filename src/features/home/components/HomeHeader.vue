<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  navItems: { type: Array, default: () => [] },
})
</script>

<template>
  <header class="hn-header">
    <a class="hn-logo" href="#">
      <span class="hn-logo-icon">
        <AppIcon name="house" :size="18" />
      </span>
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
      <a href="/room3d" class="hn-btn-3d">
        <AppIcon name="house" :size="16" />
        Truc quan 3D
      </a>
      <button type="button" class="hn-icon-btn" aria-label="Thong bao">
        <AppIcon name="bell" :size="17" />
      </button>
      <button type="button" class="hn-icon-btn" aria-label="Gio hang">
        <AppIcon name="cart" :size="17" />
      </button>
      <button type="button" class="hn-icon-btn" aria-label="Tai khoan">
        <AppIcon name="user" :size="17" />
      </button>
    </div>
  </header>
</template>
