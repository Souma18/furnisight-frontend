import { ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { getListPayload } from '../lib/adminPromotionFormatters'

export function useAdminPromotionUsers({ notify }) {
  const users = ref([])

  async function loadUsersForTarget() {
    try {
      const response = await adminApi.fetchAdminUsers({ size: 500 })
      users.value = getListPayload(response?.data).map(mapUser).filter((user) => user.id)
    } catch (error) {
      users.value = []
      notify(error?.response?.data?.message || error.message || 'Không tải được user')
    }
  }

  return {
    users,
    loadUsersForTarget,
  }
}

function mapUser(item) {
  const name = item.displayName || item.fullName || item.name || item.username || item.email || item.id || item.userId
  return {
    id: item.id || item.userId,
    name,
    email: item.email || '',
    avatar: String(name || 'U').trim().slice(0, 2).toUpperCase(),
  }
}
