import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { renewAccessTokenRequest } from '../api/authApi'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const { user, isAuthenticated, isAdmin } = storeToRefs(store)

  async function renewToken() {
    const refreshToken = store.refreshToken || localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await renewAccessTokenRequest({ refreshToken })
    const data = response.data?.data || response.data
    store.setSession(data)
    return data
  }

  /** @param {{ name: string } | string} [redirectTo] */
  async function logout(redirectTo = { name: 'home' }) {
    store.logout()
    await router.push(redirectTo)
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    setSession: store.setSession,
    logout,
    renewToken,
  }
}
