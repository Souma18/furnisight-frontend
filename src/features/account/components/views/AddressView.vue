<script setup>
import { reactive, ref } from 'vue'
import AccountSectionCard from '../AccountSectionCard.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAddressForm } from '../../composables/useAddressForm'

const props = defineProps({
  addresses: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['notify'])

  const {
    showModal,
    provinces,
    districts,
    wards,
    fallbackMode,
    form,
    openModal,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    submitAddress,
    setAsDefault,
    deleteAddress,
    getTypeLabel,
  } = useAddressForm(props, emit)
  </script>
  
  <template>
    <AccountSectionCard class="address-card" title="Địa chỉ giao hàng">
      <template #head>
        <button class="primary" type="button" @click="openModal">Thêm địa chỉ mới</button>
      </template>
  
      <div v-if="!addresses.length" class="empty">
        Chưa có địa chỉ giao hàng. Thêm địa chỉ để thanh toán nhanh hơn.
      </div>
  
      <div v-else class="list">
        <article
          v-for="address in addresses"
          :key="address.id"
          class="item"
          :class="{ 'item--default': address.isDefault }"
        >
          <div class="item-head">
            <div class="item-tags">
              <span v-if="address.isDefault" class="badge badge-default">
                <AppIcon name="mapPin" :size="12" />
                Mặc định
              </span>
              <span class="badge badge-type">{{ getTypeLabel(address.type) }}</span>
            </div>
  
            <div class="item-actions">
              <button
                v-if="!address.isDefault"
                type="button"
                class="set-default-btn"
                @click="setAsDefault(address.id)"
              >
                <AppIcon name="mapPin" :size="13" />
                Đặt làm mặc định
              </button>
              <button
                type="button"
                class="delete-btn"
                @click="deleteAddress(address.id)"
                title="Xóa địa chỉ"
              >
                Xóa
              </button>
            </div>
          </div>

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
        <label>Họ tên <input v-model.trim="form.fullName" placeholder="Nguyễn Văn A" /></label>
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
        <label class="detail-field">
          Địa chỉ cụ thể
          <input v-model.trim="form.detail" placeholder="Số nhà, tên đường..." />
        </label>
        <label>
          Loại địa chỉ
          <select v-model="form.type">
            <option value="home">Nhà riêng</option>
            <option value="office">Văn phòng</option>
          </select>
        </label>
        <label class="default-check">
          <input v-model="form.isDefault" type="checkbox" />
          <span>Đặt làm địa chỉ mặc định</span>
        </label>
      </div>
      <div class="actions">
        <button type="button" class="ghost" @click="showModal = false">Huỷ</button>
        <button type="button" class="primary" @click="submitAddress">Lưu địa chỉ</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-card {
  font-size: 1rem;
  line-height: 1.45;
}

.address-card :deep(.card-head h3) {
  font-size: 1rem;
  line-height: 1.35;
}

.list {
  display: grid;
  gap: 0.6rem;
}
.empty {
  color: var(--auth-text-secondary);
  font-size: 0.84rem;
  line-height: 1.5;
}
.item {
  border: 1px solid var(--auth-border);
  border-radius: 12px;
  padding: 0.75rem;
  background: var(--account-surface);
  font-size: 1rem;
  line-height: 1.45;
}
.item--default {
  border-color: rgba(201, 146, 42, 0.45);
  background:
    radial-gradient(circle at top, rgba(201, 146, 42, 0.08), transparent 62%),
    var(--account-surface);
}
.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.45rem;
}
.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.35rem;
  padding: 0 0.55rem;
  border-radius: 7px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  gap: 0.25rem;
}
.badge-default {
  border: 1px solid rgba(201, 146, 42, 0.42);
  background: #c9922a;
  color: #fff;
  box-shadow: 0 5px 14px rgba(201, 146, 42, 0.18);
}
.badge-type {
  background: #f5efe6;
  color: #8b6a21;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.set-default-btn {
  border: 1px solid rgba(201, 146, 42, 0.35);
  border-radius: 999px;
  padding: 0.28rem 0.62rem;
  background: #fff;
  color: #c58d2f;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.set-default-btn:hover {
  background: #faf6f0;
}
.delete-btn {
  border: 1px solid rgba(220, 53, 69, 0.35);
  border-radius: 999px;
  padding: 0.28rem 0.62rem;
  background: #fff;
  color: #dc3545;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.delete-btn:hover {
  background: #fdf2f2;
}
.name {
  margin: 0 0 0.2rem;
  font-weight: 600;
  font-size: 0.94rem;
  line-height: 1.35;
}
.meta {
  margin: 0;
  color: var(--auth-text-secondary);
  font-size: 0.84rem;
  line-height: 1.45;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 7, 17, 0.55);
  display: grid;
  place-items: center;
  z-index: 80;
  padding: 1rem;
}
.modal {
  background: var(--account-surface);
  width: min(680px, 100%);
  border-radius: 14px;
  padding: 1rem;
  font-size: 1rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
.form-grid label {
  font-size: 0.84rem;
  line-height: 1.4;
}
.form-grid input,
.form-grid select,
.actions button,
.primary,
.ghost {
  font: inherit;
  font-size: 0.86rem;
}
.detail-field {
  min-width: 0;
}
.detail-field input {
  width: 100%;
  min-width: 0;
}
label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: var(--auth-text-secondary);
}
.default-check {
  display: inline-flex;
  align-items: center;
  align-self: end;
  gap: 0.45rem;
  min-height: 2.45rem;
  cursor: pointer;
  color: var(--auth-text-primary);
}
.default-check input {
  width: 1rem;
  height: 1rem;
  margin: 0;
}
input,
select {
  min-height: 2.45rem;
  border: 1px solid var(--auth-border);
  border-radius: 10px;
  padding: 0 0.65rem;
}
.actions {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.ghost,
.primary {
  border: none;
  border-radius: 10px;
  min-height: 2.45rem;
  padding: 0 0.86rem;
  cursor: pointer;
}
.ghost {
  background: var(--account-ghost-bg);
}
.primary {
  color: var(--color-white);
  background: linear-gradient(135deg, var(--auth-brand-start), var(--auth-brand-end));
}
input::placeholder {
  color: #9ca3af;
  opacity: 1;
}
@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .item-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
