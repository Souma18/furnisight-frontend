import { reactive, watch, ref, computed } from 'vue'

import { useProfileStore } from '../store/profileStore'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024

export function useProfileForm(props, emit) {
  const profileStore = useProfileStore()
  const avatarInput = ref(null)
  const avatarUploading = ref(false)

  const form = reactive({
    firstName: '',
    lastName: '',
    birthday: '',
    gender: 'MALE',
    bio: '',
  })

  watch(
    () => props.profile,
    (value) => {
      if (!value) return
      Object.assign(form, value)
    },
    { immediate: true },
  )

  async function submit() {
    await profileStore.saveProfile({ ...form })
    emit('notify', 'Đã lưu thông tin cá nhân.')
  }

  const avatarLabel = computed(() => {
    if (props.profile?.avatarUrl) return ''
    return props.profile?.initials ?? 'NA'
  })

  function pickAvatar() {
    avatarInput.value?.click()
  }

  async function onAvatarSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      if (!file.type?.startsWith('image/')) {
        emit('notify', 'Vui lòng chọn file ảnh.', 'error')
        return
      }

      if (file.size > MAX_AVATAR_SIZE) {
        emit('notify', 'Ảnh đại diện không được vượt quá 5MB.', 'error')
        return
      }

      avatarUploading.value = true
      const avatarUrl = await profileStore.uploadAvatar(file)
      emit('notify', avatarUrl ? 'Đã cập nhật ảnh đại diện.' : 'Không lấy được URL ảnh sau khi upload.', avatarUrl ? 'success' : 'error')
    } catch (error) {
      emit('notify', error?.response?.data?.message || 'Không thể cập nhật ảnh đại diện.', 'error')
    } finally {
      avatarUploading.value = false
      event.target.value = ''
    }
  }

  async function removeAvatar() {
    try {
      await profileStore.removeAvatar()
      emit('notify', 'Đã xoá ảnh đại diện.')
    } catch (error) {
      emit('notify', error?.response?.data?.message || 'Không thể xoá ảnh đại diện.', 'error')
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
