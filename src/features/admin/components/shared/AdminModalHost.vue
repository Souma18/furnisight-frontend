<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminModal from './AdminModal.vue'
import AdminIconPicker from '../forms/AdminIconPicker.vue'
import AdminModel3dUpload from '../forms/AdminModel3dUpload.vue'
import AdminProductImagesUpload from '../forms/AdminProductImagesUpload.vue'
import AdminPermissionPicker from '../forms/AdminPermissionPicker.vue'
import { useAdminModal } from '../../composables/useAdminModal'

const iconOptions = ref([])
const roleOptions = ref([])
const categoryOptions = ref([])
const productOptions = ref([])
const { modal, isOpen, isWide, titleHtml, form, saving, openSync, close, save, onModelFile, onProductImages, removeImage, moveImage, addVariant, removeVariant, selectVariant, onCategoryImage, removeCategoryImage } = useAdminModal()

const stockVariantOptions = computed(() => {
  const product = productOptions.value.find((item) => item.id === form.stockProductId)
  return product?.variants ?? []
})

function onCategoryImageChange(event) {
  const file = event.target.files?.[0]
  if (file) onCategoryImage(file)
  event.target.value = ''
}

function onStockProductChange() {
  const firstVariant = stockVariantOptions.value[0]
  form.stockVariantId = firstVariant?.id ?? ''
  form.stockSku = firstVariant?.sku || firstVariant?.id || ''
}

function variantSummary(variant, index) {
  const parts = [variant.color, variant.material].filter(Boolean)
  return parts.length ? parts.join(' / ') : `Variant ${index + 1}`
}

function variantDisplayCode(variant) {
  return variant.sku || 'Chưa có mã SKU'
}

