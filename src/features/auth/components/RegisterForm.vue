<script setup>
import { useRegisterForm } from '../composables/useRegisterForm'
import PasswordField from './PasswordField.vue'

const { form, loading, errorMessage, passwordStrength, submitRegister } = useRegisterForm()
</script>

<template>
  <form class="form" @submit.prevent="submitRegister">
    <div>
      <label>Họ và tên</label>
      <input v-model="form.fullName" type="text" placeholder="Nguyễn Văn A" required />
    </div>

    <label>Email</label>
    <input v-model="form.email" type="email" placeholder="hello@email.com" required />

    <label>Mật khẩu</label>
    <PasswordField
      v-model="form.password"
      placeholder="Tối thiểu 8 ký tự"
      autocomplete="new-password"
      minlength="8"
      required
    />
    <div class="strength">
      <span v-for="idx in 4" :key="idx" :class="{ active: idx <= passwordStrength }" />
    </div>

    <label class="checkbox">
      <input v-model="form.agree" type="checkbox" required />
      <span>Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật</span>
    </label>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <button class="submit-btn" type="submit" :disabled="loading || !form.agree">
      {{ loading ? 'Đang xử lý...' : 'Tạo tài khoản' }}
    </button>
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
}
input[type='text'],
input[type='email'],
input[type='tel'] {
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
.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.strength {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.22rem;
}
.strength span {
  height: 3px;
  border-radius: 999px;
  background: var(--auth-border);
}
.strength span.active {
  background: var(--auth-brand-end);
}
.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-top: 0.2rem;
}
.checkbox input {
  margin-top: 0.2rem;
}
.checkbox span {
  font-size: 0.75rem;
  color: var(--auth-text-secondary);
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
