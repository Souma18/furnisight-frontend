<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AccountSectionCard from '../AccountSectionCard.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

import { useProfileForm } from '../../composables/useProfileForm'
import { useProfileStore } from '../../store/profileStore'
import { defineAsyncComponent } from 'vue'

const AddressView = defineAsyncComponent(() => import('./AddressView.vue'))
const SecurityView = defineAsyncComponent(() => import('./SecurityView.vue'))

const emit = defineEmits(['notify'])
const { t, locale } = useI18n()
const profileStore = useProfileStore()
const profile = computed(() => profileStore.profile)
const editing = ref(false)
const saving = ref(false)

const {
  form,
  avatarInput,
  avatarLabel,
  avatarUploading,
  submit,
  pickAvatar,
  onAvatarSelected,
  removeAvatar,
} = useProfileForm(profile, (message, type) => emit('notify', message, type))

const genderLabels = computed(() => ({
  MALE: t('account.profile.gender.male'),
  FEMALE: t('account.profile.gender.female'),
  OTHER: t('account.profile.gender.other'),
}))

const profileName = computed(() => {
  const nameParts = [form.lastName, form.firstName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)

  return nameParts.join(' ') || profile.value?.displayName || t('account.profile.defaultName')
})

const birthdayLabel = computed(() => formatBirthday(form.birthday))
const genderLabel = computed(() => genderLabels.value[form.gender] || t('account.profile.notUpdated'))
const bioLabel = computed(() => String(form.bio || '').trim() || t('account.profile.notUpdated'))
const maskedEmail = computed(() => maskEmail(profile.value?.email))

function maskEmail(email) {
  const value = String(email || '').trim()
  const [name, domain] = value.split('@')

  if (!name || !domain) return t('account.profile.noEmail')

  const head = name.slice(0, Math.min(3, name.length))
  return `${head}***@${domain}`
}

function formatBirthday(value) {
  if (!value) return t('account.profile.notUpdated')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'vi-VN')
}

function resetFormFromProfile() {
  const value = profile.value || {}
  Object.assign(form, {
    firstName: value.firstName || '',
    lastName: value.lastName || '',
    birthday: value.birthday || '',
    gender: value.gender || 'MALE',
    bio: value.bio || '',
    avatarMediaId: value.avatarMediaId ?? null,
  })
}

function startEditing() {
  resetFormFromProfile()
  editing.value = true
}

function cancelEditing() {
  resetFormFromProfile()
  editing.value = false
}

async function handleSubmit() {
  try {
    saving.value = true
    await submit()
    editing.value = false
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  profileStore.fetchProfile().catch((error) => {
    emit('notify', error?.response?.data?.message || t('account.profile.loadError'), 'error')
  })
})
</script>

<template>
  <div class="profile-layout">
    <AccountSectionCard :title="t('account.profile.title')">
    <template #head>
      <AppButton v-if="!editing" type="button" class="edit-btn" @click="startEditing">
        <AppIcon name="pencil" :size="14" />
        {{ t('account.profile.edit') }}
      </AppButton>
      <span v-else class="edit-state">{{ t('account.profile.editing') }}</span>
    </template>

    <div class="profile-simple" :class="{ 'profile-simple--editing': editing }">
      <header class="profile-summary">
        <AppButton
          type="button"
          class="avatar-button"
          :aria-label="avatarUploading ? t('account.profile.avatarUploading') : t('account.profile.changeAvatarAria')"
          :disabled="avatarUploading"
          @click="pickAvatar"
        >
          <AppImage v-if="profile?.avatarUrl" :src="profile.avatarUrl" alt="Avatar"  />
          <span v-else>{{ avatarLabel }}</span>
          <span class="avatar-camera" aria-hidden="true">
            <AppIcon name="camera" :size="14" />
          </span>
        </AppButton>

        <div class="profile-identity">
          <div class="summary-copy">
            <p class="summary-kicker">{{ t('account.profile.info') }}</p>
            <h4>{{ profileName }}</h4>
            <p>{{ maskedEmail }}</p>
          </div>

          <div class="avatar-actions">
            <AppButton type="button" class="avatar-action" :disabled="avatarUploading" @click="pickAvatar">
              <AppIcon name="camera" :size="14" />
              {{ t('account.profile.changeAvatar') }}
            </AppButton>
            <AppButton
              v-if="profile?.avatarUrl"
              type="button"
              class="avatar-action avatar-action--danger"
              :disabled="avatarUploading"
              @click="removeAvatar"
            >
              {{ t('account.profile.removeAvatar') }}
            </AppButton>
          </div>
        </div>
      </header>

      <section v-if="!editing" class="read-list" :aria-label="t('account.profile.info')">
        <article class="read-row">
          <span>{{ t('account.profile.fullName') }}</span>
          <strong>{{ profileName }}</strong>
        </article>
        <article class="read-row">
          <span>Email</span>
          <strong>{{ maskedEmail }}</strong>
        </article>
        <article class="read-row">
          <span>{{ t('account.profile.birthday') }}</span>
          <strong>{{ birthdayLabel }}</strong>
        </article>
        <article class="read-row">
          <span>{{ t('account.profile.gender.label') }}</span>
          <strong>{{ genderLabel }}</strong>
        </article>
        <article class="read-row read-row--wide">
          <span>{{ t('account.profile.bio') }}</span>
          <strong>{{ bioLabel }}</strong>
        </article>
      </section>

      <form v-else class="profile-form" @submit.prevent="handleSubmit">
        <div class="field-grid">
          <label>{{ t('account.profile.lastName') }} <AppInput v-model="form.lastName" :placeholder="t('account.profile.lastNamePlaceholder')" required /></label>
          <label>{{ t('account.profile.firstName') }} <AppInput v-model="form.firstName" :placeholder="t('account.profile.firstNamePlaceholder')" required /></label>
          <label>
            Email
            <div class="readonly-field">
              {{ maskedEmail }}
            </div>
          </label>
          <label>{{ t('account.profile.birthday') }} <input v-model="form.birthday" type="date" /></label>
          <label>
            {{ t('account.profile.gender.label') }}
            <select v-model="form.gender">
              <option value="MALE">{{ t('account.profile.gender.male') }}</option>
              <option value="FEMALE">{{ t('account.profile.gender.female') }}</option>
              <option value="OTHER">{{ t('account.profile.gender.other') }}</option>
            </select>
          </label>
          <label class="full">
            {{ t('account.profile.bio') }}
            <textarea v-model="form.bio" :placeholder="t('account.profile.bioPlaceholder')" rows="4" />
          </label>
        </div>

        <div class="actions">
          <AppButton type="button" class="ghost" :disabled="saving" @click="cancelEditing">{{ t('common.cancel') }}</AppButton>
          <AppButton type="submit" class="primary" :disabled="saving">
            {{ saving ? t('account.profile.saving') : t('account.profile.saveChanges') }}
          </AppButton>
        </div>
      </form>

      <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="onAvatarSelected" />
    </div>
    </AccountSectionCard>

    <AddressView @notify="(msg, type) => emit('notify', msg, type)" />
    <SecurityView @notify="(msg, type) => emit('notify', msg, type)" />
  </div>
