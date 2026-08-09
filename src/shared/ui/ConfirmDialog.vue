<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận thao tác' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Xác nhận' },
  cancelLabel: { type: String, default: 'Đóng' },
  loading: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
})

defineEmits(['confirm', 'close'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="confirm-backdrop"
      role="presentation"
      @click.self="!loading && $emit('close')"
    >
      <section
        class="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div class="confirm-icon" :class="{ danger }">
          <AppIcon :name="danger ? 'alert' : 'info'" :size="22" />
        </div>
        <h2 id="confirm-dialog-title">{{ title }}</h2>
        <p id="confirm-dialog-message">{{ message }}</p>

        <div class="confirm-actions">
          <button type="button" class="confirm-secondary" :disabled="loading" @click="$emit('close')">
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="confirm-primary"
            :class="{ danger }"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            <AppIcon v-if="loading" name="refresh" :size="15" class="confirm-spinner" />
            {{ loading ? 'Đang xử lý...' : confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(10, 18, 28, 0.62);
  backdrop-filter: blur(5px);
}

.confirm-dialog {
  width: min(100%, 420px);
  padding: 1.35rem;
  border: 1px solid #e8dfd2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 28px 80px rgba(18, 32, 46, 0.28);
  color: #1a1812;
  font-family: var(--sans);
}

.confirm-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f5efe6;
  color: #9a6b20;
}

.confirm-icon.danger {
  background: #fdf0ee;
  color: #c0392b;
}

.confirm-dialog h2 {
  margin: 0.9rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.confirm-dialog p {
  margin: 0.45rem 0 0;
  color: #6b6560;
  font-size: 0.84rem;
  line-height: 1.6;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-top: 1.25rem;
}

.confirm-actions button {
  min-height: 42px;
  border-radius: 9px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.confirm-actions button:disabled {
  cursor: wait;
  opacity: 0.68;
}

.confirm-secondary {
  border: 1px solid #ded6ca;
  background: #fff;
  color: #55504a;
}

.confirm-primary {
  border: none;
  background: #12202e;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.confirm-primary.danger {
  background: #b63a31;
}

.confirm-spinner {
  animation: confirm-spin 0.8s linear infinite;
}

@keyframes confirm-spin {
  to { transform: rotate(360deg); }
}
</style>
