<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useAuthViewState } from '../composables/useAuthViewState'
import {
  mockLoginRequest,
  mockRegisterRequest,
  mockForgotPasswordRequest,
} from '../api/authMockApi'
import AuthTabs from './AuthTabs.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ForgotPasswordForm from './ForgotPasswordForm.vue'
import AuthSuccessState from './AuthSuccessState.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'authenticated'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { AUTH_VIEWS, activeView, successState, showTabs, setView, showSuccess } = useAuthViewState()

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
    const session = await mockLoginRequest(loginForm)
    authStore.setSession(session)
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
    errorMessage.value = error.message ?? 'Đăng nhập thất bại.'
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  errorMessage.value = ''
  loading.value = true
  try {
    await mockRegisterRequest(registerForm)
    showSuccess({
      title: 'Tạo tài khoản thành công!',
      message: 'Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
      mode: AUTH_VIEWS.REGISTER,
    })
    setTimeout(() => setView(AUTH_VIEWS.LOGIN), 1300)
  } catch (error) {
    errorMessage.value = error.message ?? 'Đăng ký thất bại.'
  } finally {
    loading.value = false
  }
}

async function submitForgot() {
  errorMessage.value = ''
  loading.value = true
  try {
    await mockForgotPasswordRequest(forgotForm)
    showSuccess({
      title: 'Email đã được gửi!',
      message: 'Link đặt lại mật khẩu có hiệu lực trong 15 phút.',
      mode: AUTH_VIEWS.FORGOT,
    })
    setTimeout(() => setView(AUTH_VIEWS.LOGIN), 1300)
  } catch (error) {
    errorMessage.value = error.message ?? 'Gửi email thất bại.'
  } finally {
    loading.value = false
  }
}

function handleTabChange(tab) {
  errorMessage.value = ''
  setView(tab)
}
</script>

<template>
  <div class="auth-shell" :class="{ 'auth-shell--embedded': embedded }">
    <section id="auth-box" class="auth-card">
      <div class="auth-header">
        <div class="brand-row">
          <div class="brand-icon"><AppIcon name="lock" :size="14" :stroke-width="2" /></div>
          <div>
            <p class="brand-title">LUXNEST</p>
            <p class="brand-subtitle">Nội thất cao cấp</p>
          </div>
          <button v-if="embedded" class="close-btn" type="button" @click="$emit('close')">
            <AppIcon name="close" :size="14" :stroke-width="2" />
          </button>
        </div>
        <AuthTabs v-if="showTabs" :model-value="activeView" @update:model-value="handleTabChange" />
      </div>

      <div class="auth-body">
        <LoginForm
          v-if="activeView === AUTH_VIEWS.LOGIN"
          :form="loginForm"
          :loading="loading"
          :error="errorMessage"
          :show-password="showPassword"
          @submit="submitLogin"
          @forgot="setView(AUTH_VIEWS.FORGOT)"
          @toggle-password="showPassword = !showPassword"
        />
        <RegisterForm
          v-else-if="activeView === AUTH_VIEWS.REGISTER"
          :form="registerForm"
          :loading="loading"
          :error="errorMessage"
          :password-strength="passwordStrength"
          @submit="submitRegister"
        />
        <ForgotPasswordForm
          v-else-if="activeView === AUTH_VIEWS.FORGOT"
          :form="forgotForm"
          :loading="loading"
          :error="errorMessage"
          @submit="submitForgot"
          @back="setView(AUTH_VIEWS.LOGIN)"
        />
        <AuthSuccessState
          v-else
          :title="successState.title"
          :message="successState.message"
          :loading="loading || successState.mode === AUTH_VIEWS.LOGIN"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 580px;
  border-radius: var(--auth-radius-lg);
  background: var(--auth-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.auth-shell--embedded {
  min-height: auto;
  padding: 0;
  background: transparent;
}

.auth-card {
  background: var(--auth-surface);
  border-radius: var(--auth-radius-xl);
  border: 1px solid var(--auth-border);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.auth-header {
  padding: 1.2rem 1.4rem 0;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.62rem;
  margin-bottom: 0.95rem;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  border-radius: var(--auth-radius-sm);
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
}

.brand-title {
  margin: 0;
  font-size: 0.94rem;
  color: var(--auth-text-primary);
  font-weight: 600;
}

.brand-subtitle {
  margin: 0.1rem 0 0;
  font-size: 0.68rem;
  color: var(--auth-text-secondary);
}

.close-btn {
  margin-left: auto;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: var(--auth-radius-sm);
  border: 1px solid var(--auth-border);
  background: var(--auth-surface-secondary);
  color: var(--auth-text-secondary);
  cursor: pointer;
}

.auth-body {
  padding: 1.2rem 1.4rem 1.4rem;
}
</style>
