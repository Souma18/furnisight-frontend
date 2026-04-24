<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'notify', 'upload-avatar', 'remove-avatar'])

const avatarInput = ref(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthday: '',
  gender: 'MALE',
  bio: '',
})

watch(
  () => props.profile,
  (value) => {
    if (!value) return
    Object.assign(form, value)
  },
  { immediate: true },
)

function submit() {
  emit('save', { ...form })
}

const avatarLabel = computed(() => {
  if (props.profile?.avatarUrl) return ''
  return props.profile?.initials ?? 'NA'
})

function pickAvatar() {
  avatarInput.value?.click()
}

function onAvatarSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return
  emit('upload-avatar', file)
  event.target.value = ''
}
</script>

<template>
  <AccountSectionCard title="Thông tin cá nhân">
    <section class="avatar-section">
      <div class="avatar-preview" @click="pickAvatar">
        <img v-if="profile?.avatarUrl" :src="profile.avatarUrl" alt="Avatar" />
        <span v-else>{{ avatarLabel }}</span>
      </div>
      <div class="avatar-meta">
        <h4>Ảnh đại diện</h4>
        <p>Định dạng JPG/PNG, kích thước tối đa 5MB.</p>
        <div class="avatar-actions">
          <button type="button" class="upload-btn" @click="pickAvatar">
            <AppIcon name="camera" :size="14" />
            Tải ảnh lên
          </button>
          <button type="button" class="ghost" @click="$emit('remove-avatar')">Xoá ảnh</button>
        </div>
      </div>
      <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="onAvatarSelected" />
    </section>

    <form class="grid" @submit.prevent="submit">
      <label>Họ <input v-model="form.lastName" placeholder="Nguyễn" required /></label>
      <label>Tên <input v-model="form.firstName" placeholder="Văn A" required /></label>
      <label>
        Email
        <div class="readonly-field">
          {{ profile?.email || 'Chưa liên kết' }}
        </div>
      </label>
      <label>
        Số điện thoại
        <div class="readonly-field">
          {{ profile?.phone || 'Chưa liên kết' }}
        </div>
      </label>
      <label>Ngày sinh <input v-model="form.birthday" type="date" /></label>
      <label>
        Giới tính
        <select v-model="form.gender">
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
      </label>
      <label class="full">Giới thiệu <textarea v-model="form.bio" rows="3" /></label>
      <div class="actions full">
        <button type="button" class="ghost" @click="$emit('notify', 'Đã huỷ thay đổi', 'error')">Huỷ</button>
        <button type="submit" class="primary">Lưu thay đổi</button>
      </div>
    </form>
  </AccountSectionCard>
</template>

<style scoped>
.avatar-section {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  border-bottom: 1px solid var(--auth-border);
  padding-bottom: 0.9rem;
  margin-bottom: 0.9rem;
}
.avatar-preview {
  width: 74px;
  height: 74px;
  border-radius: 999px;
  overflow: hidden;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--color-white);
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
}
.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-meta h4 {
  margin: 0;
  font-size: 0.95rem;
}
.avatar-meta p {
  margin: 0.2rem 0 0.55rem;
  font-size: 0.8rem;
  color: var(--auth-text-secondary);
}
.avatar-actions {
  display: flex;
  gap: 0.45rem;
}
.upload-btn {
  border: none;
  border-radius: 10px;
  min-height: 2.05rem;
  padding: 0 0.95rem;
  color: var(--color-white);
  background: var(--account-upload-bg);
  color: var(--account-upload-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.36rem;
  font-size: 0.82rem;
  font-weight: 500;
}
.upload-btn:hover {
  background: color-mix(in srgb, var(--account-upload-hover) 84%, black);
}
.hidden-input {
  display: none;
}
.grid { display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; }
label { display:grid; gap:0.35rem; font-size:0.82rem; color:var(--auth-text-secondary); }
input,select,textarea { min-height:2.5rem; border:1px solid var(--account-field-border); border-radius:10px; padding:0 0.68rem; background: var(--account-field-bg); color: var(--account-field-text); }
.readonly-field {
  min-height: 2.5rem;
  border: 1px solid var(--account-field-border);
  border-radius: 10px;
  padding: 0 0.68rem;
  background: color-mix(in srgb, var(--account-field-bg) 80%, transparent);
  color: var(--auth-text-secondary);
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  cursor: default;
  user-select: none;
}
textarea { min-height:5rem; padding-top:0.6rem; }
.full { grid-column:1 / -1; }
.actions { display:flex; justify-content:flex-end; gap:0.55rem; }
.ghost,.primary { border:none; border-radius:10px; min-height:2.5rem; padding:0 0.9rem; cursor:pointer; }
.ghost {
  background: var(--account-surface);
  color: var(--auth-brand-start);
  border: 1px solid color-mix(
  in srgb,
  var(--auth-brand-start) 30%,
  transparent
);
}
.ghost:hover {
  background: color-mix(in srgb, var(--auth-brand-start) 10%, var(--account-surface));
  border-color: var(--auth-brand-start);
}
.primary { color:var(--color-white); background:linear-gradient(135deg,var(--auth-brand-start),var(--auth-brand-end)); }
@media (max-width: 900px) { .grid { grid-template-columns:1fr; } }
@media (max-width: 900px) {
  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
