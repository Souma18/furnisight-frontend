import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '@shared/lib/api/services'

export const useProfileStore = defineStore('accountProfile', () => {
  const profile = ref(null)

  async function fetchProfile() {
    const res = await usersApi.getProfile()
    if (res && res.data) {
      profile.value = res.data
    }
    return res
  }

  async function saveProfile(payload) {
    const response = await usersApi.updateProfile(payload)
    profile.value = response.data || response
  }

  async function uploadAvatar(file) {
    if (!profile.value) return null
    const res = await usersApi.uploadAvatar(file)
    const avatarUrl = res.data?.url || res.data || res.url
    if (avatarUrl) {
      profile.value = { ...profile.value, avatarUrl }
    }
    return avatarUrl
  }

  function removeAvatar() {
    if (!profile.value) return
    profile.value = { ...profile.value, avatarUrl: '' }
  }

  return {
    profile,
    fetchProfile,
    saveProfile,
    uploadAvatar,
    removeAvatar
  }
})
