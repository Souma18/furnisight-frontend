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
    <div class="modal-card modal-lg">
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
                    :checked="picker.selected[product.id] !== undefined"
                    :disabled="product.stock <= 0"
                    type="checkbox"
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
            <span>{{ product.name }}</span>
            <AppInput v-model.number="picker.selected[product.id]" type="number" min="1"/>
          </div>
        </div>
      </div>
      <footer>
        <AppButton variant="unstyled" type="button" class="mc-cancel" @click="emit('close')">Hủy</AppButton>
        <AppButton variant="unstyled" type="button" class="mc-primary" @click="emit('apply')">
          <AppIcon name="check" />Thêm vào combo
        </AppButton>
      </footer>
    </div>
  </div>
</template>
