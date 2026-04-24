<script setup>
import { reactive } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'

const emit = defineEmits(['notify'])

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function submit() {
  if (!form.newPassword || form.newPassword !== form.confirmPassword) {
    emit('notify', 'Mật khẩu xác nhận chưa khớp.', 'error')
    return
  }
  emit('notify', 'Đã cập nhật mật khẩu.')
}
</script>

<template>
  <AccountSectionCard title="Bảo mật & mật khẩu">
    <form class="grid" @submit.prevent="submit">
      <label>Mật khẩu hiện tại <input v-model="form.currentPassword" type="password" required /></label>
      <label>Mật khẩu mới <input v-model="form.newPassword" type="password" required /></label>
      <label>Xác nhận mật khẩu <input v-model="form.confirmPassword" type="password" required /></label>
      <button class="primary" type="submit">Cập nhật mật khẩu</button>
    </form>
  </AccountSectionCard>
</template>

<style scoped>
.grid { display:grid; gap:0.55rem; max-width:520px; }
label { display:grid; gap:0.35rem; font-size:0.82rem; color:var(--auth-text-secondary); }
input { min-height:2.45rem; border:1px solid var(--auth-border); border-radius:10px; padding:0 0.65rem; }
.primary { border:none; border-radius:10px; min-height:2.5rem; color:var(--color-white); background:linear-gradient(135deg,var(--auth-brand-start),var(--auth-brand-end)); cursor:pointer; }
</style>
