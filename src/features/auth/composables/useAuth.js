import { storeToRefs } from 'pinia'
import { router } from '@/app/router'
import { useAuthStore } from '../store/authStore'
import { authApi } from '@shared/lib/api/services'
import { normalizeAuthSession } from '../utils/normalizeAuthSession'
import { resetUserSessionState } from '../utils/resetUserSessionState'

export function useAuth(pinia) {
  const store = useAuthStore(pinia)
  const { user, isAuthenticated, isAdmin } = storeToRefs(store)

  async function renewToken() {
    const refreshToken = store.refreshToken || localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await authApi.renewAccessToken({ refreshToken })
    const session = normalizeAuthSession(response)
    store.setSession(session)
    // Không gọi ensureProfileLoaded() ở đây vì đang trong interceptor —
    // sẽ gây thêm request API và có thể tạo vòng lặp retry.
    return session
  }

  /** @param {{ name: string } | string} [redirectTo] */
  async function logout(redirectTo = { name: 'home' }, options = {}) {
    const { clearRemoteCart = true } = options
    await resetUserSessionState({ clearRemoteCart: clearRemoteCart && store.isAuthenticated })
    store.logout()
    if (redirectTo) {
      await router.push(redirectTo)
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    setSession: store.setSession,
    ensureProfileLoaded: store.ensureProfileLoaded,
    logout,
    renewToken,
  }
}
