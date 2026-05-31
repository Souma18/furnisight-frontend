import { reactive, ref } from 'vue'
import { authApi } from '@shared/lib/api/services'
import { useAuthViewStateContext } from './useAuthViewState'

export function useForgotPasswordForm() {
  const { AUTH_VIEWS, setView, showSuccess } = useAuthViewStateContext()

  const loading = ref(false)
  const errorMessage = ref('')
  const form = reactive({
    destination: '',
    code: '',
    newPassword: '',
    step: 1,
  })

  function goBackToLogin() {
    errorMessage.value = ''
    setView(AUTH_VIEWS.LOGIN)
  }

  async function sendCode() {
    errorMessage.value = ''
    loading.value = true
    try {
      await authApi.forgotPassword({
        channel: 'EMAIL',
        destination: form.destination,
      })
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Gửi mã thất bại.'
    } finally {
      loading.value = false
    }
  }

  async function verifyCode() {
    if (!form.code) {
      errorMessage.value = 'Vui lòng nhập mã xác nhận.'
      return
    }

    errorMessage.value = ''
    loading.value = true
    try {
      await authApi.verifyResetPasswordCode({ email: form.destination, code: form.code })
      form.step = 2
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Mã xác nhận không hợp lệ.'
    } finally {
      loading.value = false
    }
  }

  async function resetPassword() {
    errorMessage.value = ''
    loading.value = true
    try {
      await authApi.resetPassword({
        email: form.destination,
        token: form.code,
        newPassword: form.newPassword,
      })
      showSuccess({
        title: 'Đổi mật khẩu thành công!',
        message: 'Bạn có thể đăng nhập bằng mật khẩu mới.',
        mode: AUTH_VIEWS.LOGIN,
      })
      setTimeout(() => setView(AUTH_VIEWS.LOGIN), 1500)
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại.'
    } finally {
      loading.value = false
    }
  }

  async function submitForgot() {
    if (form.step === 1) {
      await verifyCode()
      return
    }

    await resetPassword()
  }

  return {
    form,
    loading,
    errorMessage,
    goBackToLogin,
    sendCode,
    submitForgot,
  }
}
