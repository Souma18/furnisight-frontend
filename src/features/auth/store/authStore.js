import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAdminRole } from '../utils/normalizeAuthSession'
import { AuthProfileResponse, AuthSessionResponse } from '@shared/lib/api/services/auth/auth.model'
import { usersApi } from '@shared/lib/api/services/users/users.api'

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
  const profileLoading = ref(false)
  let profileLoadPromise = null

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => isAdminRole(roles.value.length ? roles.value : user.value?.role))
  const isCustomer = computed(() => isAuthenticated.value && !isAdmin.value)
  const hasProfileIdentity = computed(() => Boolean(user.value?.id || user.value?.accountId || user.value?.email))

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

  function updateProfile(profile = {}) {
    const mergedProfile = normalizeStoredProfile({
      ...(user.value || {}),
      ...profile,
    })
    user.value = mergedProfile
    writeStoredProfile(mergedProfile)
  }

  async function ensureProfileLoaded({ force = false } = {}) {
    if (!isAuthenticated.value) return null
    if (!force && hasProfileIdentity.value) return user.value
    if (profileLoadPromise) return profileLoadPromise

    profileLoading.value = true
    profileLoadPromise = usersApi.getProfile()
      .then((response) => {
        const profile = unwrapApiData(response)
        if (!profile || typeof profile !== 'object') {
          throw new Error('Không tải được thông tin người dùng.')
        }
        updateProfile(profile)
        return user.value
      })
      .catch((error) => {
        const status = error?.response?.status
        if (status === 401 || status === 403) {
          logout()
        }
        throw error
      })
      .finally(() => {
        profileLoading.value = false
        profileLoadPromise = null
      })

    return profileLoadPromise
  }

  return {
    user,
    token,
    refreshToken,
    roles,
    profileLoading,
    isAuthenticated,
    isAdmin,
    isCustomer,
    hasProfileIdentity,
    setSession,
    updateProfile,
    ensureProfileLoaded,
    logout,
  }
})

function normalizeJwtToken(value) {
  if (typeof value !== 'string') return null

  const token = value.trim().replace(/^Bearer\s+/i, '')
  if (!token) return null

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

function unwrapApiData(response) {
  return response?.data?.data ?? response?.data ?? response
}
