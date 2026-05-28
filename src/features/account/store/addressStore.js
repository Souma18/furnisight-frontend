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

  async function fetchAddresses() {
    const res = await usersApi.getAddresses()
    addresses.value = sortAddressesByDefault(res.data || res)
    return addresses.value
  }

  async function addAddress(payload) {
    await usersApi.saveAddress(payload)
    return await fetchAddresses()
  }

  async function setDefaultAddress(addressId) {
    await usersApi.setDefaultAddress(addressId)
    return await fetchAddresses()
  }

  async function deleteAddress(addressId) {
    await usersApi.deleteAddress(addressId)
    return await fetchAddresses()
  }

  return {
    addresses,
    defaultAddress,
    sortAddressesByDefault,
    fetchAddresses,
    addAddress,
    setDefaultAddress,
    deleteAddress
  }
})
