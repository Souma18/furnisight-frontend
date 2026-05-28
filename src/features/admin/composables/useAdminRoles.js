import { onMounted, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'

export function useAdminRoles() {
  const data = ref(null)
  const loading = ref(true)

  async function load() {
    loading.value = true
    try {
      const res = await adminApi.fetchRoles()
      data.value = res.data
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return { data, loading, load }
}
