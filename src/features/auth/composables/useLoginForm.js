import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { authApi } from '@shared/lib/api/services'
import { normalizeAuthSession } from '../utils/normalizeAuthSession'
import { useAuthViewStateContext } from './useAuthViewState'

export function useLoginForm({ embedded = false, emit } = {}) {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const { AUTH_VIEWS, setView, showSuccess } = useAuthViewStateContext()
  let successTimer = null

  const loading = ref(false)
  const errorMessage = ref('')
  const showPassword = ref(false)
  const form = reactive({
    email: '',
    password: '',
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

  function openForgotPassword() {
    errorMessage.value = ''
    setView(AUTH_VIEWS.FORGOT)
  }

  function togglePassword() {
    showPassword.value = !showPassword.value
  }

  function clearSuccessTimer() {
    if (!successTimer) return
    clearTimeout(successTimer)
    successTimer = null
  }

  async function submitLogin() {
    errorMessage.value = ''
    loading.value = true
    clearSuccessTimer()

    try {
      const identifier = String(form.email || '').trim().toLowerCase()
      const response = await authApi.login({
        identifier,
        password: form.password,
      })

      authStore.setSession(normalizeAuthSession(response))
      const isAdminLogin = authStore.isAdmin
      showSuccess({
        title: 'Đăng nhập thành công!',
        message: isAdminLogin
          ? 'Chào mừng trở lại. Bạn đang được chuyển hướng...'
          : 'Chào mừng trở lại.',
        mode: AUTH_VIEWS.LOGIN,
        loading: isAdminLogin,
      })

      successTimer = setTimeout(async () => {
        successTimer = null
        const target = resolvePostLoginTarget()
        const shouldNavigate = !embedded || isAdminLogin || Boolean(route.query.redirect)

        if (embedded) {
          emit?.(isAdminLogin || Boolean(route.query.redirect) ? 'authenticated' : 'close')
        }

        if (shouldNavigate) {
          await router.push(target)
          return
        }

        if (!embedded) {
          setView(AUTH_VIEWS.LOGIN)
        }
      }, isAdminLogin ? 900 : 650)
    } catch (error) {
      const code = error.response?.data?.code
      const messageByCode = {
        ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản với email này.',
        INVALID_PASSWORD: 'Mật khẩu không chính xác.',
        ACCOUNT_BANNED: 'Tài khoản đã bị khóa.',
        ACCOUNT_TEMPORARILY_LOCKED: 'Tài khoản đang tạm khóa. Vui lòng thử lại sau.',
        ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác minh.',
      }
      errorMessage.value = messageByCode[code]
        || error.response?.data?.message
        || error.message
        || 'Đăng nhập thất bại.'
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    errorMessage,
    showPassword,
    openForgotPassword,
    submitLogin,
    togglePassword,
  }
}
