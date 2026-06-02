<script setup>
import { onMounted, ref, watch } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import AdminModal from './AdminModal.vue'
import AdminIconPicker from '../forms/AdminIconPicker.vue'
import AdminModel3dUpload from '../forms/AdminModel3dUpload.vue'
import AdminProductImagesUpload from '../forms/AdminProductImagesUpload.vue'
import AdminPermissionPicker from '../forms/AdminPermissionPicker.vue'
import { useAdminModal } from '../../composables/useAdminModal'

const iconOptions = ref([])
const { modal, isOpen, isWide, titleHtml, form, saving, openSync, close, save, onModelFile, onProductImages, removeImage } = useAdminModal()

onMounted(async () => {
  const res = await adminApi.fetchCategoryIconOptions()
  iconOptions.value = res.data?.items ?? res.data ?? []
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
        <div class="mform-group"><label class="mfl">Email *</label><input v-model="form.email" class="mfi" type="email" /></div>
      </div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Số điện thoại</label><input v-model="form.phone" class="mfi" /></div>
        <div class="mform-group"><label class="mfl">Vai trò</label><select v-model="form.role" class="mfi"><option>Khách hàng</option><option>Admin</option></select></div>
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
    </template>

    <template v-else-if="modal.type === 'addProd' || modal.type === 'editProd'">
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Tên sản phẩm *</label><input v-model="form.name" class="mfi" /></div>
        <div class="mform-group"><label class="mfl">Danh mục</label><select v-model="form.category" class="mfi"><option>Phòng ngủ</option><option>Phòng khách</option><option>Văn phòng</option><option>Đèn trang trí</option></select></div>
      </div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Giá bán (đ)</label><input v-model="form.price" class="mfi" type="number" /></div>
        <div class="mform-group"><label class="mfl">Tồn kho</label><input v-model="form.stock" class="mfi" type="number" /></div>
      </div>
      <div class="mform-group"><label class="mfl">SKU</label><input v-model="form.sku" class="mfi" /></div>
      <AdminProductImagesUpload :images="form.imageUrls" :uploading="saving" @select="onProductImages" @remove="removeImage" />
      <AdminModel3dUpload :file-name="form.model3dFileName" :file-size="form.model3dSize" @select="onModelFile" />
      <div class="mform-group"><label class="mfl">Trạng thái</label><select v-model="form.status" class="mfi"><option>Còn hàng</option><option>Hết hàng</option><option>Ngừng bán</option></select></div>
    </template>

    <template v-else-if="modal.type === 'editOrder'">
      <div class="mform-group"><label class="mfl">Trạng thái đơn hàng</label><select v-model="form.orderStatus" class="mfi"><option>Chờ xác nhận</option><option>Đã xác nhận</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option></select></div>
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
            <option>Manager</option>
            <option>Staff</option>
          </select>
        </div>
        <div class="mform-group"><label class="mfl">Mật khẩu tạm</label><input v-model="form.password" class="mfi" type="password" placeholder="••••••••" /></div>
      </div>
    </template>

    <template v-else-if="modal.type === 'stockIn'">
      <div class="mform-group"><label class="mfl">SKU / Sản phẩm</label><input v-model="form.stockSku" class="mfi" placeholder="LX-BED-001" /></div>
      <div class="mform-row">
        <div class="mform-group"><label class="mfl">Số lượng nhập *</label><input v-model="form.stockQty" class="mfi" type="number" min="1" /></div>
        <div class="mform-group"><label class="mfl">Kho</label><select class="mfi"><option>Kho HCM</option><option>Kho HN</option></select></div>
      </div>
      <div class="mform-group"><label class="mfl">Ghi chú</label><textarea v-model="form.stockNote" class="mfi" rows="3" placeholder="Phiếu nhập, lô hàng..." /></div>
    </template>
  </AdminModal>
</template>
