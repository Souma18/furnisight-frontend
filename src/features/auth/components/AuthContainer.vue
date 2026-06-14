<script setup>
import { provideAuthViewState, useAuthViewState } from '../composables/useAuthViewState'
import AuthTabs from './AuthTabs.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ForgotPasswordForm from './ForgotPasswordForm.vue'
import AuthSuccessState from './AuthSuccessState.vue'
import VerifyEmailForm from './VerifyEmailForm.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  initialView: {
    type: String,
    default: 'login',
  },
})

defineEmits(['close', 'authenticated'])

const authViewState = useAuthViewState(props.initialView)
provideAuthViewState(authViewState)
const { AUTH_VIEWS, activeView, successState, showTabs, setView } = authViewState

function handleTabChange(tab) {
  setView(tab)
}
</script>

<template>
  <div class="auth-shell" :class="{ 'auth-shell--embedded': embedded }">
    <section 
      id="auth-box" 
      class="auth-card" 
      :class="{ 'auth-card--register': activeView === AUTH_VIEWS.REGISTER }"
    >
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
        <Transition name="form-fade" mode="out-in">
          <LoginForm
            v-if="activeView === AUTH_VIEWS.LOGIN"
            :embedded="embedded"
            @authenticated="$emit('authenticated')"
            @close="$emit('close')"
          />
          <RegisterForm v-else-if="activeView === AUTH_VIEWS.REGISTER" />
          <ForgotPasswordForm v-else-if="activeView === AUTH_VIEWS.FORGOT" />
          <VerifyEmailForm v-else-if="activeView === AUTH_VIEWS.VERIFY" />
          <AuthSuccessState
            v-else
            :title="successState.title"
            :message="successState.message"
            :loading="successState.loading"
          />
        </Transition>
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth-shell {
  flex: 1;
  width: 100%;
  min-height: calc(100svh - 56px);
  border-radius: 0;
  background:
    radial-gradient(circle at 18% 16%, rgba(255, 177, 40, 0.22), transparent 28%),
    var(--auth-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
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
  transition: max-width 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  margin: 0 auto;
}

.auth-card--register {
  max-width: 480px;
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

/* Animations cho form */
.form-fade-enter-active,
.form-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.form-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.form-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
