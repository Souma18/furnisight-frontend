<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

defineEmits(['submit', 'back'])
</script>

<template>
  <form class="form" @submit.prevent="$emit('submit')">
    <div class="intro">
      <p class="title">Đặt lại mật khẩu</p>
      <p class="desc">Nhập email để nhận link đặt lại mật khẩu.</p>
    </div>
    <label>Địa chỉ email</label>
    <input v-model="form.email" type="email" placeholder="hello@email.com" required />
    <p v-if="error" class="error">{{ error }}</p>
    <button class="submit-btn" type="submit" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Gửi link đặt lại' }}
    </button>
    <button class="outline-btn" type="button" @click="$emit('back')">← Quay lại đăng nhập</button>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.55rem;
}
.intro .title {
  margin: 0 0 0.2rem;
  color: var(--auth-text-primary);
  font-weight: 600;
}
.intro .desc {
  margin: 0;
  color: var(--auth-text-secondary);
  font-size: 0.83rem;
}
label {
  color: var(--auth-text-secondary);
  font-size: 0.76rem;
}
input {
  min-height: 2.55rem;
  border-radius: var(--auth-radius-md);
  border: 1px solid var(--auth-border);
  background: var(--auth-surface-secondary);
  color: var(--auth-text-primary);
  padding: 0 0.72rem;
}
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--auth-focus-ring);
}
.submit-btn {
  min-height: 2.7rem;
  border: none;
  border-radius: var(--auth-radius-md);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.outline-btn {
  min-height: 2.45rem;
  border-radius: var(--auth-radius-md);
  border: 1px solid var(--auth-border);
  background: transparent;
  color: var(--auth-text-secondary);
  cursor: pointer;
}
.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.8rem;
}
</style>
