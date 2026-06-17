import { computed, reactive, ref, watch } from 'vue'

import { useProfileStore } from '../store/profileStore'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024

export function useProfileForm(profile, notify) {
  const profileStore = useProfileStore()
  const avatarInput = ref(null)
  const avatarUploading = ref(false)

  const form = reactive({
    firstName: '',
    lastName: '',
    birthday: '',
    gender: 'MALE',
    bio: '',
    avatarMediaId: null,
  })

  watch(
    profile,
    (value) => {
      if (!value) return
      Object.assign(form, value)
    },
    { immediate: true },
  )

  async function submit() {
    await profileStore.saveProfile({
      ...form,
      avatarMediaId: form.avatarMediaId ?? profile.value?.avatarMediaId ?? null,
    })
    notify('Đã lưu thông tin cá nhân.')
  }

  const avatarLabel = computed(() => {
    if (profile.value?.avatarUrl) return ''
    return profile.value?.initials ?? 'NA'
  })

  function pickAvatar() {
    avatarInput.value?.click()
  }

  async function onAvatarSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      if (!file.type?.startsWith('image/')) {
        notify('Vui lòng chọn file ảnh.', 'error')
        return
      }

      if (file.size > MAX_AVATAR_SIZE) {
        notify('Ảnh đại diện không được vượt quá 5MB.', 'error')
        return
      }

      avatarUploading.value = true
      const avatarUrl = await profileStore.uploadAvatar(file)
      notify(avatarUrl ? 'Đã cập nhật ảnh đại diện.' : 'Không lấy được URL ảnh sau khi upload.', avatarUrl ? 'success' : 'error')
    } catch (error) {
      notify(error?.response?.data?.message || 'Không thể cập nhật ảnh đại diện.', 'error')
    } finally {
      avatarUploading.value = false
      event.target.value = ''
    }
  }

  async function removeAvatar() {
    try {
      await profileStore.removeAvatar()
      notify('Đã xoá ảnh đại diện.')
    } catch (error) {
      notify(error?.response?.data?.message || 'Không thể xoá ảnh đại diện.', 'error')
    }
  }

  return {
    form,
    avatarInput,
    avatarLabel,
    avatarUploading,
    submit,
    pickAvatar,
    onAvatarSelected,
    removeAvatar,
  }
}
