<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { router } from './router'
import AppHeader from '@shared/layout/AppHeader.vue'
import AppFooter from '@shared/layout/AppFooter.vue'
import AuthModal from '@features/auth/components/AuthModal.vue'
import { AUTH_MODAL_EVENT, consumePendingAuthModal } from '@features/auth/lib/authModalBus'
import { useAuthStore } from '@features/auth/store/authStore'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useThemeStore } from '@shared/stores/themeStore'
import { useLocaleStore } from '@shared/stores/localeStore'
import AppToast from '@shared/ui/AppToast.vue'

const ChatWidget = defineAsyncComponent(() => import('@features/chat/components/ChatWidget.vue'))
const route = router.currentRoute
const authStore = useAuthStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const { isAuthenticated } = storeToRefs(authStore)
const isRoom3DPage = computed(() => route.value.path.startsWith('/room3d'))
const isHomePage = computed(() => route.value.name === 'home')
const isProductsPage = computed(() => route.value.name === 'products')
const isProductDetailPage = computed(() => route.value.name === 'product-detail')

const isPromotionsPage = computed(() => route.value.name === 'promotions')
const isCheckoutPage = computed(() => route.value.name === 'checkout')
const isAccountPage = computed(() => route.value.path.startsWith('/account'))
const isAdminPage = computed(() => route.value.path.startsWith('/admin'))
const mainRef = ref(null)
const isAuthModalOpen = ref(false)
const initialAuthView = ref('login')
const chatWidgetReady = ref(false)
const showBackToTop = ref(false)
let resizeObserver = null
let chatIdleHandle = null
let chatReadyTimer = null

function syncHeaderScrollbarInset() {
  const el = mainRef.value
  const scrollbarWidth = el ? Math.max(0, el.offsetWidth - el.clientWidth) : 0
  document.documentElement.style.setProperty('--app-main-scrollbar-width', `${scrollbarWidth}px`)
}

function handleMainScroll(event) {
  showBackToTop.value = event.currentTarget.scrollTop > 500
}

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mainRef.value?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

function openAuthModalFromEvent(event) {
  const isGuardSet = sessionStorage.getItem('furnisight:intended-route-guard') === 'true'
  if (!isGuardSet) {
    const currentPath = window.location.pathname + window.location.search + window.location.hash
    if (!currentPath.startsWith('/auth')) {
      sessionStorage.setItem('furnisight:intended-route', currentPath)
    }
  }
  initialAuthView.value = event?.detail?.initialView || 'login'
  isAuthModalOpen.value = true
}

async function ensureAuthProfile() {
  if (!authStore.isAuthenticated) return
  try {
    await authStore.ensureProfileLoaded()
  } catch (error) {
    console.error('[App] ensureProfileLoaded', error)
  }
}

async function closeAuthModal() {
  isAuthModalOpen.value = false
  initialAuthView.value = 'login'

  if (route.value.query.otpCode) {
    const query = { ...route.value.query }
    delete query.otpCode
    await router.replace({ query })
  }
}

async function onAuthSuccess() {
  const intendedRoute = sessionStorage.getItem('furnisight:intended-route')
  sessionStorage.removeItem('furnisight:intended-route')
  sessionStorage.removeItem('furnisight:intended-route-guard')
  await closeAuthModal()
  if (intendedRoute && intendedRoute !== route.value.fullPath) {
    await router.push(intendedRoute)
  }
}

