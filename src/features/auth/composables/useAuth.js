import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const store = useAuthStore()
  const { user, isAuthenticated } = storeToRefs(store)
  return {
    user,
    isAuthenticated,
    setSession: store.setSession,
    logout: store.logout,
  }
}
