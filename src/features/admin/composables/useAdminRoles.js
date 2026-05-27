import { onMounted, ref } from 'vue'
import { fetchRolesMock } from '../api/adminMockApi'

export function useAdminRoles() {
  const data = ref(null)
  const loading = ref(true)

  async function load() {
    loading.value = true
    try {
      // TODO(BE): adminApi.fetchRoles()
      const res = await fetchRolesMock()
      data.value = res.data
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { data, loading, load }
}
