import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession({ accessToken, refreshToken: newRefreshToken, profile }) {
    token.value = accessToken
    refreshToken.value = newRefreshToken
    user.value = profile ?? null
    
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
    } else {
      localStorage.removeItem('access_token')
    }

    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken)
    } else {
      localStorage.removeItem('refresh_token')
    }
  }

  function logout() {
    setSession({ accessToken: null, refreshToken: null, profile: null })
  }

  return { user, token, refreshToken, isAuthenticated, setSession, logout }
})
