<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppHeader from '@shared/layout/AppHeader.vue'
import AppFooter from '@shared/layout/AppFooter.vue'

const route = useRoute()
const isRoom3DPage = computed(() => route.path.startsWith('/room3d'))
const isHomePage = computed(() => route.name === 'home')
const isProductsPage = computed(() => route.name === 'products')
const isProductDetailPage = computed(() => route.name === 'product-detail')
const isContactPage = computed(() => route.name === 'contact')
const isCheckoutPage = computed(() => route.name === 'checkout')
const isAccountPage = computed(() => route.path.startsWith('/account'))
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
          !isRoom3DPage &&
          !isHomePage &&
          !isProductDetailPage &&
          !isProductsPage &&
          !isContactPage &&
          !isCheckoutPage,
        'app-main--home': isHomePage,
        'app-main--products': isProductsPage,
        'app-main--product-detail': isProductDetailPage,
        'app-main--contact': isContactPage,
        'app-main--checkout': isCheckoutPage,
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

.app-main--checkout {
  max-width: none;
  margin: 0;
  padding: 56px 0 0;
  background: #faf6f0;
}
</style>
