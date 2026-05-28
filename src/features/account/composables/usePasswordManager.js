import { reactive, ref } from 'vue'
import { authApi } from '@shared/lib/api/services'

export function usePasswordManager(emitNotify) {
  const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const isLoading = ref(false)

  async function submit() {
    if (!form.newPassword || form.newPassword !== form.confirmPassword) {
      if (emitNotify) emitNotify('Mật khẩu xác nhận chưa khớp.', 'error')
      return
    }
    
    try {
      isLoading.value = true
      await authApi.changePassword({ newPassword: form.newPassword })
      if (emitNotify) emitNotify('Đã cập nhật mật khẩu thành công.')
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.', 'error')
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
