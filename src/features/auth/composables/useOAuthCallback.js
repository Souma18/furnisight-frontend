import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

export function useOAuthCallback() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  onMounted(() => {
    const accessToken = route.query.access_token
    const refreshToken = route.query.refresh_token

    if (accessToken && refreshToken) {
      authStore.setSession({ accessToken, refreshToken })
      router.replace(route.query.redirect || '/account')
      return
    }

    router.replace({ name: 'login' })
  })
}
