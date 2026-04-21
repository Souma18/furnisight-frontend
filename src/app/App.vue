<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@shared/layout/AppHeader.vue'

const route = useRoute()
const isRoom3DPage = computed(() => route.path.startsWith('/room3d'))
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!isRoom3DPage" />
    <main class="app-main" :class="{ 'app-main--fluid': isRoom3DPage }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;
}

.app-main--fluid {
  max-width: none;
  margin: 0;
  padding: 0;
}
</style>
