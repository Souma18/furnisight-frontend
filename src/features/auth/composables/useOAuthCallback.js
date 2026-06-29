import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { openAuthModal } from '../lib/authModalBus'

export function useOAuthCallback() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  onMounted(async () => {
    const accessToken = route.query.access_token
    const refreshToken = route.query.refresh_token

    if (accessToken && refreshToken) {
      authStore.setSession({ accessToken, refreshToken })
      try {
        await authStore.ensureProfileLoaded()
      } catch (error) {
        router.replace({ name: 'home' })
        openAuthModal()
        return
      }
      router.replace(route.query.redirect || '/account')
      return
    }

    router.replace({ name: 'home' })
    openAuthModal()
  })
}
