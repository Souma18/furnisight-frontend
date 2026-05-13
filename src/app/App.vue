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
    <main class="app-main" :class="{ 'app-main--fluid': isRoom3DPage, 'app-main--with-header': !isRoom3DPage }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;
  overflow: auto;
}

.app-main--with-header {
  padding-top: calc(62px + 1rem);
}

.app-main--fluid {
  max-width: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
