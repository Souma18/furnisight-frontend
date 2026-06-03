<script setup>
import { useLoginForm } from '../composables/useLoginForm'
import AuthSocialButtons from './AuthSocialButtons.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['authenticated', 'close'])
const {
  form,
  loading,
  errorMessage,
  showPassword,
  openForgotPassword,
  submitLogin,
  togglePassword,
} = useLoginForm({ embedded: props.embedded, emit })
</script>

<template>
  <form class="form" @submit.prevent="submitLogin">
    <label>Email</label>
    <input v-model="form.email" type="email" placeholder="hello@email.com" required />

    <label>Mật khẩu</label>
    <div class="password-row">
      <input
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Nhập mật khẩu"
        minlength="8"
        required
      />
      <button
        type="button"
        class="ghost-btn"
        :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
        @click="togglePassword"
      >
        <AppIcon :name="showPassword ? 'eyeOff' : 'eye'" :size="16" />
      </button>
    </div>

    <div class="right-link">
      <button type="button" class="text-btn" @click="openForgotPassword">Quên mật khẩu?</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <button class="submit-btn" type="submit" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
    </button>
    <AuthSocialButtons />
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.45rem;
}
label {
  color: var(--auth-text-secondary);
  font-size: 0.76rem;
  margin-top: 0.2rem;
}
input {
  min-height: 2.55rem;
  border-radius: var(--auth-radius-md);
  border: 1px solid var(--auth-border);
  background: var(--auth-surface-secondary);
  color: var(--auth-text-primary);
  padding: 0 0.72rem;
  width: 100%;
  box-sizing: border-box;
}
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--auth-focus-ring);
}
.password-row {
  position: relative;
}
.password-row input {
  width: 100%;
  padding-right: 3rem;
}
.ghost-btn {
  position: absolute;
  right: 0.2rem;
  top: 0.2rem;
  bottom: 0.2rem;
  border: none;
  border-radius: var(--auth-radius-sm);
  background: transparent;
  color: var(--auth-text-secondary);
  cursor: pointer;
  width: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.right-link {
  text-align: right;
}
.text-btn {
  border: none;
  background: transparent;
  color: var(--auth-brand-start);
  cursor: pointer;
  font-size: 0.76rem;
}
.submit-btn {
  min-height: 2.7rem;
  border: none;
  border-radius: var(--auth-radius-md);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: var(--color-white);
  font-weight: 600;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.error {
  margin: 0;
  color: var(--account-toast-error);
  font-size: 0.8rem;
}
</style>
