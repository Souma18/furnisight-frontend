import { computed, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { loginRequest, registerRequest } from '../api/authApi'
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetPasswordCode
} from '../../account/api/accountApi'

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
    method: 'EMAIL',
    destination: '',
    code: '',
    newPassword: '',
    step: 1,
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

  function resolvePostLoginTarget() {
    const queryRedirect = route.query.redirect
    if (typeof queryRedirect === 'string' && queryRedirect) {
      return queryRedirect
    }
    if (authStore.isAdmin) {
      return { name: 'admin-dashboard' }
    }
    return { name: 'home' }
  }

  async function submitLogin() {
    errorMessage.value = ''
    loading.value = true
    try {
      const response = await loginRequest({
        identifier: loginForm.email,
        password: loginForm.password,
      })
      authStore.setSession(normalizeAuthSession(response))
      showSuccess({
        title: 'Đăng nhập thành công!',
        message: 'Chào mừng trở lại. Bạn đang được chuyển hướng...',
        mode: AUTH_VIEWS.LOGIN,
      })
      setTimeout(async () => {
        emit('authenticated')
        const target = resolvePostLoginTarget()
        const shouldNavigate =
          !props.embedded || authStore.isAdmin || Boolean(route.query.redirect)

        if (props.embedded) {
          emit('close')
        }

        if (shouldNavigate) {
          await router.push(target)
        }
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

  async function handleSendCode() {
    errorMessage.value = ''
    loading.value = true
    try {
      await forgotPasswordRequest({
        channel: forgotForm.method,
        destination: forgotForm.destination,
      })
      // Không gọi showSuccess vì nó sẽ che mất form, chỉ cần clear error
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Gửi mã thất bại.'
    } finally {
      loading.value = false
    }
  }

  async function submitForgot() {
    if (forgotForm.step === 1) {
      if (!forgotForm.code) {
        errorMessage.value = 'Vui lòng nhập mã xác nhận.'
        return
      }
      errorMessage.value = ''
      loading.value = true
      try {
        await verifyResetPasswordCode({ code: forgotForm.code })
        forgotForm.step = 2
      } catch (error) {
        errorMessage.value = error.response?.data?.message || error.message || 'Mã xác nhận không hợp lệ.'
      } finally {
        loading.value = false
      }
      return
    }

    errorMessage.value = ''
    loading.value = true
    try {
      await resetPasswordRequest({
        token: forgotForm.code,
        newPassword: forgotForm.newPassword,
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
    handleSendCode,
    handleTabChange,
  }
}
