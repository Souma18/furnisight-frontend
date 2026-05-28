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
  const initialAccessToken = normalizeJwtToken(localStorage.getItem('access_token'))
  const initialRefreshToken = normalizeStoredToken(localStorage.getItem('refresh_token'))

  if (!initialAccessToken) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const user = ref(null)
  const token = ref(initialAccessToken)
  const refreshToken = ref(initialRefreshToken)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => isAdminRole(user.value?.role))

  function setSession({ accessToken, refreshToken: newRefreshToken, profile }) {
    const normalizedAccessToken = normalizeJwtToken(accessToken)
    const normalizedRefreshToken = normalizeStoredToken(newRefreshToken)

    token.value = normalizedAccessToken
    refreshToken.value = normalizedRefreshToken
    user.value = profile ?? null
    
    if (normalizedAccessToken) {
      localStorage.setItem('access_token', normalizedAccessToken)
    } else {
      localStorage.removeItem('access_token')
    }

    if (normalizedRefreshToken) {
      localStorage.setItem('refresh_token', normalizedRefreshToken)
    } else {
      localStorage.removeItem('refresh_token')
    }
  }

  function logout() {
    setSession({ accessToken: null, refreshToken: null, profile: null })
    document.documentElement.classList.remove('admin-route-active')
  }

  return { user, token, refreshToken, isAuthenticated, isAdmin, setSession, logout }
})

function normalizeJwtToken(value) {
  if (typeof value !== 'string') return null

  const token = value.trim()
  if (!token) return null

  const segments = token.split('.')
  if (segments.length !== 3 || segments.some((segment) => !segment)) {
    return null
  }

  return token
}

function normalizeStoredToken(value) {
  if (typeof value !== 'string') return null

  const token = value.trim()
  return token || null
}
