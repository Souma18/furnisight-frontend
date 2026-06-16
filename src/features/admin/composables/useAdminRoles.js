import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi } from '@shared/lib/api/services'
import { ADMIN_PERMISSION_OPTIONS } from '../config/adminPermissions'
import { useAdminUiStore } from '../store/adminUiStore'
import { isAdminAccount, isAdminRoleName, normalizeRoleName } from '../utils/adminAccountRoles'

const roleIconMap = {
  admin: 'crown',
  super: 'crown',
  'super admin': 'crown',
  manager: 'shield',
  staff: 'user',
}

const roleToneMap = {
  admin: 'rt-super',
  super: 'rt-super',
  'super admin': 'rt-super',
  manager: 'rt-manager',
  staff: 'rt-staff',
}

export function useAdminRoles() {
  const ui = useAdminUiStore()
  const { reloadTick } = storeToRefs(ui)
  const data = ref(null)
  const loading = ref(true)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [roleRes, userRes] = await Promise.all([
        adminApi.fetchRoles(),
        adminApi.fetchAdminUsers({ size: 100, scope: 'ADMIN' }),
      ])
      const adminAccounts = (userRes.data?.items ?? userRes.data?.accounts ?? userRes.data ?? [])
        .filter(isAdminAccount)
        .map(normalizeAdminAccount)
      const roles = (roleRes.data?.roles ?? roleRes.data?.items ?? roleRes.data ?? [])
        .map((role) => normalizeRole(role, adminAccounts))
      data.value = {
        roles,
        adminAccounts,
        matrix: buildMatrix(roles),
      }
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Không tải được dữ liệu vai trò.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
  watch(reloadTick, load)

  return { data, loading, error, load }
}

function normalizeRole(role = {}, adminAccounts = []) {
  const perms = normalizePermissions(role.permissions)
  const roleKey = normalizeRoleName(role.name)
  const userCount = adminAccounts.filter((account) =>
    normalizeRoleName(account.role) === normalizeRoleName(role.name),
  ).length
  return {
    ...role,
    perms,
    permissionIds: perms,
    icon: role.icon || roleIconMap[roleKey] || 'shield',
    tagClass: role.tagClass || roleToneMap[roleKey] || 'rt-manager',
    system: ['admin', 'super', 'super admin', 'manager', 'staff'].includes(roleKey),
    userCount: userCount || role.userCount || 0,
    note: role.description || role.note || `${perms.length} quyền`,
  }
}

function normalizeAdminAccount(account = {}) {
  const firstRole = account.roles?.[0] ?? {}
  const role = account.role || firstRole.name || 'Admin'
  const perms = normalizePermissions(firstRole.permissions)
  const roleKey = String(role || '').toLowerCase()
  return {
    ...account,
    role,
    perms,
    roleIcon: account.roleIcon || roleIconMap[roleKey] || 'user',
    tagClass: account.tagClass || roleToneMap[roleKey] || 'rt-manager',
    statusLabel: account.statusLabel || 'Hoạt động',
    avTone: account.avTone || 'blue',
    av: account.av || String(account.name || account.email || 'A').slice(0, 1).toUpperCase(),
  }
}

function normalizePermissions(permissions = []) {
  return [...new Set((permissions ?? []).filter(Boolean).map((permission) => String(permission).trim()))]
}

function buildMatrix(roles) {
  return ADMIN_PERMISSION_OPTIONS.map((option) => {
    const has = (roleName) => {
      const role = roles.find((item) => String(item.name || '').toLowerCase().includes(roleName))
      return role?.perms?.includes(option.id) ? 'Có' : '-'
    }
    return {
      feature: option.label,
      super: has('admin') === 'Có' || has('super') === 'Có' ? 'Có' : '-',
      manager: has('manager'),
      staff: has('staff'),
    }
  })
}
