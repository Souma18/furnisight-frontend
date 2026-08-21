import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '@features/cart/store/cartStore'
import { openAuthModal } from '../lib/authModalBus'

export function useOAuthCallback() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const cartStore = useCartStore()

  onMounted(async () => {
    const accessToken = route.query.access_token
    const refreshToken = route.query.refresh_token

    if (accessToken && refreshToken) {
      authStore.setSession({ accessToken, refreshToken })
      try {
        await authStore.ensureProfileLoaded()
        await cartStore.ensureHydrated({ force: true }).catch(() => null)
      } catch (error) {
        router.replace({ name: 'home' })
        openAuthModal()
        return
      }
      const queryRedirect = route.query.redirect
      const intendedRoute = sessionStorage.getItem('furnisight:intended-route')
      sessionStorage.removeItem('furnisight:intended-route')
      sessionStorage.removeItem('furnisight:intended-route-guard')

      let targetRoute = queryRedirect || intendedRoute
      if (!targetRoute || targetRoute.startsWith('/auth')) {
        targetRoute = authStore.isAdmin ? '/admin' : '/'
      }
      router.replace(targetRoute)
      return
    }

    router.replace({ name: 'home' })
    openAuthModal()
  })
}
