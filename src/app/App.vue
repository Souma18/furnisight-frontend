<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@shared/layout/AppHeader.vue'
import AppFooter from '@shared/layout/AppFooter.vue'
import ChatWidget from '@features/chat/components/ChatWidget.vue'
import AuthModal from '@features/auth/components/AuthModal.vue'
import { AUTH_MODAL_EVENT, consumePendingAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'

const route = useRoute()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const isRoom3DPage = computed(() => route.path.startsWith('/room3d'))
const isHomePage = computed(() => route.name === 'home')
const isProductsPage = computed(() => route.name === 'products')
const isProductDetailPage = computed(() => route.name === 'product-detail')
const isContactPage = computed(() => route.name === 'contact')
const isCheckoutPage = computed(() => route.name === 'checkout')
const isAccountPage = computed(() => route.path.startsWith('/account'))
const isAdminPage = computed(() => route.path.startsWith('/admin'))
const mainRef = ref(null)
const isAuthModalOpen = ref(false)
const initialAuthView = ref('login')
let resizeObserver = null
let mutationObserver = null

function syncHeaderScrollbarInset() {
  const el = mainRef.value
  const scrollbarWidth = el ? Math.max(0, el.offsetWidth - el.clientWidth) : 0
  document.documentElement.style.setProperty('--app-main-scrollbar-width', `${scrollbarWidth}px`)
}

function openAuthModalFromEvent(event) {
  initialAuthView.value = event?.detail?.initialView || 'login'
  isAuthModalOpen.value = true
}

onMounted(async () => {
  await nextTick()
  syncHeaderScrollbarInset()
  window.addEventListener('resize', syncHeaderScrollbarInset)
  window.addEventListener('load', syncHeaderScrollbarInset)
  window.addEventListener(AUTH_MODAL_EVENT, openAuthModalFromEvent)

  const pendingView = consumePendingAuthModal()
  if (pendingView) {
    initialAuthView.value = pendingView
    isAuthModalOpen.value = true
  }

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
  () => route.fullPath,
  async () => {
    await nextTick()
    syncHeaderScrollbarInset()
  },
)

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    isAuthModalOpen.value = false
    initialAuthView.value = 'login'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncHeaderScrollbarInset)
  window.removeEventListener('load', syncHeaderScrollbarInset)
  window.removeEventListener(AUTH_MODAL_EVENT, openAuthModalFromEvent)
  resizeObserver?.disconnect()
  resizeObserver = null
  mutationObserver?.disconnect()
  mutationObserver = null
})
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!isRoom3DPage && !isAdminPage" />
    <main
      ref="mainRef"
      class="app-main"
      :class="{
        'app-main--fluid': isRoom3DPage || isAdminPage,
        'app-main--with-header':
          !isRoom3DPage &&
          !isAdminPage &&
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
      <AppFooter v-if="!isRoom3DPage && !isAccountPage && !isAdminPage" />
    </main>
    <ChatWidget v-if="!isRoom3DPage && !isAdminPage" />
    <AuthModal
      :open="isAuthModalOpen"
      :initial-view="initialAuthView"
      @close="isAuthModalOpen = false"
      @authenticated="isAuthModalOpen = false"
    />
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
