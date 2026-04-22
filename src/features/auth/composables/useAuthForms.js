import { computed, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import {
  loginRequest,
  registerRequest,
  forgotPasswordRequest,
} from '../api/authApi'

export function useAuthForms({ emit, props, authViewState }) {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  
  const { AUTH_VIEWS, setView, showSuccess } = authViewState

  const loading = ref(false)
  const errorMessage = ref('')
  const showPassword = ref(false)

  const loginForm = reactive({
    email: '',
    password: '',
  })
  const registerForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agree: false,
  })
  const forgotForm = reactive({
    email: '',
  })

  const passwordStrength = computed(() => {
    const pw = registerForm.password
    let score = 0
    if (pw.length >= 8) score += 1
    if (/[A-Z]/.test(pw)) score += 1
    if (/[0-9]/.test(pw)) score += 1
    if (/[^A-Za-z0-9]/.test(pw)) score += 1
    return score
  })

  async function submitLogin() {
    errorMessage.value = ''
    loading.value = true
    try {
      const response = await loginRequest({
        identifier: loginForm.email,
        password: loginForm.password,
      })
      authStore.setSession(response.data)
      showSuccess({
        title: 'Đăng nhập thành công!',
        message: 'Chào mừng trở lại. Bạn đang được chuyển hướng...',
        mode: AUTH_VIEWS.LOGIN,
      })
      setTimeout(async () => {
        emit('authenticated')
        if (props.embedded) {
          emit('close')
          return
        }
        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
        await router.push(redirect)
      }, 900)
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Đăng nhập thất bại.'
    } finally {
      loading.value = false
    }
  }

  async function submitRegister() {
    errorMessage.value = ''
    loading.value = true
    try {
      await registerRequest({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        phoneNumber: registerForm.phone,
        password: registerForm.password,
        username: registerForm.email.split('@')[0],
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

  async function submitForgot() {
    errorMessage.value = ''
    loading.value = true
    try {
      await forgotPasswordRequest({
        channel: 'EMAIL',
        destination: forgotForm.email,
      })
      showSuccess({
        title: 'Email đã được gửi!',
        message: 'Link đặt lại mật khẩu có hiệu lực trong 15 phút.',
        mode: AUTH_VIEWS.FORGOT,
      })
      setTimeout(() => setView(AUTH_VIEWS.LOGIN), 1300)
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Gửi email thất bại.'
    } finally {
      loading.value = false
    }
  }

  function handleTabChange(tab) {
    errorMessage.value = ''
    setView(tab)
  }

  return {
    loading,
    errorMessage,
    showPassword,
    loginForm,
    registerForm,
    forgotForm,
    passwordStrength,
    submitLogin,
    submitRegister,
    submitForgot,
    handleTabChange,
  }
}
