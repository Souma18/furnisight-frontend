import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuth } from '@features/auth/composables/useAuth'
import { ADMIN_NAV_SECTIONS, ADMIN_PAGE_TITLES } from '../config/adminNav'
import { ADMIN_NAV_BADGES, ADMIN_SIM_USERS } from '../mock/adminSeedMock'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminLayout() {
  const route = useRoute()
  const router = useRouter()
  const { logout: authLogout } = useAuth()
  const uiStore = useAdminUiStore()
  const { simUserKey } = storeToRefs(uiStore)

  const simUser = computed(() => ADMIN_SIM_USERS[simUserKey.value] ?? ADMIN_SIM_USERS.super)
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

  function switchSimUser(key) {
    uiStore.setSimUser(key)
    uiStore.showToast({ icon: 'users', title: 'Đã chuyển tài khoản', subtitle: `Đang xem với quyền: ${ADMIN_SIM_USERS[key]?.role}` })
  }

  function logout() {
    authLogout({ name: 'home' })
  }

  return {
    navSections: ADMIN_NAV_SECTIONS,
    simUser,
    pageTitleHtml,
    navBadge,
    isActive,
    go,
    switchSimUser,
    logout,
  }
}
