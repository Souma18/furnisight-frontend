<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { useRegisterForm } from '../composables/useRegisterForm'
import PasswordField from './PasswordField.vue'

const { form, loading, errorMessage, passwordStrength, submitRegister } = useRegisterForm()
</script>

<template>
  <form class="form" @submit.prevent="submitRegister">
    <div>
      <label>Họ và tên</label>
      <AppInput v-model="form.fullName" type="text" placeholder="Nguyễn Văn A" required />
    </div>

    <label>Email</label>
    <AppInput v-model="form.email" type="email" placeholder="hello@email.com" required />

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
    <AppButton class="submit-btn" type="submit" :disabled="loading || !form.agree">
      {{ loading ? 'Đang xử lý...' : 'Tạo tài khoản' }}
    </AppButton>
  </form>
</template>

<style scoped>


.checkbox input {
  margin-top: 0.2rem;
}
.checkbox span {
  font-size: 0.75rem;
  color: var(--auth-text-secondary);
}



</style>
