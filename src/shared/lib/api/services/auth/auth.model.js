function unwrapApiPayload(data = {}) {
  const envelope = data?.data ?? data
  return envelope?.data ?? envelope ?? {}
}

export class AuthProfileResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.id = data.id ?? null
    this.accountId = data.accountId ?? null
    this.email = data.email || ''
    this.fullName = data.fullName || data.name || ''
    this.displayName = data.displayName || this.fullName
    this.avatarUrl = data.avatarUrl || ''
    this.avatarMediaId = data.avatarMediaId || null
    this.bio = data.bio || ''
    this.birthday = data.birthday || null
    this.gender = data.gender || ''
    this.role = data.role || ''
    this.status = data.status || ''
    this.createdAt = data.createdAt ?? null
  }
}

export class AuthSessionResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    const payload = unwrapApiPayload(data)
    const profile = payload.profile ?? payload.user ?? payload.account ?? payload.customer ?? null

    this.accessToken = payload.accessToken ?? payload.access_token ?? payload.token ?? payload.jwt ?? payload.idToken ?? ''
    this.refreshToken = payload.refreshToken ?? payload.refresh_token ?? payload.refresh ?? ''
    this.expiresIn = payload.expiresIn ?? payload.expires_in ?? 0
    this.roles = payload.roles ?? payload.authorities ?? (profile?.role ? [profile.role] : [])
    this.profile = profile && typeof profile === 'object' ? new AuthProfileResponse(profile) : null
  }
}

export class TokenResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    const payload = unwrapApiPayload(data)

    this.accessToken = payload.accessToken ?? payload.access_token ?? payload.token ?? payload.jwt ?? payload.idToken ?? ''
    this.refreshToken = payload.refreshToken ?? payload.refresh_token ?? payload.refresh ?? ''
    this.expiresIn = payload.expiresIn ?? payload.expires_in ?? 0
  }
}

export function normalizeAuthSession(data) {
  return new AuthSessionResponse(data)
}
