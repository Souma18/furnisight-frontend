import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@shared/lib/api/services'

export const useAddressStore = defineStore('accountAddress', () => {
  const addresses = ref([])

  const defaultAddress = computed(
    () => addresses.value.find((item) => item.isDefault) ?? addresses.value[0] ?? null,
  )

  function sortAddressesByDefault(list) {
    return [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  }

  function normalizeAddress(address = {}) {
    return {
      ...address,
      isDefault: Boolean(address.isDefault ?? address.defaultAddress ?? address.default),
    }
  }

  function setAddresses(list) {
    const normalized = Array.isArray(list) ? list.map(normalizeAddress) : []
    addresses.value = sortAddressesByDefault(normalized)
    return addresses.value
  }

  async function fetchAddresses() {
    const res = await usersApi.getAddresses()
    return setAddresses(res.data || res)
  }

  async function addAddress(payload) {
    await usersApi.saveAddress(payload)
    return await fetchAddresses()
  }

  async function updateAddress(addressId, payload) {
    await usersApi.updateAddress(addressId, payload)
    return await fetchAddresses()
  }

  async function setDefaultAddress(addressId) {
    const response = await usersApi.setDefaultAddress(addressId)
    if (Array.isArray(response.data)) return setAddresses(response.data)
    return await fetchAddresses()
  }

  async function deleteAddress(addressId) {
    await usersApi.deleteAddress(addressId)
    return await fetchAddresses()
  }

  function resetAddressState() {
    addresses.value = []
  }

  return {
    addresses,
    defaultAddress,
    sortAddressesByDefault,
    normalizeAddress,
    fetchAddresses,
    addAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    resetAddressState,
  }
})
