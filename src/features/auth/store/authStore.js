import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))

  const isAuthenticated = computed(() => Boolean(token.value))

  function setSession({ accessToken, profile }) {
    token.value = accessToken
    user.value = profile ?? null
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
    } else {
      localStorage.removeItem('access_token')
    }
  }

  function logout() {
    setSession({ accessToken: null, profile: null })
  }

  return { user, token, isAuthenticated, setSession, logout }
})