function formatVariantPrice(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

onMounted(async () => {
  try {
    const iconRes = await adminApi.fetchCategoryIconOptions()
    iconOptions.value = iconRes.data?.items ?? iconRes.data ?? []
  } catch {
    iconOptions.value = []
  }

  try {
    const roleRes = await adminApi.fetchRoles()
    roleOptions.value = roleRes.data?.roles ?? roleRes.data?.items ?? roleRes.data ?? []
  } catch {
    roleOptions.value = []
  }

  try {
    const categoryRes = await adminApi.fetchCategories()
    categoryOptions.value = categoryRes.data?.items ?? categoryRes.data?.content ?? categoryRes.data ?? []
  } catch {
    categoryOptions.value = []
  }

  try {
    const productRes = await adminApi.fetchProducts({ size: 500 })
    productOptions.value = productRes.data?.items ?? productRes.data?.content ?? productRes.data ?? []
  } catch {
    productOptions.value = []
  }
})

watch(() => modal.value.open, (open) => {
  if (open) openSync()
})
</script>

<template>
  <AdminModal :open="isOpen" :wide="isWide" :title-html="titleHtml" :saving="saving" @close="close" @save="save">
    <template v-if="modal.type === 'addUser' || modal.type === 'editUser'">
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Họ tên *</label><input v-model="form.name" class="mfi" /></div>
        <div class="mform-group"><label class="mfl">Email *</label><input v-model="form.email" class="mfi" type="email" :disabled="modal.type === 'editUser'" /></div>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mfl">Vai trò</label>
          <select v-model="form.roleId" class="mfi">
            <option value="">Giữ nguyên vai trò</option>
            <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>
        <div class="mform-group">
          <label class="mfl">Trạng thái</label>
          <select v-model="form.accountStatus" class="mfi">
            <option value="ACTIVE">Hoạt động</option>
            <option value="BANNED">Khóa tài khoản</option>
          </select>
        </div>
      </div>
      <div v-if="modal.type === 'addUser'" class="mform-group"><label class="mfl">Mật khẩu tạm</label><input v-model="form.password" class="mfi" type="password" /></div>
    </template>

    <template v-else-if="modal.type === 'addCat' || modal.type === 'editCat'">
      <div class="mform-group">
        <label class="mfl">Tên danh mục *</label>
        <input v-model="form.name" class="mfi" placeholder="Vd: Phòng ngủ" />
      </div>
      <div class="mform-group">
        <label class="mfl">Slug</label>
        <input v-model="form.slug" class="mfi" placeholder="phong-ngu" />
      </div>
      <div class="mform-row mform-row--cat">
        <AdminIconPicker v-model="form.iconId" variant="inline" :options="iconOptions" />
        <div class="mform-group">
          <label class="mfl">Trạng thái</label>
          <select v-model="form.visible" class="mfi">
            <option :value="true">Hiển thị</option>
            <option :value="false">Ẩn</option>
          </select>
        </div>
      </div>
      <div class="mform-group">
        <label class="mfl">Mô tả</label>
        <textarea v-model="form.description" class="mfi" rows="3" placeholder="Mô tả ngắn..." />
      </div>
      <div class="mform-group">
        <label class="mfl">Ảnh danh mục</label>
        <label class="model-upload-box" :class="{ 'has-file': form.imageUrl }">
          <input type="file" accept="image/*" hidden @change="onCategoryImageChange" />
          <AppIcon name="image" :size="28" style="margin-bottom:8px;color:var(--gold)" />
          <div style="font-size:12px;color:var(--text3)">
            {{ saving ? 'Đang tải ảnh lên Cloudinary...' : 'Chọn ảnh đại diện danh mục' }}
          </div>
        </label>
        <div v-if="form.imageUrl" class="product-image-grid product-image-grid--single">
          <div class="product-image-thumb">
            <img :src="form.imageUrl" alt="" />
            <button type="button" class="product-image-remove" @click="removeCategoryImage">
              <AppIcon name="x" :size="12" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="modal.type === 'addProd' || modal.type === 'editProd'">
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Tên sản phẩm *</label><input v-model="form.name" class="mfi" /></div>
        <div class="mform-group">
          <label class="mfl">Danh mục</label>
          <select v-model="form.category" class="mfi">
            <option v-for="category in categoryOptions" :key="category.id" :value="category.name">{{ category.name }}</option>
            <option v-if="!categoryOptions.length" value="">Chưa có danh mục</option>
          </select>
        </div>
      </div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Giá bán (đ)</label><input v-model="form.price" class="mfi" type="number" /></div>
        <div class="mform-group"><label class="mfl">Tồn kho</label><input v-model="form.stock" class="mfi" type="number" /></div>
      </div>
      <div class="mform-group"><label class="mfl">SKU</label><input v-model="form.sku" class="mfi" /></div>
      <div class="mform-group">
        <div class="variant-head">
          <label class="mfl">Biến thể sản phẩm</label>
          <button type="button" class="variant-add-btn" @click="addVariant"><AppIcon name="plus" :size="13" />Thêm variant</button>
        </div>
        <div class="variant-list">
          <div v-for="(variant, index) in form.variants" :key="variant.id || index" class="variant-row">
            <button type="button" class="variant-summary" :class="{ active: form.activeVariantIndex === index }" @click="selectVariant(index)">
              <span class="variant-summary-main">
                <strong>{{ variantSummary(variant, index) }}</strong>
                <small>{{ variantDisplayCode(variant) }}</small>
              </span>
              <span class="variant-summary-meta">
                <b>{{ formatVariantPrice(variant.price) }}</b>
                <small>Tồn {{ Number(variant.stock || 0) }}</small>
              </span>
              <AppIcon :name="form.activeVariantIndex === index ? 'chevronDown' : 'chevronRight'" :size="14" />
            </button>
            <div v-if="form.activeVariantIndex === index" class="variant-detail">
              <div class="mform-row">
                <div class="mform-group"><label class="mfl">Màu</label><input v-model="variant.color" class="mfi" placeholder="Nâu" /></div>
                <div class="mform-group"><label class="mfl">Chất liệu</label><input v-model="variant.material" class="mfi" placeholder="Gỗ / Da / Vải" /></div>
                <div class="mform-group"><label class="mfl">Bảo hành</label><input v-model="variant.warranty" class="mfi" placeholder="12 tháng" /></div>
              </div>
              <div class="mform-row">
                <div class="mform-group"><label class="mfl">Giá</label><input v-model="variant.price" class="mfi" type="number" min="0" /></div>
                <div class="mform-group"><label class="mfl">Tồn</label><input v-model="variant.stock" class="mfi" type="number" min="0" /></div>
                <div class="mform-group"><label class="mfl">SKU variant</label><input v-model="variant.sku" class="mfi" placeholder="Nhập mã SKU nếu có" /></div>
              </div>
              <div class="mform-row">
                <div class="mform-group"><label class="mfl">Nặng</label><input v-model="variant.weight" class="mfi" type="number" min="1" /></div>
                <div class="mform-group"><label class="mfl">Dài</label><input v-model="variant.length" class="mfi" type="number" min="1" /></div>
                <div class="mform-group"><label class="mfl">Rộng</label><input v-model="variant.width" class="mfi" type="number" min="1" /></div>
                <div class="mform-group"><label class="mfl">Cao</label><input v-model="variant.height" class="mfi" type="number" min="1" /></div>
              </div>
              <button type="button" class="variant-remove-btn" :disabled="form.variants.length <= 1" @click="removeVariant(index)">
                <AppIcon name="trash2" :size="13" />Xóa variant
              </button>
            </div>
          </div>
        </div>
      </div>
      <AdminProductImagesUpload :images="form.imageUrls" :uploading="saving" @select="onProductImages" @remove="removeImage" @move="moveImage" />
      <AdminModel3dUpload :file-name="form.model3dFileName" :file-size="form.model3dSize" @select="onModelFile" />
      <div class="mform-group"><label class="mfl">Trạng thái</label><select v-model="form.status" class="mfi"><option>Còn hàng</option><option>Hết hàng</option><option>Ngừng bán</option></select></div>
    </template>

    <template v-else-if="modal.type === 'editOrder'">
      <div class="mform-group"><label class="mfl">Trạng thái đơn hàng</label><select v-model="form.orderStatus" class="mfi"><option>Đang giao</option><option>Hoàn thành</option></select></div>
      <div class="mform-group"><label class="mfl">Mã vận đơn</label><input v-model="form.trackingCode" class="mfi" /></div>
      <div class="mform-group"><label class="mfl">Ghi chú nội bộ</label><textarea v-model="form.note" class="mfi" rows="3" /></div>
    </template>

    <template v-else-if="modal.type === 'addRole' || modal.type === 'editRole'">
      <div class="mform-group"><label class="mfl">Tên vai trò *</label><input v-model="form.name" class="mfi" placeholder="Vd: Editor" /></div>
      <div class="mform-group"><label class="mfl">Mô tả</label><input v-model="form.roleDescription" class="mfi" placeholder="Vai trò dành cho..." /></div>
      <AdminPermissionPicker v-model="form.permissions" />
    </template>

    <template v-else-if="modal.type === 'addAdmin'">
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Họ tên *</label><input v-model="form.name" class="mfi" placeholder="Nguyễn Văn X" /></div>
        <div class="mform-group"><label class="mfl">Email *</label><input v-model="form.email" class="mfi" type="email" placeholder="email@luxnest.vn" /></div>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mfl">Vai trò</label>
          <select v-model="form.adminRole" class="mfi">
            <option value="">Chọn vai trò</option>
            <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>
        <div class="mform-group"><label class="mfl">Mật khẩu tạm</label><input v-model="form.password" class="mfi" type="password" placeholder="••••••••" /></div>
      </div>
    </template>

    <template v-else-if="modal.type === 'stockIn'">
      <div class="mform-group">
        <label class="mfl">Sản phẩm</label>
        <select v-model="form.stockProductId" class="mfi" @change="onStockProductChange">
          <option value="">Chọn sản phẩm</option>
          <option v-for="product in productOptions" :key="product.id" :value="product.id">{{ product.name }}</option>
        </select>
      </div>
      <div class="mform-group">
        <label class="mfl">Variant / mã</label>
        <select v-model="form.stockVariantId" class="mfi">
          <option value="">Chọn variant</option>
          <option v-for="(variant, index) in stockVariantOptions" :key="variant.id" :value="variant.id">
            {{ variant.label || variant.sku || variantSummary(variant, index) }} · tồn {{ variant.stock }}
          </option>
        </select>
      </div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Số lượng nhập *</label><input v-model="form.stockQty" class="mfi" type="number" min="1" /></div>
        <div class="mform-group"><label class="mfl">Kho</label><select class="mfi"><option>Kho HCM</option><option>Kho HN</option></select></div>
      </div>
      <div class="mform-group"><label class="mfl">Ghi chú</label><textarea v-model="form.stockNote" class="mfi" rows="3" placeholder="Phiếu nhập, lô hàng..." /></div>
    </template>

    <template v-else-if="modal.type === 'addVoucher' || modal.type === 'editVoucher'">
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Mã voucher *</label><input v-model="form.voucherCode" class="mfi" placeholder="SALE10" /></div>
        <div class="mform-group"><label class="mfl">Tên</label><input v-model="form.voucherName" class="mfi" placeholder="Giảm 10%" /></div>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mfl">Loại giảm</label>
          <select v-model="form.discountType" class="mfi">
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Số tiền cố định</option>
            <option value="SHIPPING_CAP">Giảm vận chuyển</option>
          </select>
        </div>
        <div class="mform-group"><label class="mfl">Giá trị</label><input v-model="form.discountValue" class="mfi" type="number" min="0" /></div>
      </div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Giảm tối đa</label><input v-model="form.maxDiscount" class="mfi" type="number" min="0" /></div>
        <div class="mform-group"><label class="mfl">Đơn tối thiểu</label><input v-model="form.minOrder" class="mfi" type="number" min="0" /></div>
      </div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Bắt đầu</label><input v-model="form.startDate" class="mfi" type="datetime-local" /></div>
        <div class="mform-group"><label class="mfl">Kết thúc</label><input v-model="form.endDate" class="mfi" type="datetime-local" /></div>
      </div>
      <div class="mform-group"><label class="mfl">Mô tả</label><textarea v-model="form.voucherDescription" class="mfi" rows="3" /></div>
      <label class="toggle-line"><input v-model="form.voucherActive" type="checkbox" />Đang bật</label>
    </template>
  </AdminModal>
</template>
