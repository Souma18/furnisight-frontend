import { reactive, ref } from 'vue'
import { getProvinces, getWardsByProvince } from '@shared/lib/publicApis/vietnamAddressApi'
import { useAddressStore } from '../store/addressStore'
import { i18n } from '@shared/i18n'

const t = (key, params) => i18n.global.t(key, params)

function capitalizeFirst(value) {
  const text = String(value || '').trim()
  return text ? text.charAt(0).toLocaleUpperCase(i18n.global.locale.value) + text.slice(1) : ''
}

function normalizeAddressType(type) {
  return String(type || '')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/[_\s-]+/g, '')
}

export function useAddressForm(notify) {
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
      notify(t('account.address.addressDataError'), 'error')
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
      notify(t('account.address.wardLoadError'), 'error')
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
      notify(t('account.address.requiredError'), 'error')
      return
    }

    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/
    if (!phoneRegex.test(form.phone)) {
      notify(t('account.address.invalidPhone'), 'error')
      return
    }

    
    isSubmitting.value = true
    try {
      await addressStore.addAddress({ ...form })
      notify(form.isDefault ? t('account.address.savedDefault') : t('account.address.saved'))
      showModal.value = false
    } catch (error) {
      notify(t('account.address.saveError'), 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  async function setAsDefault(addressId) {
    try {
      await addressStore.setDefaultAddress(addressId)
      notify(t('account.address.defaultUpdated'))
    } catch (error) {
      notify(error.response?.data?.message || t('account.address.defaultError'), 'error')
    }
  }

  async function deleteAddress(addressId) {
    if (!confirm(t('account.address.deleteConfirm'))) return
    await addressStore.deleteAddress(addressId)
    notify(t('account.address.deleted'))
  }

  function getTypeLabel(type) {
    const normalized = normalizeAddressType(type)
    const label = ['home', 'office', 'other'].includes(normalized)
      ? t(`account.address.types.${normalized}`)
      : type || t('account.address.types.other')
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
