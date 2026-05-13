<script setup>
import { reactive, ref } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
} from '@shared/lib/publicApis/vietnamAddressApi'

const props = defineProps({
  addresses: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['save-address', 'notify'])

const showModal = ref(false)
const provinces = ref([])
const districts = ref([])
const wards = ref([])
const loadingProvince = ref(false)
const loadingDistrict = ref(false)
const loadingWard = ref(false)
const fallbackMode = ref(false)

const form = reactive({
  fullName: '',
  phone: '',
  detail: '',
  provinceCode: '',
  districtCode: '',
  wardCode: '',
  provinceName: '',
  districtName: '',
  wardName: '',
  type: 'home',
  isDefault: false,
})

async function openModal() {
  showModal.value = true
  if (provinces.value.length) return
  loadingProvince.value = true
  try {
    provinces.value = await getProvinces()
    fallbackMode.value = false
  } catch (_error) {
    fallbackMode.value = true
    emit('notify', 'API địa chỉ công khai lỗi, đang dùng nhập tay.', 'error')
  } finally {
    loadingProvince.value = false
  }
}

async function onProvinceChange() {
  const selected = provinces.value.find((item) => String(item.code) === String(form.provinceCode))
  form.provinceName = selected?.name ?? ''
  form.districtCode = ''
  form.wardCode = ''
  districts.value = []
  wards.value = []
  if (!form.provinceCode) return
  loadingDistrict.value = true
  try {
    districts.value = await getDistrictsByProvince(form.provinceCode)
  } finally {
    loadingDistrict.value = false
  }
}

async function onDistrictChange() {
  const selected = districts.value.find((item) => String(item.code) === String(form.districtCode))
  form.districtName = selected?.name ?? ''
  form.wardCode = ''
  wards.value = []
  if (!form.districtCode) return
  loadingWard.value = true
  try {
    wards.value = await getWardsByDistrict(form.districtCode)
  } finally {
    loadingWard.value = false
  }
}

function onWardChange() {
  const selected = wards.value.find((item) => String(item.code) === String(form.wardCode))
  form.wardName = selected?.name ?? ''
}

function submitAddress() {
  if (!form.fullName || !form.phone || !form.detail) {
    emit('notify', 'Vui lòng điền thông tin bắt buộc.', 'error')
    return
  }
  emit('save-address', { ...form })
  showModal.value = false
}
</script>

<template>
  <AccountSectionCard title="Địa chỉ giao hàng">
    <template #head>
      <button class="primary" @click="openModal">Thêm địa chỉ mới</button>
    </template>
    <div class="list">
      <article v-for="address in addresses" :key="address.id" class="item">
        <p class="name">{{ address.fullName }}</p>
        <p class="meta">{{ address.phone }}</p>
        <p class="meta">
          {{ address.detail }}, {{ address.wardName }}, {{ address.districtName }},
          {{ address.provinceName }}
        </p>
      </article>
    </div>
  </AccountSectionCard>

  <div v-if="showModal" class="overlay" @click.self="showModal = false">
    <div class="modal">
      <h4>Thêm địa chỉ</h4>
      <div class="form-grid">
        <label>Họ tên <input v-model.trim="form.fullName" placeholder="Nguyễn Văn A"/></label>
        <label>Số điện thoại <input v-model.trim="form.phone" placeholder="0123456789" /></label>
        <label>
          Tỉnh/Thành
          <select v-model="form.provinceCode" :disabled="fallbackMode" @change="onProvinceChange">
            <option value="">Chọn tỉnh thành</option>
            <option v-for="province in provinces" :key="province.code" :value="province.code">
              {{ province.name }}
            </option>
          </select>
        </label>
        <label>
          Quận/Huyện
          <select v-model="form.districtCode" :disabled="!districts.length" @change="onDistrictChange">
            <option value="">Chọn quận huyện</option>
            <option v-for="district in districts" :key="district.code" :value="district.code">
              {{ district.name }}
            </option>
          </select>
        </label>
        <label>
          Phường/Xã
          <select v-model="form.wardCode" :disabled="!wards.length" @change="onWardChange">
            <option value="">Chọn phường xã</option>
            <option v-for="ward in wards" :key="ward.code" :value="ward.code">{{ ward.name }}</option>
          </select>
        </label>
          <label >Địa chỉ cụ thể <input v-model="form.detail" /></label>
      </div>
      <!-- <p class="loading" v-if="loadingProvince || loadingDistrict || loadingWard">Đang tải dữ liệu địa chỉ...</p> -->
      <div class="actions">
        <button class="ghost" @click="showModal = false">Huỷ</button>
        <button class="primary" @click="submitAddress">Lưu địa chỉ</button>
      </div>
    </div>
  </div> 
</template>

<style scoped>
.list { display:grid; gap:0.6rem; }
.item { border:1px solid var(--auth-border); border-radius:12px; padding:0.75rem; }
.name { margin:0 0 0.2rem; font-weight:600; }
.meta { margin:0; color:var(--auth-text-secondary); font-size:0.84rem; }
.overlay { position:fixed; inset:0; background:rgba(2,7,17,.55); display:grid; place-items:center; z-index:80; padding:1rem; }
.modal { background:var(--account-surface); width:min(680px,100%); border-radius:14px; padding:1rem; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; }
.full { grid-column:1 / -1; }
label { display:grid; gap:0.35rem; font-size:0.82rem; color:var(--auth-text-secondary); }
input,select { min-height:2.45rem; border:1px solid var(--auth-border); border-radius:10px; padding:0 0.65rem; }
.loading { color:var(--account-badge); font-size:0.78rem; margin:0.5rem 0 0; } 
.actions { margin-top:0.8rem; display:flex; justify-content:flex-end; gap:0.5rem; }
.ghost,.primary { border:none; border-radius:10px; min-height:2.45rem; padding:0 0.86rem; cursor:pointer; }
.ghost { background:var(--account-ghost-bg); }
.primary { color:var(--color-white); background:linear-gradient(135deg,var(--auth-brand-start),var(--auth-brand-end)); }
input::placeholder {
  color: #9ca3af;
  opacity: 1;
}
@media (max-width: 900px) { .form-grid { grid-template-columns:1fr; } }
</style>
