<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="brand">Interior 3D</RouterLink>
    <nav class="nav" aria-label="Chính">
      <RouterLink to="/products">Sản phẩm</RouterLink>
      <RouterLink to="/room3d">Trực quan 3D</RouterLink>
      <RouterLink to="/cart">Giỏ hàng</RouterLink>
      <RouterLink to="/login">Đăng nhập</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.brand {
  font-weight: 700;
  color: var(--text-heading);
  text-decoration: none;
}

.brand:hover {
  text-decoration: none;
  color: var(--accent);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav a {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-active {
  color: var(--accent);
}

.nav a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}
</style>
