import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mediaApi, usersApi } from '@shared/lib/api/services'
import { ProfileResponse } from '@shared/lib/api/services/users/users.model'

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? response
}

function getAvatarUrl(payload) {
  if (typeof payload === 'string') return payload
  if (!payload || typeof payload !== 'object') return ''

  return payload.url
    || payload.avatarUrl
    || payload.fileUrl
    || payload.publicUrl
    || payload.secureUrl
    || payload.secure_url
    || payload.downloadUrl
    || payload.path
    || ''
}

function toProfilePayload(value = {}) {
  return {
    firstName: value.firstName || '',
    lastName: value.lastName || '',
    birthday: value.birthday || value.dateOfBirth || '',
    gender: value.gender || 'MALE',
    bio: value.bio || '',
    avatarMediaId: value.avatarMediaId ?? null,
  }
}

function normalizeProfile(data) {
  if (!data) return null
  return data instanceof ProfileResponse ? data : new ProfileResponse(data)
}

export const useProfileStore = defineStore('accountProfile', () => {
  const profile = ref(null)

  async function fetchProfile() {
    const res = await usersApi.getProfile()
    const data = unwrapData(res)
    if (data) {
      profile.value = normalizeProfile(data)
    }
    return res
  }

  async function saveProfile(payload) {
    const response = await usersApi.updateProfile(toProfilePayload(payload))
    profile.value = normalizeProfile(unwrapData(response))
    return profile.value
  }

  async function uploadAvatar(file) {
    if (!profile.value) return null
    if (!profile.value.id) {
      throw new Error('Missing profile id for avatar upload.')
    }

    const uploadResponse = await mediaApi.uploadDirect(file, {
      ownerType: 'USER',
      ownerId: profile.value.id,
    })
    const uploadData = unwrapData(uploadResponse)

    const avatarMediaId = uploadData?.mediaId || uploadData?.id || null
    if (!avatarMediaId) return null

    const updatedProfile = await saveProfile({ ...toProfilePayload(profile.value), avatarMediaId })

    return updatedProfile?.avatarUrl || getAvatarUrl(uploadData)
  }

  async function removeAvatar() {
    if (!profile.value) return
    await saveProfile({ ...profile.value, avatarMediaId: null })
  }

  function resetProfileState() {
    profile.value = null
  }

  return {
    profile,
    fetchProfile,
    saveProfile,
    uploadAvatar,
    removeAvatar,
    resetProfileState,
  }
})
