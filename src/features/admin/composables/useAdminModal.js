import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  createAdminUserMock,
  createCategoryMock,
  createProductMock,
  updateCategoryMock,
  updateOrderMock,
  updateProductMock,
} from '../api/adminMockApi'
import { buildCategoryPayload, mapCategoryToForm } from './useAdminCategoryForm'
import { applyProductModelFile, buildProductPayload, mapProductToForm } from './useAdminProductForm'
import { useAdminUiStore } from '../store/adminUiStore'

async function sleepMock() {
  await new Promise((r) => setTimeout(r, 200))
}

const MODAL_TITLES = {
  addUser: 'Thêm <em>người dùng</em>',
  editUser: 'Chỉnh sửa <em>người dùng</em>',
  addCat: 'Thêm <em>danh mục</em>',
  editCat: 'Sửa <em>danh mục</em>',
  addProd: 'Thêm <em>sản phẩm</em>',
  editProd: 'Sửa <em>sản phẩm</em>',
  editOrder: 'Cập nhật <em>đơn hàng</em>',
  addRole: 'Tạo <em>vai trò mới</em>',
  editRole: 'Chỉnh sửa <em>vai trò</em>',
  addAdmin: 'Cấp <em>tài khoản quản trị</em>',
  stockIn: 'Nhập <em>kho</em>',
}

const WIDE_MODALS = new Set(['addRole', 'editRole'])

export function useAdminModal() {
  const ui = useAdminUiStore()
  const { modal } = storeToRefs(ui)
  const saving = ref(false)

  const form = reactive({
    name: '',
    email: '',
    phone: '',
    role: 'Khách hàng',
    password: '',
    slug: '',
    iconId: 'house',
    visible: true,
    description: '',
    category: 'Phòng ngủ',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    status: 'Còn hàng',
    orderStatus: 'Chờ xác nhận',
    trackingCode: '',
    note: '',
    model3dFileName: '',
    model3dSize: 0,
    model3dUrl: '',
    modelFile: null,
    roleDescription: '',
    permissions: ['dashboard'],
    adminRole: 'Manager',
    stockSku: '',
    stockQty: '',
    stockNote: '',
  })

  const titleHtml = computed(() => MODAL_TITLES[modal.value.type] ?? 'Modal')
  const isOpen = computed(() => modal.value.open)
  const isWide = computed(() => WIDE_MODALS.has(modal.value.type))

  function resetForm(payload = null) {
    const type = modal.value.type
    Object.assign(form, {
      name: payload?.name ?? '',
      email: payload?.email ?? '',
      phone: payload?.phone ?? '',
      role: payload?.role ?? 'Khách hàng',
      password: '',
      orderStatus: payload?.statusLabel ?? 'Chờ xác nhận',
      trackingCode: '',
      note: '',
      roleDescription: payload?.description ?? '',
      permissions: payload?.permissionIds ?? ['dashboard'],
      adminRole: payload?.role ?? 'Manager',
      stockSku: payload?.sku ?? '',
      stockQty: '',
      stockNote: '',
    })
    if (type === 'addCat' || type === 'editCat') {
      Object.assign(form, mapCategoryToForm(payload))
    }
    if (type === 'addProd' || type === 'editProd') {
      Object.assign(form, mapProductToForm(payload))
    }
    if (type === 'addRole' || type === 'editRole') {
      form.name = payload?.name ?? ''
      form.roleDescription = payload?.note ?? ''
      form.permissions = payload?.permissionIds ?? ['dashboard', 'product_create', 'order_view']
    }
  }

  function openSync() {
    resetForm(modal.value.payload)
  }

  async function onModelFile(file) {
    await applyProductModelFile(form, file)
  }

  async function save() {
    saving.value = true
    try {
      const type = modal.value.type
      // TODO(BE): switch to adminApi.*
      if (type === 'addUser') await createAdminUserMock({ ...form })
      if (type === 'addCat') await createCategoryMock(buildCategoryPayload(form))
      if (type === 'editCat' && modal.value.payload?.id) await updateCategoryMock(modal.value.payload.id, buildCategoryPayload(form))
      if (type === 'addProd' || type === 'editProd') {
        const payload = buildProductPayload(form)
        if (type === 'addProd') await createProductMock(payload)
        else if (modal.value.payload?.id) await updateProductMock(modal.value.payload.id, payload)
      }
      if (type === 'editOrder' && modal.value.payload?.id) {
        await updateOrderMock(modal.value.payload.id, { statusLabel: form.orderStatus, trackingCode: form.trackingCode, note: form.note })
      }
      if (type === 'addRole' || type === 'editRole' || type === 'addAdmin' || type === 'stockIn') {
        await sleepMock()
      }
      ui.closeModal()
      ui.showToast({ title: 'Đã lưu thành công', subtitle: 'Dữ liệu đã được cập nhật.' })
      ui.requestReload()
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  return {
    modal,
    isOpen,
    isWide,
    titleHtml,
    form,
    saving,
    openSync,
    close: ui.closeModal,
    save,
    onModelFile,
  }
}
