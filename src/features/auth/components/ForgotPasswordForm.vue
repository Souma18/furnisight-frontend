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

defineEmits(['submit', 'back', 'send-code'])
</script>

<template>
  <form class="form" @submit.prevent="$emit('submit')">
    <div class="intro">
      <p class="title">Đặt lại mật khẩu</p>
      <p class="desc" v-if="form.step === 1">Chọn phương thức và nhận mã xác nhận.</p>
      <p class="desc" v-else>Tạo mật khẩu mới cho tài khoản của bạn.</p>
    </div>

    <template v-if="form.step === 1">
      <div class="method-toggle">
        <button type="button" :class="{ active: form.method === 'EMAIL' }" @click="form.method = 'EMAIL'">Email</button>
        <button type="button" :class="{ active: form.method === 'PHONE' }" @click="form.method = 'PHONE'">Số điện thoại</button>
      </div>

      <label>{{ form.method === 'EMAIL' ? 'Địa chỉ email' : 'Số điện thoại' }}</label>
      <div class="input-with-btn">
        <input 
          v-model="form.destination" 
          :type="form.method === 'EMAIL' ? 'email' : 'tel'" 
          :placeholder="form.method === 'EMAIL' ? 'hello@email.com' : '0901 234 567'" 
          required 
        />
        <button type="button" class="send-btn" @click="$emit('send-code')" :disabled="loading || !form.destination">
          {{ (loading && !form.code) ? 'Đang gửi...' : 'Gửi mã' }}
        </button>
      </div>

      <label>Mã xác nhận</label>
      <input v-model="form.code" type="text" placeholder="Nhập mã 6 số" required />
    </template>

    <template v-else>
      <label>Mật khẩu mới</label>
      <input v-model="form.newPassword" type="password" placeholder="Tối thiểu 8 ký tự" minlength="8" required />
    </template>

    <p v-if="error" class="error">{{ error }}</p>
    
    <button class="submit-btn" type="submit" :disabled="loading || (form.step === 1 && !form.code)">
      {{ loading ? 'Đang xử lý...' : (form.step === 1 ? 'Xác nhận mã' : 'Đổi mật khẩu') }}
    </button>
    <button class="outline-btn" type="button" @click="$emit('back')">
      ← Quay lại {{ form.step === 1 ? 'đăng nhập' : '' }}
    </button>
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
  margin-top: 0.2rem;
}
input {
  min-height: 2.55rem;
  border-radius: var(--auth-radius-md);
  border: 1px solid var(--auth-border);
  background: var(--auth-surface-secondary);
  color: var(--auth-text-primary);
  padding: 0 0.72rem;
  width: 100%;
  box-sizing: border-box;
}
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--auth-focus-ring);
}

.method-toggle {
  display: flex;
  background: var(--auth-surface-secondary);
  border-radius: var(--auth-radius-md);
  padding: 0.2rem;
  margin-bottom: 0.2rem;
}
.method-toggle button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.45rem;
  color: var(--auth-text-secondary);
  border-radius: var(--auth-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}
.method-toggle button.active {
  background: var(--auth-surface);
  color: var(--auth-text-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.input-with-btn {
  display: flex;
  gap: 0.45rem;
}
.input-with-btn input {
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

.submit-btn {
  min-height: 2.7rem;
  border: none;
  border-radius: var(--auth-radius-md);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}
.submit-btn:disabled {
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
.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.8rem;
}
</style>
