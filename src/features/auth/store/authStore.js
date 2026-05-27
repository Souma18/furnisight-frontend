import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAdminRole } from '../utils/normalizeAuthSession'

const PROFILE_STORAGE_KEY = 'auth_profile'

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredProfile(profile) {
  if (profile) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } else {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(readStoredProfile())
  const token = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => isAdminRole(user.value?.role))

  function setSession({ accessToken, refreshToken: newRefreshToken, profile } = {}) {
    if (accessToken !== undefined) {
      token.value = accessToken
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
      } else {
        localStorage.removeItem('access_token')
      }
    }

    if (newRefreshToken !== undefined) {
      refreshToken.value = newRefreshToken
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken)
      } else {
        localStorage.removeItem('refresh_token')
      }
    }

    if (profile !== undefined) {
      user.value = profile
      writeStoredProfile(profile)
    }
  }

  function logout() {
    setSession({ accessToken: null, refreshToken: null, profile: null })
    document.documentElement.classList.remove('admin-route-active')
  }

  return { user, token, refreshToken, isAuthenticated, isAdmin, setSession, logout }
})
