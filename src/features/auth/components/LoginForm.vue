<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { useLoginForm } from '../composables/useLoginForm'
import AuthSocialButtons from './AuthSocialButtons.vue'
import PasswordField from './PasswordField.vue'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['authenticated'])
const {
  form,
  loading,
  errorMessage,
  openForgotPassword,
  submitLogin,
} = useLoginForm({ embedded: props.embedded, emit })
</script>

<template>
  <form class="form" @submit.prevent="submitLogin">
    <label>Email</label>
    <AppInput
      v-model.trim="form.email"
      type="email"
      placeholder="hello@email.com"
      autocomplete="email"
      autocapitalize="none"
      spellcheck="false"
      required
    />

    <label>Mật khẩu</label>
    <PasswordField
      v-model="form.password"
      placeholder="Nhập mật khẩu"
      autocomplete="current-password"
      minlength="8"
      required
    />

    <div class="right-link">
      <AppButton type="button" class="text-btn" @click="openForgotPassword">Quên mật khẩu?</AppButton>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <AppButton class="submit-btn" type="submit" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
    </AppButton>
    <AuthSocialButtons />
  </form>
</template>

<style scoped>




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



</style>
