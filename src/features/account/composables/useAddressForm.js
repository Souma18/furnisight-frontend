import { reactive, ref } from 'vue'
import { getProvinces, getWardsByProvince } from '@shared/lib/publicApis/vietnamAddressApi'
import { useAddressStore } from '../store/addressStore'

const ADDRESS_TYPE_LABELS = {
  home: 'nhà riêng',
  office: 'văn phòng',
  other: 'khác',
}

function capitalizeFirst(value) {
  const text = String(value || '').trim().toLocaleLowerCase('vi-VN')
  return text ? text.charAt(0).toLocaleUpperCase('vi-VN') + text.slice(1) : ''
}

function normalizeAddressType(type) {
  return String(type || '')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/[_\s-]+/g, '')
}

export function useAddressForm(emit) {
  const addressStore = useAddressStore()
  const showModal = ref(false)
  const provinces = ref([])
  const wards = ref([])
  const loadingProvince = ref(false)
  const loadingWard = ref(false)
  const addressApiUnavailable = ref(false)

  function createEmptyForm() {
    return {
      fullName: '',
      phone: '',
      detail: '',
      provinceCode: '',
      wardCode: '',
      provinceName: '',
      wardName: '',
      type: 'home',
      isDefault: false,
    }
  }

  const form = reactive(createEmptyForm())

  function resetForm() {
    Object.assign(form, createEmptyForm())
    wards.value = []
  }

  async function loadProvinces() {
    loadingProvince.value = true
    try {
      provinces.value = await getProvinces()
      addressApiUnavailable.value = false
    } catch (_error) {
      addressApiUnavailable.value = true
      emit('notify', 'Không tải được dữ liệu địa chỉ. Vui lòng thử lại.', 'error')
    } finally {
      loadingProvince.value = false
    }
  }

  async function openModal() {
    resetForm()
    showModal.value = true
    if (!provinces.value.length) await loadProvinces()
  }

  async function onProvinceChange() {
    const selected = provinces.value.find((item) => String(item.code) === String(form.provinceCode))
    form.provinceName = selected?.name ?? ''
    form.wardCode = ''
    form.wardName = ''
    wards.value = []
    if (!form.provinceCode) return
    loadingWard.value = true
    try {
      wards.value = await getWardsByProvince(form.provinceCode)
    } catch (_error) {
      emit('notify', 'Không tải được danh sách phường/xã. Vui lòng chọn lại tỉnh/thành.', 'error')
    } finally {
      loadingWard.value = false
    }
  }

  function onWardChange() {
    const selected = wards.value.find((item) => String(item.code) === String(form.wardCode))
    form.wardName = selected?.name ?? ''
  }

  const isSubmitting = ref(false)

  async function submitAddress() {
    if (isSubmitting.value) return

    if (!form.fullName || !form.phone || !form.detail || !form.provinceCode || !form.wardCode) {
      emit('notify', 'Vui lòng điền thông tin bắt buộc.', 'error')
      return
    }
    
    isSubmitting.value = true
    try {
      await addressStore.addAddress({ ...form })
      emit('notify', form.isDefault ? 'Đã lưu và đặt làm địa chỉ mặc định.' : 'Đã lưu địa chỉ mới.')
      showModal.value = false
    } catch (error) {
      emit('notify', 'Lỗi khi lưu địa chỉ.', 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  async function setAsDefault(addressId) {
    try {
      await addressStore.setDefaultAddress(addressId)
      emit('notify', 'Đã cập nhật địa chỉ mặc định.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể đặt địa chỉ mặc định.', 'error')
    }
  }

  async function deleteAddress(addressId) {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return
    await addressStore.deleteAddress(addressId)
    emit('notify', 'Đã xóa địa chỉ.')
  }

  function getTypeLabel(type) {
    const normalized = normalizeAddressType(type)
    const label = ADDRESS_TYPE_LABELS[normalized] ?? type ?? ADDRESS_TYPE_LABELS.other
    return capitalizeFirst(label)
  }

  return {
    showModal,
    provinces,
    wards,
    loadingProvince,
    loadingWard,
    addressApiUnavailable,
    isSubmitting,
    form,
    openModal,
    loadProvinces,
    onProvinceChange,
    onWardChange,
    submitAddress,
    setAsDefault,
    deleteAddress,
    getTypeLabel,
  }
}
