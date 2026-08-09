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
  const loading = ref(false)
  const errorMessage = ref('')
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

  async function submitLogin() {
    errorMessage.value = ''
    loading.value = true

    try {
      const identifier = String(form.email || '').trim().toLowerCase()
      const response = await authApi.login({
        identifier,
        password: form.password,
      })

      authStore.setSession(normalizeAuthSession(response))
      await authStore.ensureProfileLoaded()
      const isAdminLogin = authStore.isAdmin
      showSuccess({
        title: 'Đăng nhập thành công!',
        message: isAdminLogin
          ? 'Chào mừng trở lại. Bạn đang được chuyển hướng...'
          : 'Chào mừng trở lại.',
        mode: AUTH_VIEWS.LOGIN,
        loading: isAdminLogin,
      })

      const target = resolvePostLoginTarget()
      const shouldNavigate = !embedded || isAdminLogin || Boolean(route.query.redirect)

      if (embedded) {
        emit?.('authenticated', { isAdminLogin })
      }

      if (shouldNavigate) {
        setTimeout(async () => {
          await router.push(target)
        }, isAdminLogin ? 2000 : 2000)
      }
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
    openForgotPassword,
    submitLogin,
  }
}
