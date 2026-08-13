<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { isImageUrl, money } from '../../../lib/adminPromotionFormatters'

const props = defineProps({
  show: { type: Boolean, required: true },
  picker: { type: Object, required: true },
  categories: { type: Array, required: true },
  products: { type: Array, required: true },
  selectedProducts: { type: Array, required: true },
})

const emit = defineEmits([
  'close',
  'apply',
  'toggle-product'
])
</script>

<template>
  <div v-if="show" class="modal-backdrop picker-layer" @click.self="emit('close')">
    <div class="modal-card modal-xl">
      <header>
        <h2>Chọn <em>sản phẩm</em></h2>
        <AppButton variant="unstyled" type="button" @click="emit('close')"><AppIcon name="x" :size="18" /></AppButton>
      </header>
      <div class="modal-body">
        <div class="mc-filter compact">
          <AppInput
            v-model="picker.query"
            class="mc-input"
            placeholder="Tìm sản phẩm hoặc SKU..."
          />
          <select v-model="picker.category" class="mc-select">
            <option value="">Tất cả danh mục</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <select v-model="picker.stock" class="mc-select">
            <option value="">Tất cả tồn kho</option>
            <option value="instock">Còn hàng</option>
            <option value="outstock">Hết hàng</option>
          </select>
        </div>
        <div class="picker-table">
          <table class="mc-table">
            <thead>
              <tr>
                <th></th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" :class="{ disabled: product.stock <= 0 }">
                <td>
                  <input
                    class="picker-checkbox"
                    :checked="picker.selected[product.id] !== undefined"
                    :disabled="product.stock <= 0"
                    type="checkbox"
                    style="width: 18px; height: 18px; accent-color: var(--gold); cursor: pointer;"
                    @change="emit('toggle-product', product, $event.target.checked)"
                  >
                </td>
                <td class="product-cell">
                  <span class="prod-thumb">
                    <AppImage v-if="isImageUrl(product.image)" :src="product.image" alt="" />
                    <AppIcon v-else :name="product.image || 'box'" />
                  </span>
                  <b>{{ product.name }}</b>
                </td>
                <td><span class="code-badge">{{ product.sku }}</span></td>
                <td>{{ product.category }}</td>
                <td>{{ money(product.price) }}</td>
                <td>{{ product.stock }}</td>
                <td>{{ product.stock > 0 ? 'Đang bán' : 'Hết hàng' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="selected-box">
          <b>Đã chọn {{ selectedProducts.length }} sản phẩm</b>
          <div v-for="product in selectedProducts" :key="product.id">
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ product.name }}</span>
            <input class="mc-input" v-model.number="picker.selected[product.id]" type="number" min="1" style="padding: 4px 8px; min-height: 32px; text-align: center;" />
          </div>
        </div>
      </div>
      <footer>
        <AppButton variant="cancel" type="button" @click="emit('close')">Hủy</AppButton>
        <AppButton variant="primary" type="button" @click="emit('apply')">
          <AppIcon name="check" />Thêm vào combo
        </AppButton>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-xl {
  width: min(1000px, calc(100vw - 24px));
}
</style>
