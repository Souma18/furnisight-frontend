<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppHeader from '@shared/layout/AppHeader.vue'
import AppFooter from '@shared/layout/AppFooter.vue'
import router from './router'

// Dung router.currentRoute thay cho useRouter() de tranh loi injection o root component
const route = computed(() => router?.currentRoute?.value)

const isRoom3DPage = computed(() => route.value?.path?.startsWith('/room3d') || false)
const isHomePage = computed(() => route.value?.name === 'home')
const isProductsPage = computed(() => route.value?.name === 'products')
const isProductDetailPage = computed(() => route.value?.name === 'product-detail')
const isAccountPage = computed(() => route.value?.path?.startsWith('/account') || false)
const mainRef = ref(null)
let resizeObserver = null
let mutationObserver = null

function syncHeaderScrollbarInset() {
  const el = mainRef.value
  const scrollbarWidth = el ? Math.max(0, el.offsetWidth - el.clientWidth) : 0
  document.documentElement.style.setProperty('--app-main-scrollbar-width', `${scrollbarWidth}px`)
}

onMounted(async () => {
  await nextTick()
  syncHeaderScrollbarInset()
  window.addEventListener('resize', syncHeaderScrollbarInset)
  window.addEventListener('load', syncHeaderScrollbarInset)

  if (typeof ResizeObserver !== 'undefined' && mainRef.value) {
    resizeObserver = new ResizeObserver(() => syncHeaderScrollbarInset())
    resizeObserver.observe(mainRef.value)
  }

  if (typeof MutationObserver !== 'undefined' && mainRef.value) {
    mutationObserver = new MutationObserver(() => syncHeaderScrollbarInset())
    mutationObserver.observe(mainRef.value, { childList: true, subtree: true })
  }
})

watch(
  () => route.value?.fullPath,
  async () => {
    await nextTick()
    syncHeaderScrollbarInset()
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncHeaderScrollbarInset)
  window.removeEventListener('load', syncHeaderScrollbarInset)
  resizeObserver?.disconnect()
  resizeObserver = null
  mutationObserver?.disconnect()
  mutationObserver = null
})
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!isRoom3DPage" />
    <main
      ref="mainRef"
      class="app-main"
      :class="{
        'app-main--fluid': isRoom3DPage,
        'app-main--with-header':
          !isRoom3DPage && !isHomePage && !isProductDetailPage && !isProductsPage && !isContactPage,
        'app-main--home': isHomePage,
        'app-main--products': isProductsPage,
        'app-main--product-detail': isProductDetailPage,
        'app-main--contact': isContactPage,
      }"
    >
      <RouterView />
      <AppFooter v-if="!isRoom3DPage && !isAccountPage" />
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

.app-main--home {
  max-width: none;
  padding: 56px 0 0;
  background: #12202e;
}

.app-main--product-detail {
  max-width: none;
  margin: 0;
  padding: 56px 0 0;
}

.app-main--products {
  max-width: none;
  margin: 0;
  padding: 56px 0 0;
  background: #faf6f0;
}

.app-main--contact {
  max-width: none;
  margin: 0;
  padding: 56px 0 0;
  background: #faf6f0;
}
</style>
