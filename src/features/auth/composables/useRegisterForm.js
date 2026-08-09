import { computed, reactive, ref } from 'vue'
import { authApi } from '@shared/lib/api/services'
import { useAuthViewStateContext } from './useAuthViewState'

export function useRegisterForm() {
  const { AUTH_VIEWS, setView, showSuccess } = useAuthViewStateContext()

  const loading = ref(false)
  const errorMessage = ref('')
  const form = reactive({
    fullName: '',
    email: '',
    password: '',
    agree: false,
  })

  const passwordStrength = computed(() => {
    const pw = form.password
    let score = 0
    if (pw.length >= 8) score += 1
    if (/[A-Z]/.test(pw)) score += 1
    if (/[0-9]/.test(pw)) score += 1
    if (/[^A-Za-z0-9]/.test(pw)) score += 1
    return score
  })

  async function submitRegister() {
    errorMessage.value = ''
    if (!form.agree) {
      errorMessage.value = 'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.'
      return
    }

    loading.value = true
    try {
      await authApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      showSuccess({
        title: 'Tạo tài khoản thành công!',
        message: 'Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
        mode: AUTH_VIEWS.REGISTER,
      })
      setTimeout(() => setView(AUTH_VIEWS.LOGIN), 1300)
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Đăng ký thất bại.'
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    errorMessage,
    passwordStrength,
    submitRegister,
  }
}
