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
      const response = await authApi.login({
        identifier: form.email,
        password: form.password,
      })
      authStore.setSession(normalizeAuthSession(response))
      showSuccess({
        title: 'Đăng nhập thành công!',
        message: 'Chào mừng trở lại. Bạn đang được chuyển hướng...',
        mode: AUTH_VIEWS.LOGIN,
      })

      successTimer = setTimeout(async () => {
        successTimer = null
        emit?.('authenticated')
        const target = resolvePostLoginTarget()
        const shouldNavigate = !embedded || authStore.isAdmin || Boolean(route.query.redirect)

        if (embedded) {
          emit?.('close')
          setView(AUTH_VIEWS.LOGIN)
        }

        if (shouldNavigate) {
          await router.push(target)
          return
        }

        setView(AUTH_VIEWS.LOGIN)
      }, 900)
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || 'Đăng nhập thất bại.'
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
