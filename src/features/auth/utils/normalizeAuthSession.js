/** Chuẩn hóa payload login từ mock hoặc API thật (axios / nested data). */
export function normalizeAuthSession(apiResponse) {
  const envelope = apiResponse?.data ?? apiResponse
  const payload = envelope?.data ?? envelope
  const profile = payload.profile ?? payload.user ?? null

  return {
    accessToken: payload.accessToken ?? payload.access_token ?? null,
    refreshToken: payload.refreshToken ?? payload.refresh_token ?? null,
    profile: profile && typeof profile === 'object' ? profile : null,
  }
}

export function normalizeRole(role) {
  if (!role) return ''
  return String(role).toUpperCase().replace(/^ROLE_/, '')
}

export function isAdminRole(role) {
  return normalizeRole(role) === 'ADMIN'
}
