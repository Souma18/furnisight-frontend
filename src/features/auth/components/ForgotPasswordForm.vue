<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { useForgotPasswordForm } from '../composables/useForgotPasswordForm'
import PasswordField from './PasswordField.vue'

const { form, loading, errorMessage, goBackToLogin, sendCode, submitForgot } = useForgotPasswordForm()
</script>

<template>
  <form class="form" @submit.prevent="submitForgot">
    <div class="intro">
      <p class="title">Đặt lại mật khẩu</p>
      <p class="desc" v-if="form.step !== 1">Tạo mật khẩu mới cho tài khoản của bạn.</p>
    </div>

    <template v-if="form.step === 1">
      <label>Địa chỉ email</label>
      <div class="input-with-btn">
        <AppInput 
          v-model="form.destination" 
          type="email"
          placeholder="hello@email.com"
          required 
        />
        <AppButton variant="unstyled" type="button" class="send-btn" @click="sendCode" :disabled="loading || !form.destination">
          {{ (loading && !form.code) ? 'Đang gửi...' : 'Gửi mã' }}
        </AppButton>
      </div>

      <label>Mã xác nhận</label>
      <AppInput v-model="form.code" type="text" placeholder="Nhập mã 6 số" required />
    </template>

    <template v-else>
      <label>Mật khẩu mới</label>
      <PasswordField
        v-model="form.newPassword"
        placeholder="Tối thiểu 8 ký tự"
        autocomplete="new-password"
        minlength="8"
        required
      />
    </template>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    
    <AppButton class="submit-btn" type="submit" :disabled="loading || (form.step === 1 && !form.code)">
      {{ loading ? 'Đang xử lý...' : (form.step === 1 ? 'Xác nhận mã' : 'Đổi mật khẩu') }}
    </AppButton>
    <AppButton class="outline-btn" type="button" @click="goBackToLogin">
      ← Quay lại {{ form.step === 1 ? 'đăng nhập' : '' }}
    </AppButton>
  </form>
</template>

<style scoped>

.input-with-btn {
  display: flex;
  gap: 0.5rem;
}
.input-with-btn :deep(input) {
  flex: 1;
  min-width: 0; /* prevent input from blowing out flex container */
}
.send-btn {
  padding: 0 0.9rem;
  border: none;
  border-radius: var(--auth-radius-md);
  background: var(--auth-surface-secondary);
  color: var(--auth-text-primary);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  transition: background 0.2s;
  border: 1px solid var(--auth-border);
}
.send-btn:hover:not(:disabled) {
  background: var(--auth-border);
}
.send-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}



.outline-btn {
  min-height: 2.45rem;
  border-radius: var(--auth-radius-md);
  border: 1px solid var(--auth-border);
  background: transparent;
  color: var(--auth-text-secondary);
  cursor: pointer;
}

</style>
