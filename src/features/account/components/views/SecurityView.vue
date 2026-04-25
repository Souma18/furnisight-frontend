<script setup>
import AccountSectionCard from '../AccountSectionCard.vue'
import { useSecurity } from '../../composables/useSecurity'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['notify', 'save-contact'])

const {
  form,
  contactModalOpen,
  linkModalOpen,
  contactType,
  activeContactTab,
  verifyCode,
  verifiedOldContact,
  newValue,
  newContactCode,
  currentContactLabel,
  maskedEmail,
  maskedPhone,
  contactTitles,
  linkTitles,
  isLoading,
  submit,
  openContactModal,
  openLinkModal,
  sendOldContactCode,
  verifyCurrentContact,
  sendNewContactCode,
  submitContactChange,
  sendLinkCode,
  submitLink,
} = useSecurity(props, emit)
</script>

<template>
  <AccountSectionCard title="Bảo mật tài khoản">
    <section class="security-layout">
      <article class="security-card">
        <header class="security-card-head">Thay đổi mật khẩu</header>
        <form class="security-card-body" @submit.prevent="submit">
          <label>Mật khẩu hiện tại <input v-model="form.currentPassword" type="password" required /></label>
          <label>Mật khẩu mới <input v-model="form.newPassword" type="password" required /></label>
          <label>Xác nhận mật khẩu <input v-model="form.confirmPassword" type="password" required /></label>
          <button class="primary" type="submit">Cập nhật mật khẩu</button>
        </form>
      </article>

      <article class="security-card">
        <header class="security-card-head">Thông tin liên kết</header>
        <div class="security-card-body">
          <div class="link-row">
            <div class="link-info">
              <p class="link-label">Email</p>
              <p class="link-value">{{ maskedEmail || 'Chưa liên kết' }}</p>
            </div>
            <button v-if="maskedEmail" class="secondary" type="button" @click="openContactModal('email')">
              Thay đổi
            </button>
            <button v-else class="link-btn" type="button" @click="openLinkModal('email')">
              Liên kết
            </button>
          </div>

          <div class="link-row">
            <div class="link-info">
              <p class="link-label">Số điện thoại</p>
              <p class="link-value">{{ maskedPhone || 'Chưa liên kết' }}</p>
            </div>
            <button v-if="maskedPhone" class="secondary" type="button" @click="openContactModal('phone')">
              Thay đổi
            </button>
            <button v-else class="link-btn" type="button" @click="openLinkModal('phone')">
              Liên kết
            </button>
          </div>
        </div>
      </article>
    </section>
  </AccountSectionCard>

  <!-- Modal: Liên kết mới (1 bước) -->
  <div v-if="linkModalOpen" class="overlay" @click.self="linkModalOpen = false">
    <section class="modal">
      <h4>{{ linkTitles.trigger }}</h4>
      <div class="panel">
        <label>{{ linkTitles.label }}
          <input
            v-model="newValue"
            :type="contactType === 'email' ? 'email' : 'tel'"
            :placeholder="contactType === 'email' ? 'email@example.com' : '0901 234 567'"
          />
        </label>
        <label>Mã xác minh
          <div class="input-with-btn">
            <input v-model="newContactCode" placeholder="Nhập mã OTP" />
            <button class="send-btn" type="button" :disabled="isLoading" @click="sendLinkCode">
              Gửi mã
            </button>
          </div>
        </label>
        <button class="primary" type="button" :disabled="isLoading" @click="submitLink">
          Xác nhận liên kết
        </button>
      </div>
    </section>
  </div>

  <!-- Modal: Thay đổi (2 bước) -->
  <div v-if="contactModalOpen" class="overlay" @click.self="contactModalOpen = false">
    <section class="modal">
      <h4>{{ contactTitles.trigger }}</h4>
      <div class="method-toggle">
        <button
          type="button"
          :class="{ active: activeContactTab === 'old' }"
          @click="activeContactTab = 'old'"
        >
          {{ contactTitles.old }}
        </button>
        <button
          type="button"
          :class="{ active: activeContactTab === 'new' }"
          :disabled="!verifiedOldContact"
          @click="activeContactTab = 'new'"
        >
          {{ contactTitles.next }}
        </button>
      </div>

      <div v-if="activeContactTab === 'old'" class="panel">
        <label>{{ contactTitles.old }}
          <input :value="currentContactLabel" disabled />
        </label>
        <label>Mã xác minh
          <div class="input-with-btn">
            <input v-model="verifyCode" placeholder="Nhập mã từ liên hệ cũ" />
            <button class="send-btn" type="button" :disabled="isLoading" @click="sendOldContactCode">Gửi mã</button>
          </div>
        </label>
        <button class="secondary" type="button" :disabled="isLoading" @click="verifyCurrentContact">
          Xác nhận
        </button>
      </div>

      <div v-else class="panel" :class="{ locked: !verifiedOldContact }">
        <label>{{ contactTitles.next }}
          <input
            v-model="newValue"
            :type="contactType === 'email' ? 'email' : 'tel'"
            :placeholder="contactType === 'email' ? 'emailmoi@example.com' : '0901 234 567'"
            :disabled="!verifiedOldContact"
          />
        </label>
        <label>Mã xác minh
          <div class="input-with-btn">
            <input
              v-model="newContactCode"
              placeholder="Nhập mã từ liên hệ mới"
              :disabled="!verifiedOldContact"
            />
            <button class="send-btn" type="button" :disabled="!verifiedOldContact || isLoading" @click="sendNewContactCode">Gửi mã</button>
          </div>
        </label>
        <button class="primary" type="button" :disabled="!verifiedOldContact || isLoading" @click="submitContactChange">
          Cập nhật
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.security-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
@media (max-width: 980px) {
  .security-layout {
    grid-template-columns: 1fr;
  }
}
</style>
