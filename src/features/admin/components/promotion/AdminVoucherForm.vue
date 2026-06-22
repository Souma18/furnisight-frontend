<script setup>
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
        <button type="button" @click="$emit('close')"><AppIcon name="x" /></button>
      </header>
      <div class="modal-body">
        <div class="form-row">
          <label>Mã voucher *<input v-model="form.code" required placeholder="SALE10"></label>
          <label>Tên *<input v-model="form.name" required placeholder="Giảm 10%"></label>
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
          <label>Giá trị<input v-model.number="form.discountValue" type="number" min="0"></label>
        </div>
        <div class="form-row">
          <label>Giảm tối đa<input v-model="form.maxDiscount" type="number" min="0"></label>
          <label>Đơn tối thiểu<input v-model="form.minOrder" type="number" min="0"></label>
        </div>
        <div class="form-row">
          <label>Bắt đầu<input v-model="form.startDate" type="datetime-local"></label>
          <label>Kết thúc<input v-model="form.endDate" type="datetime-local"></label>
        </div>
        <label>Mô tả<textarea v-model="form.description" rows="3" /></label>
        <label class="check-line"><input v-model="form.active" type="checkbox">Đang bật</label>
      </div>
      <footer>
        <button type="button" class="mc-cancel" @click="$emit('close')">Hủy</button>
        <button class="mc-primary" :disabled="saving">
          <AppIcon name="check" />Lưu thay đổi
        </button>
      </footer>
    </div>
  </form>
</template>

<style scoped>
/* Copied and adapted styles for the form */
.modal-backdrop { position: fixed; inset: 0; background: rgba(20,30,45,.5); z-index: 80; display: flex; align-items: center; justify-content: center; padding: 18px; }
.modal-card { width: min(560px, calc(100vw - 24px)); max-height: calc(100vh - 36px); overflow: auto; background: #fff; border-radius: 12px; box-shadow: 0 14px 45px rgba(0,0,0,.18); }
.modal-card header, .modal-card footer { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0e8dc; gap: 10px; }
.modal-card footer { border-top: 1px solid #f0e8dc; border-bottom: 0; justify-content: flex-end; }
.modal-card h2 { font-size: 18px; color: #1a2332; margin: 0; }
.modal-card em { color: #c9953a; font-style: normal; }
.modal-card header button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #e0d8cc; background: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.modal-card label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-weight: 800; color: #5a4a3a; text-transform: uppercase; letter-spacing: .04em; margin: 0; }
.check-line { flex-direction: row !important; align-items: center; text-transform: none !important; font-size: 13px !important; letter-spacing: 0 !important; }
.check-line input { width: auto; accent-color: #c9953a; margin: 0; }
.section-title { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 800; color: #1a2332; text-transform: uppercase; letter-spacing: .04em; margin-top: 4px; }
.checkbox-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; }
.mc-primary, .mc-cancel { border-radius: 8px; border: 1px solid #c9953a; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 34px; margin: 0; }
.mc-primary { background: #c9953a; color: #fff; }
.mc-primary:disabled { opacity: .55; cursor: not-allowed; }
.mc-cancel { background: #fff; color: #c9953a; }
.modal-card input, .modal-card select, .modal-card textarea { background: #f5f0e8; border: 1px solid #e0d8cc; border-radius: 8px; padding: 8px 11px; font-size: 12px; color: #1a2332; width: 100%; box-sizing: border-box; }
@media (max-width: 640px) {
  .form-row, .checkbox-grid { grid-template-columns: 1fr; }
}
</style>
