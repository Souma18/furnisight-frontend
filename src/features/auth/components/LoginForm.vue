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
    <label>{{ $t('auth.login.email') }}</label>
    <AppInput
      v-model.trim="form.email"
      type="email"
      :placeholder="$t('auth.login.emailPlaceholder')"
      autocomplete="email"
      autocapitalize="none"
      spellcheck="false"
      required
    />

    <label>{{ $t('auth.login.password') }}</label>
    <PasswordField
      v-model="form.password"
      :placeholder="$t('auth.login.passwordPlaceholder')"
      autocomplete="current-password"
      minlength="8"
      required
    />

    <div class="right-link">
      <AppButton type="button" class="text-btn" @click="openForgotPassword">{{ $t('auth.login.forgotPassword') }}</AppButton>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <AppButton class="submit-btn" type="submit" :disabled="loading">
      {{ loading ? $t('auth.login.processing') : $t('auth.login.submit') }}
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
