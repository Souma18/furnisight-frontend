import { ref } from 'vue'
import { getProvinces, getWardsByProvince } from '@shared/lib/publicApis/vietnamAddressApi'

export function useVietnamAddress() {
  const provinces = ref([])
  const wards = ref([])
  const loadingProvince = ref(false)
  const loadingWard = ref(false)
  const addressApiUnavailable = ref(false)

  async function fetchProvinces() {
    if (provinces.value.length) return
    loadingProvince.value = true
    addressApiUnavailable.value = false
    try {
      provinces.value = await getProvinces()
    } catch {
      addressApiUnavailable.value = true
    } finally {
      loadingProvince.value = false
    }
  }

  async function fetchWards(provinceCode) {
    if (!provinceCode) {
      wards.value = []
      return
    }
    loadingWard.value = true
    try {
      wards.value = await getWardsByProvince(provinceCode)
    } catch {
      wards.value = []
      throw new Error('Không tải được danh sách phường/xã. Vui lòng chọn lại tỉnh/thành.')
    } finally {
      loadingWard.value = false
    }
  }

  function clearWards() {
    wards.value = []
  }

  return {
    provinces,
    wards,
    loadingProvince,
    loadingWard,
    addressApiUnavailable,
    fetchProvinces,
    fetchWards,
    clearWards,
  }
}
