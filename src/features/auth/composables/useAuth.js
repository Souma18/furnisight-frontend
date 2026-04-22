import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/authStore'
import { renewAccessTokenRequest } from '../api/authApi'

export function useAuth() {
  const store = useAuthStore()
  const { user, isAuthenticated } = storeToRefs(store)

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

  return {
    user,
    isAuthenticated,
    setSession: store.setSession,
    logout: store.logout,
    renewToken,
  }
}