onMounted(async () => {
  themeStore.initTheme()
  localeStore.initLocale()
  await nextTick()
  ensureAuthProfile()
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

  if (typeof window.requestIdleCallback === 'function') {
    chatIdleHandle = window.requestIdleCallback(
      () => {
        chatWidgetReady.value = true
      },
      { timeout: 2500 },
    )
  } else {
    chatReadyTimer = window.setTimeout(() => {
      chatWidgetReady.value = true
    }, 1200)
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
  if (!authenticated) {
    initialAuthView.value = 'login'
    return
  }

  ensureAuthProfile()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncHeaderScrollbarInset)
  window.removeEventListener('load', syncHeaderScrollbarInset)
  window.removeEventListener(AUTH_MODAL_EVENT, openAuthModalFromEvent)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (chatIdleHandle != null && typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(chatIdleHandle)
  }
  if (chatReadyTimer != null) window.clearTimeout(chatReadyTimer)
})
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!isRoom3DPage && !isAdminPage" />
    <main
      ref="mainRef"
      class="app-main"
      @scroll.passive="handleMainScroll"
      :class="{
        'app-main--fluid': isRoom3DPage || isAdminPage,
        'app-main--with-header':
          !isRoom3DPage &&
          !isAdminPage &&
          !isHomePage &&
          !isProductDetailPage &&
          !isProductsPage &&

          !isPromotionsPage &&
          !isCheckoutPage,
        'app-main--home': isHomePage,
        'app-main--products': isProductsPage,
        'app-main--product-detail': isProductDetailPage,

        'app-main--promotions': isPromotionsPage,
        'app-main--checkout': isCheckoutPage,
        'app-main--account': isAccountPage,
      }"
    >
      <div class="app-page-content">
        <RouterView />
      </div>
      <AppFooter v-if="!isRoom3DPage && !isAccountPage && !isAdminPage" />
    </main>
    <ChatWidget v-if="authStore.isAuthenticated && chatWidgetReady && !isRoom3DPage && !isAdminPage" />
    <Transition name="back-to-top">
      <button
        v-if="showBackToTop && !isRoom3DPage && !isAdminPage"
        type="button"
        class="back-to-top"
        title="Lên đầu trang"
        aria-label="Lên đầu trang"
        @click="scrollToTop"
      >
        <AppIcon name="chevronUp" :size="20" :stroke-width="2.2" />
      </button>
    </Transition>
    <AuthModal
      :key="initialAuthView"
      :open="isAuthModalOpen"
      :initial-view="initialAuthView"
      @close="closeAuthModal"
      @authenticated="onAuthSuccess"
    />
    <AppToast />
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
  display: flex;
  flex-direction: column;
  overflow: auto;
}

/* Đẩy footer xuống đáy: content chiếm hết không gian còn lại */
.app-page-content {
  flex: 1 0 auto;
  min-height: 0;
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

/* Tất cả trang full-width: reset max-width + padding mặc định của .app-main */
.app-main--home,
.app-main--product-detail,
.app-main--products,
.app-main--promotions,
.app-main--checkout {
  max-width: none;
  margin: 0;
  padding: 56px 0 0;
}

.app-main--home {
  background: var(--app-bg-deep);
}

.app-main--products,
.app-main--promotions,
.app-main--checkout {
  background: var(--app-bg);
}

.app-main--account {
  max-width: none;
  margin: 0;
  padding: calc(62px + 20px) 16px 24px;
  background: var(--app-bg);
}

.back-to-top {
  align-items: center;
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  border-radius: 8px;
  bottom: 104px;
  box-shadow: 0 10px 28px rgba(18, 32, 46, 0.16);
  color: var(--app-heading);
  cursor: pointer;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  position: fixed;
  right: 28px;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
  width: 42px;
  z-index: 1180;
}

.back-to-top:hover,
.back-to-top:focus-visible {
  background: #c9922a;
  border-color: #c9922a;
  color: var(--brand-navy-900);
  transform: translateY(-2px);
}

.back-to-top:focus-visible {
  outline: 2px solid var(--app-focus-ring);
  outline-offset: 3px;
}

.back-to-top:active { transform: translateY(0); }

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 780px) {
  .app-main--account {
    padding: calc(62px + 12px) 12px 18px;
  }

  .back-to-top {
    bottom: 88px;
    right: 16px;
  }
}

</style>
