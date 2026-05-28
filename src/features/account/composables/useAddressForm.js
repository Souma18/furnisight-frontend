import { reactive, ref } from 'vue'
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
} from '@shared/lib/publicApis/vietnamAddressApi'
import { useAddressStore } from '../store/addressStore'

const ADDRESS_TYPE_LABELS = {
  home: 'Nhà riêng',
  office: 'Văn phòng',
}

export function useAddressForm(props, emit) {
  const addressStore = useAddressStore()
  const showModal = ref(false)
  const provinces = ref([])
  const districts = ref([])
  const wards = ref([])
  const loadingProvince = ref(false)
  const loadingDistrict = ref(false)
  const loadingWard = ref(false)
  const fallbackMode = ref(false)

  function createEmptyForm() {
    return {
      fullName: '',
      phone: '',
      detail: '',
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      provinceName: '',
      districtName: '',
      wardName: '',
      type: 'home',
      isDefault: false,
    }
  }

  const form = reactive(createEmptyForm())

  function resetForm() {
    Object.assign(form, createEmptyForm())
    districts.value = []
    wards.value = []
  }

  async function openModal() {
    resetForm()
    showModal.value = true
    if (provinces.value.length) return
    loadingProvince.value = true
    try {
      provinces.value = await getProvinces()
      fallbackMode.value = false
    } catch (_error) {
      fallbackMode.value = true
      emit('notify', 'API địa chỉ công khai lỗi, đang dùng nhập tay.', 'error')
    } finally {
      loadingProvince.value = false
    }
  }

  async function onProvinceChange() {
    const selected = provinces.value.find((item) => String(item.code) === String(form.provinceCode))
    form.provinceName = selected?.name ?? ''
    form.districtCode = ''
    form.wardCode = ''
    districts.value = []
    wards.value = []
    if (!form.provinceCode) return
    loadingDistrict.value = true
    try {
      districts.value = await getDistrictsByProvince(form.provinceCode)
    } finally {
      loadingDistrict.value = false
    }
  }

  async function onDistrictChange() {
    const selected = districts.value.find((item) => String(item.code) === String(form.districtCode))
    form.districtName = selected?.name ?? ''
    form.wardCode = ''
    wards.value = []
    if (!form.districtCode) return
    loadingWard.value = true
    try {
      wards.value = await getWardsByDistrict(form.districtCode)
    } finally {
      loadingWard.value = false
    }
  }

  function onWardChange() {
    const selected = wards.value.find((item) => String(item.code) === String(form.wardCode))
    form.wardName = selected?.name ?? ''
  }

  async function submitAddress() {
    if (!form.fullName || !form.phone || !form.detail) {
      emit('notify', 'Vui lòng điền thông tin bắt buộc.', 'error')
      return
    }
    
    await addressStore.addAddress({ ...form })
    emit('notify', form.isDefault ? 'Đã lưu và đặt làm địa chỉ mặc định.' : 'Đã lưu địa chỉ mới.')
    showModal.value = false
  }

  async function setAsDefault(addressId) {
    await addressStore.setDefaultAddress(addressId)
    emit('notify', 'Đã cập nhật địa chỉ mặc định.')
  }

  function getTypeLabel(type) {
    return ADDRESS_TYPE_LABELS[type] ?? 'Khác'
  }

  return {
    showModal,
    provinces,
    districts,
    wards,
    loadingProvince,
    loadingDistrict,
    loadingWard,
    fallbackMode,
    form,
    openModal,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    submitAddress,
    setAsDefault,
    getTypeLabel,
  }
}
