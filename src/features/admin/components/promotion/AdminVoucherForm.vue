<script setup>
import AppInput from '@shared/ui/AppInput.vue'
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  form: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'submit'])
</script>

<template>
  <form v-if="show" class="modal-backdrop" @click.self="$emit('close')" @submit.prevent="$emit('submit')">
    <div class="modal-card">
      <header>
        <h2>{{ isEditing ? 'Sửa' : 'Tạo' }} <em>voucher</em></h2>
        <AppButton variant="unstyled" type="button" @click="$emit('close')"><AppIcon name="x" :size="18" /></AppButton>
      </header>
      <div class="modal-body">
        <div class="form-row">
          <label>Mã voucher *<AppInput v-model="form.code" required placeholder="SALE10"/></label>
          <label>Tên *<AppInput v-model="form.name" required placeholder="Giảm 10%"/></label>
        </div>
        <label>
          Loại voucher
          <select v-model="form.voucherType">
            <option value="PUBLIC">PUBLIC</option>
            <option value="PERSONAL">PERSONAL</option>
            <option value="MARKETING">MARKETING</option>
          </select>
        </label>
        <div class="form-row">
          <label>
            Loại giảm
            <select v-model="form.discountType">
              <option value="PERCENT">Phần trăm</option>
              <option value="FIXED">Số tiền cố định</option>
              <option value="SHIPPING_CAP">Giảm vận chuyển</option>
            </select>
          </label>
          <label>Giá trị<AppInput v-model.number="form.discountValue" type="number" min="0"/></label>
        </div>
        <div class="form-row">
          <label>Giảm tối đa<AppInput v-model="form.maxDiscount" type="number" min="0"/></label>
          <label>Đơn tối thiểu<AppInput v-model="form.minOrder" type="number" min="0"/></label>
        </div>
        <div class="form-row">
          <label>Bắt đầu<input v-model="form.startDate" type="datetime-local"></label>
          <label>Kết thúc<input v-model="form.endDate" type="datetime-local"></label>
        </div>
        <label>Mô tả<textarea v-model="form.description" rows="3" /></label>
        <label class="check-line" style="justify-content: flex-start; white-space: nowrap; width: fit-content; gap: 8px;">
          <input v-model="form.active" type="checkbox">Đang bật
        </label>
      </div>
      <footer>
        <AppButton variant="cancel" @click="$emit('close')">Hủy</AppButton>
        <AppButton variant="primary" type="submit" :loading="saving">
          {{ isEditing ? 'Lưu thay đổi' : 'Tạo voucher' }}
        </AppButton>
      </footer>
    </div>
  </form>
</template>


