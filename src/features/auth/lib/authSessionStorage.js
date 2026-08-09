

const ACCESS_TOKEN_STORAGE_KEY = 'access_token'
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'
const PROFILE_STORAGE_KEY = 'auth_profile'
const ROLES_STORAGE_KEY = 'auth_roles'

export function readStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeStoredProfile(profile) {
  if (profile) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } else {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }
}

export function readStoredRoles() {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeStoredRoles(roles) {
  if (roles && roles.length) {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
  } else {
    localStorage.removeItem(ROLES_STORAGE_KEY)
  }
}

import { normalizeJwtToken, normalizeStoredToken } from './authNormalizers'

export function readStoredAccessToken() {
  return normalizeJwtToken(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
}

export function readStoredRefreshToken() {
  return normalizeStoredToken(localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY))
}

export function writeStoredAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  }
}

export function writeStoredRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  }
}

export function clearStoredAuthSession() {
  writeStoredAccessToken(null)
  writeStoredRefreshToken(null)
  writeStoredProfile(null)
  writeStoredRoles([])
}

export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}


