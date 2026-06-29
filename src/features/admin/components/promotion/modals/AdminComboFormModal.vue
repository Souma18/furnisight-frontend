<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { isImageUrl, money } from '../../../lib/adminPromotionFormatters'

const props = defineProps({
  show: { type: Boolean, required: true },
  isEditing: { type: [Boolean, Object], default: false },
  form: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  comboOriginalAmount: { type: Number, default: 0 },
  comboFinalAmount: { type: Number, default: 0 },
  comboSavedAmount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'close',
  'submit',
  'image-change',
  'remove-image',
  'open-product-picker',
  'remove-item'
])
</script>

<template>
  <form
    v-if="show"
    class="modal-backdrop"
    @click.self="emit('close')"
    @submit.prevent="emit('submit')"
  >
    <div class="modal-card modal-lg">
      <header>
        <h2>{{ isEditing ? 'Sửa' : 'Tạo' }} <em>combo</em></h2>
        <AppButton variant="unstyled" type="button" @click="emit('close')"><AppIcon name="x" :size="18" /></AppButton>
      </header>
      <div class="modal-body">
        <div class="mc-section-title"><AppIcon name="gift" />Thông tin combo</div>
        <div class="form-row">
          <label>Tên combo *
            <AppInput v-model="form.name" required placeholder="Combo phòng ngủ FurniSight"/>
          </label>
          <label>Loại ưu đãi
            <select v-model="form.discountType">
              <option value="PERCENTAGE">Giảm theo %</option>
              <option value="FIXED_AMOUNT">Giảm số tiền</option>
              <option value="FIXED_COMBO_PRICE">Giá combo cố định</option>
            </select>
          </label>
        </div>
        <div class="form-row">
          <label>Giá trị ưu đãi
            <AppInput v-model.number="form.discountValue" type="number" min="0"/>
          </label>
          <label>Trạng thái
            <select v-model="form.active">
              <option :value="true">Đang bật</option>
              <option :value="false">Bản nháp</option>
            </select>
          </label>
        </div>
        <div class="form-row">
          <label>Bắt đầu<input v-model="form.startDate" type="datetime-local"></label>
          <label>Kết thúc<input v-model="form.endDate" type="datetime-local"></label>
        </div>
        <label>Mô tả<textarea v-model="form.description" rows="2" /></label>
        <label>Ảnh combo
          <span class="combo-image-upload">
            <input type="file" accept="image/*" @change="e => emit('image-change', e)">
            <span><AppIcon name="image" :size="24" />{{ saving ? 'Đang tải ảnh...' : 'Chọn ảnh đại diện combo' }}</span>
          </span>
        </label>
        <div v-if="form.imageUrl" class="combo-image-preview">
          <AppImage :src="form.imageUrl" alt="Ảnh combo" />
          <AppButton variant="unstyled" type="button" title="Xóa ảnh" @click="emit('remove-image')">
            <AppIcon name="x" :size="14" />
          </AppButton>
        </div>
        
        <div class="mc-section-title"><AppIcon name="box" />Sản phẩm trong combo</div>
        <AppButton variant="unstyled" type="button" class="add-product" @click="emit('open-product-picker')">
          <AppIcon name="plus" />Chọn sản phẩm
        </AppButton>
        <div v-if="!form.items.length" class="empty-box">Chưa có sản phẩm nào trong combo.</div>
        
        <div v-for="item in form.items" :key="item.id" class="combo-item-card">
          <div class="prod-thumb">
            <AppImage v-if="isImageUrl(item.image)" :src="item.image" alt="" />
            <AppIcon v-else :name="item.image || 'box'" />
          </div>
          <div>
            <b>{{ item.name }}</b>
            <small>SKU: {{ item.sku }} · {{ money(item.price) }} · {{ item.category }}</small>
          </div>
          <label><span>SL</span><AppInput v-model.number="item.quantity" type="number" min="1"/></label>
          <AppButton variant="unstyled" type="button" @click="emit('remove-item', item.id)">
            <AppIcon name="trash" />
          </AppButton>
        </div>
        
        <div class="combo-summary">
          <div><span>Giá gốc</span><b>{{ money(comboOriginalAmount) }}</b></div>
          <div><span>Giá combo</span><b>{{ money(comboFinalAmount) }}</b></div>
          <div class="save"><span>Khách tiết kiệm</span><b>{{ money(comboSavedAmount) }}</b></div>
        </div>
      </div>
      <footer>
        <AppButton variant="cancel" type="button" @click="emit('close')">Hủy</AppButton>
        <AppButton variant="primary" type="submit" :disabled="saving">
          <AppIcon name="save" />Lưu combo
        </AppButton>
      </footer>
    </div>
  </form>
</template>
