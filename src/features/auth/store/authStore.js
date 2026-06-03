import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAdminRole } from '../utils/normalizeAuthSession'
import { AuthProfileResponse, AuthSessionResponse } from '@shared/lib/api/services/auth/auth.model'

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

const ROLES_STORAGE_KEY = 'auth_roles'

function readStoredRoles() {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStoredRoles(roles) {
  if (roles && roles.length) {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
  } else {
    localStorage.removeItem(ROLES_STORAGE_KEY)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const initialAccessToken = normalizeJwtToken(localStorage.getItem('access_token'))
  const initialRefreshToken = normalizeStoredToken(localStorage.getItem('refresh_token'))
  const initialProfile = initialAccessToken ? normalizeStoredProfile(readStoredProfile()) : null
  const initialRoles = initialAccessToken ? readStoredRoles() : []

  if (!initialAccessToken) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    writeStoredProfile(null)
    writeStoredRoles([])
  }

  const user = ref(initialProfile)
  const token = ref(initialAccessToken)
  const refreshToken = ref(initialRefreshToken)
  const roles = ref(initialRoles)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => isAdminRole(roles.value.length ? roles.value : user.value?.role))

  function setSession(sessionPayload = {}) {
    const session = sessionPayload instanceof AuthSessionResponse
      ? sessionPayload
      : new AuthSessionResponse(sessionPayload)
    const normalizedAccessToken = normalizeJwtToken(session.accessToken)
    const normalizedRefreshToken = normalizeStoredToken(session.refreshToken)
    const normalizedProfile = normalizeStoredProfile(session.profile)

    token.value = normalizedAccessToken
    refreshToken.value = normalizedRefreshToken
    user.value = normalizedProfile
    roles.value = session.roles || []
    
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

    writeStoredProfile(normalizedProfile)
    writeStoredRoles(roles.value)
  }

  function logout() {
    setSession({ accessToken: null, refreshToken: null, profile: null, roles: [] })
    document.documentElement.classList.remove('admin-route-active')
  }

  return { user, token, refreshToken, roles, isAuthenticated, isAdmin, setSession, logout }
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

function normalizeStoredProfile(value) {
  if (!value || typeof value !== 'object') return null
  return new AuthProfileResponse(value)
}
