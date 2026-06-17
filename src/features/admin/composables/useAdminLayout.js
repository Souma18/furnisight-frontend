import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuth } from '@features/auth/composables/useAuth'
import { useAuthStore } from '@features/auth/store/authStore'
import { adminApi } from '@shared/lib/api/services'
import { getAdminInbox } from '@features/chat/api/messageServiceApi'
import { normalizeConversationList } from '@features/chat/lib/chatMappers'
import { ADMIN_NAV_SECTIONS, ADMIN_PAGE_TITLES } from '../config/adminNav'
import { ADMIN_SIM_USERS } from '../config/adminLayoutContent'

const ROLE_PRESETS = {
  ADMIN: { role: 'Super Administrator', roleTag: 'Super Admin', rtClass: 'rt-super', roleIcon: 'crown' },
  MANAGER: { role: 'Manager', roleTag: 'Manager', rtClass: 'rt-manager', roleIcon: 'shield' },
  STAFF: { role: 'Staff', roleTag: 'Staff', rtClass: 'rt-staff', roleIcon: 'user' },
}

const navBadges = ref({})
let badgeLoadPromise = null
let badgesLoaded = false

const PENDING_ORDER_STATUSES = new Set(['pending', 'unpaid', 'payment_failed'])

function buildInitials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || ''
  const b = (lastName || '').trim()[0] || ''
  const initials = (a + b).toUpperCase()
  return initials || 'AD'
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  if (data?.data && data.data !== data) return unwrapList(data.data)
  return []
}

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase()
}

function isPendingOrder(order = {}) {
  const status = normalizeStatus(order.status || order.statusKey || order.rawStatus)
  const label = normalizeStatus(order.statusLabel)
  return PENDING_ORDER_STATUSES.has(status) || status === 'pending' || label.includes('chờ')
}

function isLowInventoryItem(item = {}) {
  const stock = Number(item.stock ?? item.stockQuantity ?? 0)
  const threshold = Number(item.threshold ?? item.lowStockThreshold ?? 0)
  return stock <= 0 || (threshold > 0 && stock > 0 && stock <= threshold)
}

function formatBadgeCount(count) {
  return count > 0 ? String(count) : null
}

async function loadNavBadges() {
  if (badgesLoaded) return
  if (badgeLoadPromise) return badgeLoadPromise

  badgeLoadPromise = Promise.allSettled([
    adminApi.fetchOrders({ size: 500 }),
    adminApi.fetchInventory({ size: 1000 }),
    getAdminInbox({ size: 500 }),
  ]).then(([ordersResult, inventoryResult, inboxResult]) => {
    const nextBadges = {}

    if (ordersResult.status === 'fulfilled') {
      const orders = unwrapList(ordersResult.value?.data)
      nextBadges.orders = formatBadgeCount(orders.filter(isPendingOrder).length)
    }

    if (inventoryResult.status === 'fulfilled') {
      const items = unwrapList(inventoryResult.value?.data)
      nextBadges.inventory = formatBadgeCount(items.filter(isLowInventoryItem).length)
    }

    if (inboxResult.status === 'fulfilled') {
      const conversations = normalizeConversationList(inboxResult.value)
      nextBadges.conversations = formatBadgeCount(
        conversations.filter((item) => Boolean(item.unread ?? item.hasUnread)).length,
      )
    }

    navBadges.value = nextBadges
    badgesLoaded = true
    badgeLoadPromise = null
  })

  return badgeLoadPromise
}

export function useAdminLayout() {
  const route = useRoute()
  const router = useRouter()
  const { logout: authLogout } = useAuth()
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  const currentAdmin = computed(() => {
    const profile = user.value || {}
    const rolesList = authStore.roles || []
    const firstRole = rolesList[0] || profile.role || ''
    const normalizedRole = String(firstRole).toUpperCase().replace(/^ROLE_/, '')
    const cleanRole = String(firstRole).replace(/^ROLE_/i, '')
    const preset = ROLE_PRESETS[normalizedRole] || { role: cleanRole || 'Admin', roleTag: cleanRole || 'Admin', rtClass: 'rt-manager', roleIcon: 'shield' }
    const fallback = ADMIN_SIM_USERS.super
    const fullName = profile.displayName || `${profile.lastName ?? ''} ${profile.firstName ?? ''}`.trim()

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
    return navBadges.value[key] ?? null
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

  onMounted(loadNavBadges)

  const filteredNavSections = computed(() => {
    return ADMIN_NAV_SECTIONS.map(section => {
      const filteredItems = section.items.filter(item => {
        if (!item.permission) return true
        return authStore.hasPermission(item.permission)
      })
      return {
        ...section,
        items: filteredItems
      }
    }).filter(section => section.items.length > 0)
  })

  return {
    navSections: filteredNavSections,
    simUser: currentAdmin,
    currentAdmin,
    pageTitleHtml,
    navBadge,
    isActive,
    go,
    logout,
  }
}
