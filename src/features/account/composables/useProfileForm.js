import { reactive, watch, ref, computed } from 'vue'

import { useProfileStore } from '../store/profileStore'

export function useProfileForm(props, emit) {
  const profileStore = useProfileStore()
  const avatarInput = ref(null)

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
    await profileStore.uploadAvatar(file)
    emit('notify', 'Đã cập nhật ảnh đại diện.')
    event.target.value = ''
  }

  function removeAvatar() {
    profileStore.removeAvatar()
    emit('notify', 'Đã xoá ảnh đại diện.')
  }

  return {
    form,
    avatarInput,
    avatarLabel,
    submit,
    pickAvatar,
    onAvatarSelected,
    removeAvatar,
  }
}