</template>

<style scoped>
.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.edit-btn,
.edit-state,
.avatar-action,
.ghost,
.primary {
  appearance: none;
  -webkit-appearance: none;
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font: inherit;
  font-weight: 720;
  gap: 7px;
  justify-content: center;
  line-height: 1;
}

.edit-btn {
  background: var(--app-navy-soft, #12202e);
  border: 1px solid var(--app-navy-soft, #12202e);
  color: var(--app-heading-inverse, #fffdf9);
  cursor: pointer;
  min-height: 36px;
  padding: 0 12px;
}

.edit-btn:hover,
.edit-btn:focus-visible {
  background: var(--app-navy, #1b3044);
  border-color: var(--app-navy, #1b3044);
}

.edit-state {
  background: color-mix(in srgb, var(--app-gold, #c9922a) 12%, var(--app-surface));
  border: 1px solid color-mix(in srgb, var(--app-gold, #c9922a) 24%, transparent);
  color: var(--app-gold, #8a601c);
  font-size: 0.8rem;
  min-height: 32px;
  padding: 0 10px;
}

.profile-simple {
  display: grid;
  gap: 18px;
}

.profile-summary {
  align-items: start;
  border-bottom: 1px solid var(--app-border, rgba(224, 210, 184, 0.74));
  display: grid;
  gap: 18px;
  grid-template-columns: auto minmax(0, 1fr);
  padding-bottom: 18px;
}

.avatar-button {
  appearance: none;
  -webkit-appearance: none;
  background: var(--app-surface-soft, #f7f1e7);
  border: 1px solid var(--app-border, rgba(224, 210, 184, 0.92));
  border-radius: 8px;
  color: var(--app-gold, #c9922a);
  cursor: pointer;
  display: grid;
  font: inherit;
  font-size: 1.35rem;
  font-weight: 780;
  height: 74px;
  overflow: hidden;
  padding: 0;
  place-items: center;
  position: relative;
  width: 74px;
}

.avatar-button img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.avatar-camera {
  align-items: center;
  background: color-mix(in srgb, var(--app-bg-deep, #12202e) 90%, transparent);
  border: 1px solid color-mix(in srgb, var(--app-heading-inverse, #fffdf9) 58%, transparent);
  border-radius: 999px;
  bottom: 6px;
  color: var(--app-heading-inverse, #fffdf9);
  display: inline-flex;
  height: 24px;
  justify-content: center;
  position: absolute;
  right: 6px;
  width: 24px;
}

.avatar-button:hover,
.avatar-button:focus-visible {
  border-color: color-mix(in srgb, var(--app-gold, #c9922a) 54%, transparent);
  outline: 2px solid color-mix(in srgb, var(--app-gold, #c9922a) 24%, transparent);
  outline-offset: 2px;
}

.profile-identity {
  align-items: start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  min-width: 0;
}

.summary-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.summary-kicker {
  color: var(--app-gold, #8a601c);
  font-size: 0.72rem;
  font-weight: 780;
  letter-spacing: 0.11em;
  margin: 0;
  text-transform: uppercase;
}

.summary-copy h4 {
  color: var(--app-heading, #12202e);
  font-size: clamp(1.28rem, 2.3vw, 1.8rem);
  line-height: 1.12;
  margin: 0;
  overflow-wrap: anywhere;
}

.summary-copy p:not(.summary-kicker) {
  color: var(--app-text-muted, #746b5f);
  font-size: 0.9rem;
  margin: 0;
  overflow-wrap: anywhere;
}

.avatar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 3px;
}

.avatar-action {
  background: var(--app-control-bg, #fffdf9);
  border: 1px solid color-mix(in srgb, var(--app-gold, #c9922a) 30%, transparent);
  color: var(--app-gold, #8a601c);
  cursor: pointer;
  min-height: 36px;
  padding: 0 11px;
}

.avatar-action:hover:not(:disabled),
.avatar-action:focus-visible {
  background: color-mix(in srgb, var(--app-gold, #c9922a) 10%, var(--app-surface));
  border-color: color-mix(in srgb, var(--app-gold, #c9922a) 48%, transparent);
}

.avatar-action--danger {
  border-color: color-mix(in srgb, var(--app-danger, #b7352d) 26%, transparent);
  color: var(--app-danger, #b7352d);
}

.avatar-action--danger:hover:not(:disabled),
.avatar-action--danger:focus-visible {
  background: color-mix(in srgb, var(--app-danger, #b7352d) 10%, var(--app-surface));
  border-color: color-mix(in srgb, var(--app-danger, #b7352d) 42%, transparent);
}

.read-list {
  display: grid;
  gap: 0;
}

.read-row {
  align-items: baseline;
  border-bottom: 1px solid var(--app-border, rgba(224, 210, 184, 0.58));
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(120px, 0.28fr) minmax(0, 1fr);
  padding: 15px 0;
}

.read-row:first-child {
  padding-top: 2px;
}

.read-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.read-row span {
  color: var(--app-text-muted, #746b5f);
  font-size: 0.82rem;
  font-weight: 650;
}

.read-row strong {
  color: var(--app-heading, #12202e);
  font-size: 0.95rem;
  font-weight: 680;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.read-row--wide strong {
  color: var(--app-text, #5f574d);
  font-weight: 560;
}

.profile-form {
  display: grid;
  gap: 16px;
}

.field-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  color: var(--app-text-muted, #5f574d);
  display: grid;
  font-size: 0.82rem;
  font-weight: 650;
  gap: 7px;
}

input,
select,
textarea,
.readonly-field {
  background: var(--app-control-bg, #fffdf9);
  border: 1px solid var(--app-border, rgba(224, 210, 184, 0.96));
  border-radius: 8px;
  color: var(--app-heading, #12202e);
  min-height: 2.7rem;
  padding: 0 0.78rem;
}

input:hover,
select:hover,
textarea:hover,
.readonly-field:hover {
  border-color: color-mix(in srgb, var(--app-gold, #c9922a) 48%, transparent);
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible,
button:focus-visible {
  outline: 2px solid var(--app-focus-ring, rgba(201, 146, 42, 0.24));
  outline-offset: 2px;
}

.readonly-field {
  align-items: center;
  color: var(--app-text-muted, #746b5f);
  display: flex;
  font-size: 0.88rem;
  user-select: none;
}

textarea {
  min-height: 104px;
  padding-top: 0.72rem;
  resize: vertical;
}

.full {
  grid-column: 1 / -1;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.ghost,
.primary {
  cursor: pointer;
  min-height: 2.55rem;
  padding: 0 1rem;
}

.ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--app-gold, #8a601c);
}

.ghost:hover:not(:disabled),
.ghost:focus-visible {
  background: color-mix(in srgb, var(--app-gold, #c9922a) 10%, var(--app-surface));
  border-color: color-mix(in srgb, var(--app-gold, #c9922a) 24%, transparent);
}

.primary {
  background: var(--app-navy-soft, #12202e);
  border: 1px solid var(--app-navy-soft, #12202e);
  color: var(--app-heading-inverse, #fffdf9);
}

.primary:hover:not(:disabled),
.primary:focus-visible {
  background: var(--app-navy, #1b3044);
  border-color: var(--app-navy, #1b3044);
}



button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.hidden-input {
  display: none;
}

@media (max-width: 760px) {
  .profile-summary {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .profile-identity {
    flex-direction: column;
    gap: 10px;
  }

  .avatar-actions {
    justify-content: flex-start;
    padding-top: 0;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .profile-summary,
  .read-row {
    grid-template-columns: 1fr;
  }

  .avatar-button {
    height: 78px;
    width: 78px;
  }

  .avatar-actions,
  .actions {
    flex-direction: column;
  }

  .avatar-actions > *,
  .actions > * {
    width: 100%;
  }
}
</style>
