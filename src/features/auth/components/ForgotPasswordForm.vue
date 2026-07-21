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
      <p class="title">{{ $t('auth.forgot.title') }}</p>
      <p class="desc" v-if="form.step !== 1">{{ $t('auth.forgot.desc') }}</p>
    </div>

    <template v-if="form.step === 1">
      <label>{{ $t('auth.forgot.email') }}</label>
      <div class="input-with-btn">
        <AppInput 
          v-model="form.destination" 
          type="email"
          :placeholder="$t('auth.login.emailPlaceholder')"
          required 
        />
        <AppButton variant="unstyled" type="button" class="send-btn" @click="sendCode" :disabled="loading || !form.destination">
          {{ (loading && !form.code) ? $t('auth.forgot.sending') : $t('auth.forgot.sendCode') }}
        </AppButton>
      </div>

      <label>{{ $t('auth.forgot.code') }}</label>
      <AppInput v-model="form.code" type="text" :placeholder="$t('auth.forgot.codePlaceholder')" required />
    </template>

    <template v-else>
      <label>{{ $t('auth.forgot.newPassword') }}</label>
      <PasswordField
        v-model="form.newPassword"
        :placeholder="$t('auth.register.passwordPlaceholder')"
        autocomplete="new-password"
        minlength="8"
        required
      />
    </template>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    
    <AppButton class="submit-btn" type="submit" :disabled="loading || (form.step === 1 && !form.code)">
      {{ loading ? $t('auth.login.processing') : (form.step === 1 ? $t('auth.forgot.submitCode') : $t('auth.forgot.submitPassword')) }}
    </AppButton>
    <AppButton class="outline-btn" type="button" @click="goBackToLogin">
      ← {{ form.step === 1 ? $t('auth.forgot.backToLogin') : $t('auth.forgot.back') }}
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
