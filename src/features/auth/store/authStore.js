import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { AuthSessionResponse } from '@shared/lib/api/services/auth/auth.model'
import { usersApi } from '@shared/lib/api/services/users/users.api'
import { authApi } from '@shared/lib/api/services/auth/auth.api'
import {
  clearStoredAuthSession,
  decodeJwt,
  readStoredAccessToken,
  readStoredProfile,
  readStoredRefreshToken,
  readStoredRoles,
  writeStoredAccessToken,
  writeStoredProfile,
  writeStoredRefreshToken,
  writeStoredRoles,
} from '../lib/authSessionStorage'
import {
  isAdminRole,
  normalizeJwtToken,
  normalizeRoles,
  normalizeStoredProfile,
  normalizeStoredToken,
  unwrapApiData,
} from '../lib/authNormalizers'

export const useAuthStore = defineStore('auth', () => {
  const initialAccessToken = readStoredAccessToken()
  const initialRefreshToken = readStoredRefreshToken()
  const initialProfile = initialAccessToken ? normalizeStoredProfile(readStoredProfile()) : null
  const initialRoles = initialAccessToken ? readStoredRoles() : []
  const initialDecoded = initialAccessToken ? decodeJwt(initialAccessToken) : {}
  const initialPermissions = initialDecoded.permissions || []
  const initialIsAdmin = initialDecoded.isAdmin === true

  if (!initialAccessToken) {
    clearStoredAuthSession()
  }

  const user = ref(initialProfile)
  const token = ref(initialAccessToken)
  const refreshToken = ref(initialRefreshToken)
  const roles = ref(initialRoles)
  const permissions = ref(initialPermissions)
  const adminFlag = ref(initialIsAdmin)
  const profileLoading = ref(false)
  let profileLoadPromise = null

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => adminFlag.value)
  const isCustomer = computed(() => isAuthenticated.value && !isAdmin.value)
  const hasProfileIdentity = computed(() => Boolean(user.value?.id || user.value?.accountId || user.value?.email))

  const hasPermission = (permission) => {
    // Super admins always have all permissions
    if (isAdminRole(user.value?.role) || isAdminRole(roles.value)) {
      return true
    }
    return permissions.value.includes(permission)
  }

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
    roles.value = normalizeRoles(session.roles)
    
    if (normalizedAccessToken) {
      writeStoredAccessToken(normalizedAccessToken)
      const decoded = decodeJwt(normalizedAccessToken)
      permissions.value = decoded.permissions || []
      adminFlag.value = decoded.isAdmin === true
    } else {
      writeStoredAccessToken(null)
      permissions.value = []
      adminFlag.value = false
    }

    writeStoredRefreshToken(normalizedRefreshToken)
    writeStoredProfile(normalizedProfile)
    writeStoredRoles(roles.value)
  }

  async function loginGoogle() {
    try {
      const response = await authApi.loginGoogle()
      const redirectUrl = response.data?.data?.redirectUrl || response.data?.redirectUrl
      if (redirectUrl) {
        const beURL = import.meta.env.VITE_API_BASE_URL ?? ''
        window.location.href = `${beURL}/users${redirectUrl}`
      }
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
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
    permissions,
    hasPermission,
    profileLoading,
    isAuthenticated,
    isAdmin,
    isCustomer,
    hasProfileIdentity,
    setSession,
    updateProfile,
    ensureProfileLoaded,
    loginGoogle,
    logout,
  }
})
