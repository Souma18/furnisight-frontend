import { ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { getListPayload } from '../lib/adminPromotionFormatters'
import {
  isPromotionRecipient,
  mapPromotionRecipient,
} from '../utils/adminPromotionRecipients'

export function useAdminPromotionUsers({ notify }) {
  const users = ref([])

  async function loadUsersForTarget() {
    try {
      const response = await adminApi.fetchAdminUsers({ size: 500, scope: 'CUSTOMER' })
      users.value = getListPayload(response?.data)
        .filter(isPromotionRecipient)
        .map(mapPromotionRecipient)
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
