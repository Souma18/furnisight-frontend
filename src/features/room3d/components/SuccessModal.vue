<script setup>
import AppModal from '@shared/ui/AppModal.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  orderCode: {
    type: String,
    default: '',
  },
})

defineEmits(['update:show'])
</script>

<template>
  <AppModal :open="show" width="420px" @close="$emit('update:show', false)">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Đặt hàng thành công</h3>
      </div>
      <div class="content">
        <p>Cảm ơn bạn đã mua sắm tại FurniSight.</p>
        <p><strong>Mã đơn:</strong> {{ orderCode || 'Đang tạo...' }}</p>
        <button type="button" class="btn-primary block" @click="$emit('update:show', false)">Tiếp tục khám phá</button>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.modal-content {
  background: var(--app-surface, #fff);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border, #eaeaea);
}
.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 20px;
}
p {
  margin: 0;
}
.btn-primary.block {
  width: 100%;
  padding: 12px;
  background: var(--app-navy, #16233b);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}
</style>
