import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuth } from '@features/auth/composables/useAuth'
import { useAuthStore } from '@features/auth/store/authStore'
import { ADMIN_NAV_SECTIONS, ADMIN_PAGE_TITLES } from '../config/adminNav'
import { ADMIN_NAV_BADGES, ADMIN_SIM_USERS } from '../mock/adminSeedMock'

const ROLE_PRESETS = {
  ADMIN: { role: 'Super Administrator', roleTag: 'Super Admin', rtClass: 'rt-super', roleIcon: 'crown' },
  MANAGER: { role: 'Manager', roleTag: 'Manager', rtClass: 'rt-manager', roleIcon: 'shield' },
  STAFF: { role: 'Staff', roleTag: 'Staff', rtClass: 'rt-staff', roleIcon: 'user' },
}

function buildInitials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || ''
  const b = (lastName || '').trim()[0] || ''
  const initials = (a + b).toUpperCase()
  return initials || 'AD'
}

export function useAdminLayout() {
  const route = useRoute()
  const router = useRouter()
  const { logout: authLogout } = useAuth()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  const currentAdmin = computed(() => {
    const profile = user.value || {}
    const normalizedRole = String(profile.role || 'ADMIN').toUpperCase().replace(/^ROLE_/, '')
    const preset = ROLE_PRESETS[normalizedRole] || ROLE_PRESETS.ADMIN
    const fallback = ADMIN_SIM_USERS.super
    const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()

    return {
      id: profile.id || fallback.id,
      av: buildInitials(profile.firstName, profile.lastName),
      name: fullName || fallback.name,
      email: profile.email || fallback.email,
      ...preset,
    }
  })

  const pageTitleHtml = computed(() => ADMIN_PAGE_TITLES[route.name] ?? '')

  function navBadge(key) {
    return ADMIN_NAV_BADGES[key] ?? null
  }

  function isActive(name) {
    return route.name === name
  }

  function go(name) {
    router.push({ name })
  }

  function logout() {
    authLogout({ name: 'home' })
  }

  return {
    navSections: ADMIN_NAV_SECTIONS,
    simUser: currentAdmin,
    currentAdmin,
    pageTitleHtml,
    navBadge,
    isActive,
    go,
    logout,
  }
}
