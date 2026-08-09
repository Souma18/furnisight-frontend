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
      <label>{{ $t('auth.register.fullName') }}</label>
      <AppInput v-model="form.fullName" type="text" :placeholder="$t('auth.register.fullNamePlaceholder')" required />
    </div>

    <label>{{ $t('auth.login.email') }}</label>
    <AppInput v-model="form.email" type="email" :placeholder="$t('auth.login.emailPlaceholder')" required />

    <label>{{ $t('auth.login.password') }}</label>
    <PasswordField
      v-model="form.password"
      :placeholder="$t('auth.register.passwordPlaceholder')"
      autocomplete="new-password"
      minlength="8"
      required
    />
    <div class="strength">
      <span v-for="idx in 4" :key="idx" :class="{ active: idx <= passwordStrength }" />
    </div>

    <label class="checkbox">
      <input v-model="form.agree" type="checkbox" required />
      <span>{{ $t('auth.register.agreeTerms') }}</span>
    </label>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <AppButton class="submit-btn" type="submit" :disabled="loading || !form.agree">
      {{ loading ? $t('auth.login.processing') : $t('auth.register.submit') }}
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
