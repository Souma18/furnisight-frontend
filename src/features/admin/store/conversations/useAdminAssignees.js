import { reactive } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { getStaffId, profileNumericId } from '@features/chat/lib/chatUserIds'
import { patchAssign } from '@features/chat/api/messageServiceApi'
import { accountRoleNames, normalizeRoleName } from '../../utils/adminAccountRoles'

const SUPPORT_PERMISSION = 'CUSTOMER_SUPPORT'

const ROLE_RANKS = {
  staff: 1,
  manager: 2,
  admin: 3,
  super: 3,
  'super admin': 3,
}

function normalizePermission(permission) {
  return String(permission || '').trim().replace(/[-\s]+/g, '_').toUpperCase()
}

function normalizePermissions(permissions = []) {
  return [...new Set((permissions || []).map(normalizePermission).filter(Boolean))]
}

function roleRank(roleName) {
  return ROLE_RANKS[normalizeRoleName(roleName)] || 0
}

function supportRoleRank(roleName, permissions = []) {
  const rank = roleRank(roleName)
  if (rank > 0) return rank
  return permissions.includes(SUPPORT_PERMISSION) ? ROLE_RANKS.staff : 0
}

function bestRoleName(account = {}) {
  return accountRoleNames(account)
    .sort((a, b) => roleRank(b) - roleRank(a))[0] || ''
}

function accountDisplayName(account = {}) {
  return account.name
    || account.displayName
    || account.fullName
    || account.username
    || account.email
    || 'Admin'
}

export function useAdminAssignees(ctx) {
  const assignableAdmins = reactive({
    items: [],
    loading: false,
    loaded: false,
    error: '',
  })

  function currentAdminRank() {
    const roleNames = [
      ...(ctx.authStore.roles || []),
      ctx.authStore.user?.role,
      ...(Array.isArray(ctx.authStore.user?.roles)
        ? ctx.authStore.user.roles.map((role) => (typeof role === 'string' ? role : role?.name))
        : []),
    ].filter(Boolean)
    return Math.max(...roleNames.map(roleRank), ctx.authStore.isAdmin ? ROLE_RANKS.admin : 0)
  }

  function accountPermissions(account = {}, roleLookup = new Map()) {
    const fromAccount = normalizePermissions(account.permissions)
    const fromRoles = (account.roles || []).flatMap((role) => {
      if (typeof role === 'string') {
        return roleLookup.get(normalizeRoleName(role))?.permissions || []
      }
      return role.permissions || roleLookup.get(normalizeRoleName(role?.name))?.permissions || []
    })
    const fromSingleRole = roleLookup.get(normalizeRoleName(account.role))?.permissions || []
    return normalizePermissions([...fromAccount, ...fromRoles, ...fromSingleRole])
  }

  function normalizeAssignableAdmin(account = {}, roleLookup = new Map()) {
    const role = bestRoleName(account)
    const permissions = accountPermissions(account, roleLookup)
    const rank = supportRoleRank(role, permissions)
    const staffId = profileNumericId(account, 1_500_000_000, 600_000_000)
    const name = accountDisplayName(account)

    return {
      id: account.id ?? account.accountId ?? staffId,
      staffId,
      name,
      email: account.email || '',
      role,
      rank,
      permissions,
      av: account.av || String(name || account.email || 'A').slice(0, 1).toUpperCase(),
      canSupport: permissions.includes(SUPPORT_PERMISSION),
      active: !['banned', 'blocked', 'locked', 'inactive', 'disabled'].includes(String(account.status || '').toLowerCase()),
    }
  }

  async function loadAssignableAdmins(force = false) {
    if (assignableAdmins.loading || (assignableAdmins.loaded && !force)) return

    assignableAdmins.loading = true
    assignableAdmins.error = ''
    try {
      const [userRes, roleRes] = await Promise.all([
        adminApi.fetchAdminUsers({ size: 500 }),
        adminApi.fetchRoles(),
      ])
      const accounts = Array.isArray(userRes.data) ? userRes.data : userRes.data?.items ?? []
      const roles = Array.isArray(roleRes.data) ? roleRes.data : roleRes.data?.items ?? []
      const roleLookup = new Map(
        roles.map((role) => [
          normalizeRoleName(role.name),
          { ...role, permissions: normalizePermissions(role.permissions) },
        ]),
      )
      const ownRank = currentAdminRank()
      const ownStaffId = getStaffId()

      assignableAdmins.items = accounts
        .map((account) => normalizeAssignableAdmin(account, roleLookup))
        .filter((account) => account.staffId && account.active && account.canSupport)
        .filter((account) => {
          if (ownRank <= ROLE_RANKS.staff) return account.staffId === ownStaffId
          return account.rank > 0 && account.rank < ownRank
        })
        .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name))
      assignableAdmins.loaded = true
    } catch (error) {
      assignableAdmins.error = error?.response?.data?.message || error.message || 'Không tải được danh sách hỗ trợ.'
      assignableAdmins.items = []
    } finally {
      assignableAdmins.loading = false
    }
  }

  async function assignConversation(staffId) {
    const nextStaffId = Number(staffId)
    const workspaceConvId = ctx.workspaceModule?.workspace.convId
    if (!workspaceConvId || !Number.isInteger(nextStaffId) || nextStaffId <= 0) return

    const assignee = assignableAdmins.items.find((item) => item.staffId === nextStaffId)
    if (!assignee) {
      ctx.uiStore.showToast({ icon: 'alert', title: 'Không thể giao hội thoại', subtitle: 'Người nhận không hợp lệ.' })
      return
    }

    try {
      await patchAssign(workspaceConvId, nextStaffId)
      const conv = ctx.inboxModule?.inbox.items.find((c) => c.id === workspaceConvId)
      if (conv) {
        conv.staffId = nextStaffId
        conv.assignedAdminId = nextStaffId
        conv.assigneeName = assignee.name
        conv.assigneeRole = assignee.role
        conv.status = 'ASSIGNED'
        conv.statusKey = 'assigned'
      }
      ctx.uiStore.showToast({ icon: 'userCheck', title: 'Đã giao hội thoại', subtitle: assignee.name })
    } catch (error) {
      ctx.uiStore.showToast({
        icon: 'alert',
        title: 'Giao hội thoại thất bại',
        subtitle: error?.response?.data?.message || error.message || '',
      })
    }
  }

  return {
    assignableAdmins,
    loadAssignableAdmins,
    assignConversation
  }
}
