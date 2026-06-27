<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import { computed, reactive, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { formatVietnamAddress } from '@shared/lib/formatters'
import { getProvinces, getWardsByProvince } from '@shared/lib/publicApis/vietnamAddressApi'

const props = defineProps({
  addresses: {
    type: Array,
    default: () => [],
  },
  selectedAddressId: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['select-address', 'save-address'])

const showModal = ref(false)
const editingId = ref('')
const provinces = ref([])
const wards = ref([])
const loadingProvince = ref(false)
const loadingWard = ref(false)
const addressApiUnavailable = ref(false)
const formError = ref('')

const form = reactive(createEmptyForm())

const selectedAddress = computed(
  () => props.addresses.find((item) => String(item.id) === String(props.selectedAddressId)) ?? props.addresses[0] ?? null,
)

function createEmptyForm() {
  return {
    fullName: '',
    phone: '',
    detail: '',
    provinceCode: '',
    wardCode: '',
    provinceName: '',
    wardName: '',
    type: 'home',
    isDefault: false,
  }
}

function resetForm() {
  Object.assign(form, createEmptyForm())
  editingId.value = ''
  formError.value = ''
  wards.value = []
}

async function ensureProvinces() {
  if (provinces.value.length) return
  loadingProvince.value = true
  try {
    provinces.value = await getProvinces()
    addressApiUnavailable.value = false
  } catch {
    addressApiUnavailable.value = true
  } finally {
    loadingProvince.value = false
  }
}

async function openCreateModal() {
  resetForm()
  showModal.value = true
  await ensureProvinces()
}

async function openEditModal(address) {
  resetForm()
  editingId.value = address.id
  Object.assign(form, {
    fullName: address.fullName || '',
    phone: address.phone || '',
    detail: address.detail || '',
    provinceCode: address.provinceCode || '',
    wardCode: address.wardCode || '',
    provinceName: address.provinceName || '',
    wardName: address.wardName || '',
    type: address.type || 'home',
    isDefault: Boolean(address.isDefault),
  })
  showModal.value = true
  await ensureProvinces()
  if (form.provinceCode) {
    await loadWards(form.provinceCode)
  }
}

async function onProvinceChange() {
  const selected = provinces.value.find((item) => String(item.code) === String(form.provinceCode))
  form.provinceName = selected?.name ?? ''
  form.wardCode = ''
  form.wardName = ''
  wards.value = []
  if (form.provinceCode) await loadWards(form.provinceCode)
}

async function loadWards(provinceCode) {
  loadingWard.value = true
  try {
    wards.value = await getWardsByProvince(provinceCode)
  } catch {
    wards.value = []
    formError.value = 'Không tải được danh sách phường/xã. Vui lòng chọn lại tỉnh/thành.'
  } finally {
    loadingWard.value = false
  }
}

function onWardChange() {
  const selected = wards.value.find((item) => String(item.code) === String(form.wardCode))
  form.wardName = selected?.name ?? ''
}

function submitAddress() {
  if (!form.fullName || !form.phone || !form.detail || !form.provinceCode || !form.wardCode) {
    formError.value = 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.'
    return
  }

  formError.value = ''
  emit('save-address', {
    ...(editingId.value ? { id: editingId.value } : {}),
    ...form,
  })
  showModal.value = false
}
</script>

<template>
  <section class="checkout-card">
    <div class="checkout-card-head">
      <h2 class="checkout-card-title">
        <AppIcon name="mapPin" :size="16" />
        Địa chỉ giao hàng
      </h2>
      <AppButton type="button" class="checkout-card-change" @click="openCreateModal">Thêm địa chỉ</AppButton>
    </div>

    <div v-if="!addresses.length" class="co-empty">
      Chưa có địa chỉ giao hàng. Bạn có thể thêm địa chỉ ngay tại bước thanh toán.
    </div>

    <div v-else class="co-address-list">
      <label
        v-for="address in addresses"
        :key="address.id"
        class="co-address-option"
        :class="{ 'co-address-option--active': String(address.id) === String(selectedAddress?.id) }"
      >
        <input
          type="radio"
          name="checkout-address"
          :checked="String(address.id) === String(selectedAddress?.id)"
          @change="$emit('select-address', address.id)"
        />
        <div class="co-addr-avatar">{{ address.fullName?.slice(0, 2)?.toUpperCase() ?? 'NA' }}</div>
        <div class="co-address-main">
          <div class="co-addr-name">
            {{ address.fullName }} ({{ address.phone }})
            <span v-if="address.isDefault" class="co-addr-default">Mặc định</span>
          </div>
          <p class="co-addr-street">{{ formatVietnamAddress(address) }}</p>
        </div>
        <AppButton type="button" class="co-address-edit" @click.prevent="openEditModal(address)">Sửa</AppButton>
      </label>
    </div>

    <div v-if="showModal" class="co-address-modal" @click.self="showModal = false">
      <div class="co-address-dialog">
        <div class="co-address-dialog-head">
          <h3>{{ editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới' }}</h3>
          <AppButton type="button" class="co-address-close" @click="showModal = false">×</AppButton>
        </div>

        <div class="co-address-form">
          <label>
            Họ tên
            <AppInput v-model.trim="form.fullName" placeholder="Nguyễn Văn A" />
          </label>
          <label>
            Số điện thoại
            <AppInput v-model.trim="form.phone" placeholder="0123456789" />
          </label>
          <label>
            Tỉnh/Thành
            <select
              v-model="form.provinceCode"
              :disabled="loadingProvince || addressApiUnavailable"
              @change="onProvinceChange"
            >
              <option value="">{{ loadingProvince ? 'Đang tải...' : 'Chọn tỉnh thành' }}</option>
              <option v-for="province in provinces" :key="province.code" :value="province.code">
                {{ province.name }}
              </option>
            </select>
          </label>
          <label>
            Phường/Xã
            <select v-model="form.wardCode" :disabled="loadingWard || !wards.length" @change="onWardChange">
              <option value="">{{ loadingWard ? 'Đang tải...' : 'Chọn phường xã' }}</option>
              <option v-for="ward in wards" :key="ward.code" :value="ward.code">{{ ward.name }}</option>
            </select>
          </label>
          <label class="co-address-form-full">
            Địa chỉ cụ thể
            <AppInput v-model.trim="form.detail" placeholder="Số nhà, tên đường..." />
          </label>
          <label>
            Loại địa chỉ
            <select v-model="form.type">
              <option value="home">Nhà riêng</option>
              <option value="office">Văn phòng</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label class="co-address-default-check">
            <input v-model="form.isDefault" type="checkbox" />
            <span>Đặt làm địa chỉ mặc định</span>
          </label>
        </div>

        <p v-if="addressApiUnavailable" class="co-address-warning">
          Không tải được dữ liệu tỉnh/thành. Vui lòng thử lại.
        </p>
        <p v-if="formError" class="co-address-warning">{{ formError }}</p>

        <div class="co-address-dialog-actions">
          <AppButton type="button" class="co-address-secondary" @click="showModal = false">Huỷ</AppButton>
          <AppButton type="button" class="co-address-primary" @click="submitAddress">
            {{ editingId ? 'Cập nhật' : 'Lưu địa chỉ' }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
