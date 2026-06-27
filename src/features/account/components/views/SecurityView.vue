<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { useI18n } from 'vue-i18n'
import AccountSectionCard from '../AccountSectionCard.vue'
import { usePasswordManager } from '../../composables/usePasswordManager'

const emit = defineEmits(['notify'])
const { t } = useI18n()

const {
  form: passwordForm,
  isLoading: isPasswordLoading,
  submit: submitPassword,
} = usePasswordManager((msg, type) => emit('notify', msg, type))
</script>

<template>
  <AccountSectionCard :title="t('account.security.title')">
    <section class="security-layout">
      <article class="security-card">
        <header class="security-card-head">{{ t('account.security.changePassword') }}</header>
        <form class="security-card-body" @submit.prevent="submitPassword">
          <label>{{ t('account.security.currentPassword') }} <AppInput v-model="passwordForm.currentPassword" type="password" required :disabled="isPasswordLoading" /></label>
          <label>{{ t('account.security.newPassword') }} <AppInput v-model="passwordForm.newPassword" type="password" required :disabled="isPasswordLoading" /></label>
          <label>{{ t('account.security.confirmPassword') }} <AppInput v-model="passwordForm.confirmPassword" type="password" required :disabled="isPasswordLoading" /></label>
          <AppButton class="primary" type="submit" :disabled="isPasswordLoading">{{ t('account.security.updatePassword') }}</AppButton>
        </form>
      </article>


    </section>
  </AccountSectionCard>
</template>

<style scoped>
.security-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
  align-items: stretch;
}
.security-card {
  border: 1px solid var(--account-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--account-surface);
  display: flex;
  flex-direction: column;
}
.security-card-head {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--account-border);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--auth-text-primary);
}
.security-card-body {
  padding: 0.95rem 1rem 1rem;
  display: grid;
  gap: 0.75rem;
  flex: 1;
}
label { display:grid; gap:0.35rem; font-size:0.82rem; color:var(--auth-text-secondary); }
input { min-height:2.45rem; border:1px solid var(--auth-border); border-radius:10px; padding:0 0.65rem; background:var(--account-field-bg); color:var(--account-field-text); }
input:disabled { opacity:0.7; cursor:not-allowed; }
.method-select {
  border: 1px solid var(--auth-border);
  border-radius: 10px;
  min-height: 2.45rem;
  padding: 0 0.65rem;
  background: var(--account-field-bg);
  color: var(--account-field-text);
  font-family: inherit;
  font-size: 0.85rem;
  width: 100%;
}
.method-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.primary { border:none; border-radius:10px; min-height:2.5rem; color:var(--color-white); background:linear-gradient(135deg,var(--auth-brand-start),var(--auth-brand-end)); cursor:pointer; }
.primary:disabled { opacity:0.65; cursor:not-allowed; }
.secondary {
  border:1px solid color-mix(in srgb, var(--auth-brand-start) 30%, transparent);
  border-radius:10px;
  min-height:2.5rem;
  background:var(--account-surface);
  color:var(--auth-brand-start);
  cursor:pointer;
}
.secondary:hover { background:color-mix(in srgb, var(--auth-brand-start) 8%, var(--account-surface)); }
.link-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid var(--account-border);
  border-radius: 12px;
  padding: 0.75rem;
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.danger {
  border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
  border-radius: 10px;
  min-height: 2.5rem;
  padding: 0 0.75rem;
  background: var(--account-surface);
  color: var(--color-error);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
}
.danger:hover {
  background: color-mix(in srgb, var(--color-error) 8%, var(--account-surface));
}
.link-info {
  min-width: 0;
}
.link-label {
  margin: 0;
  color: var(--account-text-muted);
  font-size: 0.84rem;
}
.link-value {
  margin: 0.2rem 0 0;
  font-weight: 600;
  color: var(--account-text-strong);
  word-break: break-all;
}
.link-empty {
  margin: 0;
  color: var(--account-text-muted);
  font-size: 0.85rem;
  font-style: italic;
}
.link-btn {
  border: 1px solid color-mix(in srgb, var(--auth-brand-start) 40%, transparent);
  border-radius: 10px;
  min-height: 2.2rem;
  padding: 0 0.75rem;
  background: color-mix(in srgb, var(--auth-brand-start) 8%, transparent);
  color: var(--auth-brand-start);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}
.link-btn:hover {
  background: color-mix(in srgb, var(--auth-brand-start) 15%, transparent);
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 7, 17, 0.55);
  display: grid;
  place-items: center;
  z-index: 95;
  padding: 1rem;
}
.modal {
  width: min(400px, 100%);
  border-radius: 14px;
  border: 1px solid var(--account-border);
  background: var(--account-surface);
  padding: 1rem;
}
.modal h4 {
  margin: 0 0 0.9rem;
  color: var(--auth-text-primary);
}
.method-toggle {
  display: flex;
  background: var(--auth-surface-secondary);
  border-radius: var(--auth-radius-md);
  padding: 0.2rem;
  margin-bottom: 0.75rem;
}
.method-toggle button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.45rem;
  color: var(--auth-text-secondary);
  border-radius: var(--auth-radius-sm);
  cursor: pointer;
}
.method-toggle button.active {
  background: var(--auth-surface);
  color: var(--auth-text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.method-toggle button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.panel {
  border: 1px solid var(--account-border);
  border-radius: 12px;
  padding: 0.75rem;
  display: grid;
  gap: 0.6rem;
}
.input-with-btn {
  display: grid;           
  grid-template-columns: 1fr auto;
  gap: 0.45rem;
}
.input-with-btn input {
  flex: 1;
  min-width: 0;
}
.send-btn {
  padding: 0 0.9rem;
  border: 1px solid var(--auth-border);
  border-radius: var(--auth-radius-md);
  background: var(--auth-surface-secondary);
  color: var(--auth-text-primary);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.send-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.panel-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--account-text-strong);
}
.panel-next.locked {
  opacity: 0.58;
}

</style>
