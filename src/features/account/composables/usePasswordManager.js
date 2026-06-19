import { reactive, ref } from 'vue'
import { authApi } from '@shared/lib/api/services'
import { i18n } from '@shared/i18n'

const t = (key, params) => i18n.global.t(key, params)

export function usePasswordManager(emitNotify) {
  const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const isLoading = ref(false)

  async function submit() {
    if (!form.currentPassword) {
      if (emitNotify) emitNotify(t('account.security.currentRequired'), 'error')
      return
    }
    if (!form.newPassword || form.newPassword !== form.confirmPassword) {
      if (emitNotify) emitNotify(t('account.security.confirmMismatch'), 'error')
      return
    }
    
    try {
      isLoading.value = true
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      if (emitNotify) emitNotify(t('account.security.updateSuccess'))
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || t('account.security.updateError'), 'error')
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    isLoading,
    submit,
  }
}
