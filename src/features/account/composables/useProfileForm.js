import { computed, reactive, ref, watch } from 'vue'

import { useProfileStore } from '../store/profileStore'
import { i18n } from '@shared/i18n'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const t = (key, params) => i18n.global.t(key, params)

export function useProfileForm(profile, notify) {
  const profileStore = useProfileStore()
  const avatarInput = ref(null)
  const avatarUploading = ref(false)

  const form = reactive({
    fullName: '',
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
    notify(t('account.profile.saved'))
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
        notify(t('account.profile.chooseImage'), 'error')
        return
      }

      if (file.size > MAX_AVATAR_SIZE) {
        notify(t('account.profile.avatarTooLarge'), 'error')
        return
      }

      avatarUploading.value = true
      const avatarUrl = await profileStore.uploadAvatar(file)
      notify(avatarUrl ? t('account.profile.avatarUpdated') : t('account.profile.avatarUrlMissing'), avatarUrl ? 'success' : 'error')
    } catch (error) {
      notify(error?.response?.data?.message || t('account.profile.avatarUpdateFailed'), 'error')
    } finally {
      avatarUploading.value = false
      event.target.value = ''
    }
  }

  async function removeAvatar() {
    try {
      await profileStore.removeAvatar()
      notify(t('account.profile.avatarRemoved'))
    } catch (error) {
      notify(error?.response?.data?.message || t('account.profile.avatarRemoveFailed'), 'error')
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
