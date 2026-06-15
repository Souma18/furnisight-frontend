import { computed, ref, watch } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { useAuthStore } from '@features/auth/store/authStore'
import { useProfileStore } from '@features/account/store/profileStore'

const PAGE_SIZE = 20

function resolveCurrentAdminName(profile = {}) {
  return profile.displayName
    || [profile.lastName, profile.firstName].filter(Boolean).join(' ').trim()
    || profile.email
    || ''
}

function resolveLogMeta(log = {}, currentAdmin = {}) {
  const isCurrentAdmin = String(log.actorId || '') === String(currentAdmin.id || '')
  const actor = log.actorName
    || log.actor
    || log.adminName
    || log.admin
    || (isCurrentAdmin ? currentAdmin.name : '')
  const ip = log.ipAddress || ''
  if (actor && ip) return `${actor} · ${ip}`
  if (actor) return actor

  const backendMeta = String(log.meta || '')
  const actorId = String(log.actorId || '')
  if (backendMeta && (!actorId || !backendMeta.includes(actorId))) return backendMeta
  return ip
}

export function useAdminAuditLogs() {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()
  const items = ref([])
  const total = ref(0)
  const totalPages = ref(1)
  const page = ref(1)
  const loading = ref(false)
  const search = ref('')
  const type = ref('all')
  const result = ref('all')
  const period = ref('today')

  async function load() {
    loading.value = true
    try {
      const [res] = await Promise.all([
        adminApi.fetchAuditLogs({
          search: search.value,
          type: type.value,
          result: result.value,
          period: period.value,
          page: page.value,
          pageSize: PAGE_SIZE,
        }),
        profileStore.profile
          ? Promise.resolve(profileStore.profile)
          : profileStore.fetchProfile().catch(() => null),
      ])
      const profile = profileStore.profile || authStore.user || {}
      const currentAdmin = {
        id: profile.accountId || authStore.user?.accountId || authStore.user?.id,
        name: resolveCurrentAdminName(profile),
      }
      items.value = (res.data?.items ?? []).map((log) => ({
        ...log,
        meta: resolveLogMeta(log, currentAdmin),
      }))
      total.value = res.data?.total ?? 0
      totalPages.value = Math.max(1, res.data?.totalPages ?? Math.ceil(total.value / PAGE_SIZE) ?? 1)
    } finally {
      loading.value = false
    }
  }

  watch([search, type, result, period], () => {
    page.value = 1
    load()
  })

  watch(page, load)

  const pagination = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE + 1
    const end = Math.min(page.value * PAGE_SIZE, total.value)
    return {
      info: `Hiển thị <strong>${start}–${end}</strong> / ${total.value.toLocaleString('vi-VN')} bản ghi`,
      buttons: [
        { icon: 'chevronLeft', page: Math.max(1, page.value - 1), disabled: page.value <= 1 },
        ...Array.from({ length: Math.min(totalPages.value, 5) }, (_, index) => {
          const half = 2
          const startPage = Math.min(Math.max(1, page.value - half), Math.max(1, totalPages.value - 4))
          const targetPage = startPage + index
          return { label: String(targetPage), page: targetPage, active: page.value === targetPage }
        }).filter((button) => button.page <= totalPages.value),
        { icon: 'chevronRight', page: Math.min(totalPages.value, page.value + 1), disabled: page.value >= totalPages.value },
      ],
    }
  })

  load()

  return {
    items,
    total,
    totalPages,
    page,
    loading,
    search,
    type,
    result,
    period,
    pagination,
    load,
  }
}
