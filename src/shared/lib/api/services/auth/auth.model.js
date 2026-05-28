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
    this.email = data.email || ''
    this.firstName = data.firstName || ''
    this.lastName = data.lastName || ''
    this.avatarUrl = data.avatarUrl || ''
    this.phone = data.phone || data.phoneNumber || ''
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
    const profile = payload.profile ?? payload.user ?? null

    this.accessToken = payload.accessToken ?? payload.access_token ?? ''
    this.refreshToken = payload.refreshToken ?? payload.refresh_token ?? ''
    this.expiresIn = payload.expiresIn ?? payload.expires_in ?? 0
    this.roles = payload.roles ?? []
    this.profile = profile && typeof profile === 'object' ? new AuthProfileResponse(profile) : null
  }
}

export class TokenResponse {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    const payload = unwrapApiPayload(data)

    this.accessToken = payload.accessToken ?? payload.access_token ?? ''
    this.refreshToken = payload.refreshToken ?? payload.refresh_token ?? ''
    this.expiresIn = payload.expiresIn ?? payload.expires_in ?? 0
  }
}

export function normalizeAuthSession(data) {
  return new AuthSessionResponse(data)
}
