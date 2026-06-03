import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi, mediaApi } from '@shared/lib/api/services'
import { buildCategoryPayload, mapCategoryToForm } from './useAdminCategoryForm'
import { applyProductImageFiles, applyProductModelFile, buildProductPayload, cancelUnpersistedProductImages, completePendingProductImages, createEmptyVariant, mapProductToForm, markProductImagesPersisted, moveProductImage, removeProductImage } from './useAdminProductForm'
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
  addVoucher: 'Tạo <em>voucher</em>',
  editVoucher: 'Sửa <em>voucher</em>',
}

const WIDE_MODALS = new Set(['addRole', 'editRole', 'addProd', 'editProd'])

const ORDER_STATUS_TO_API = {
  'Đang giao': 'SHIPPING',
  'Hoàn thành': 'DELIVERED',
}

function buildUserPayload(form) {
  return {
    name: form.name?.trim(),
    email: form.email?.trim(),
    roleId: form.roleId || null,
    status: form.accountStatus || null,
  }
}

export function useAdminModal() {
  const ui = useAdminUiStore()
  const { modal } = storeToRefs(ui)
  const saving = ref(false)

  const form = reactive({
    name: '',
    email: '',
    role: 'Khách hàng',
    roleId: '',
    accountStatus: 'ACTIVE',
    password: '',
    slug: '',
    iconId: 'house',
    visible: true,
    description: '',
    imageUrl: '',
    categoryImageUpload: null,
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
    imageUrls: [],
    imageUploads: [],
    roleDescription: '',
    permissions: ['dashboard'],
    adminRole: 'Manager',
    stockSku: '',
    stockProductId: '',
    stockVariantId: '',
    stockQty: '',
    stockNote: '',
    variants: [],
    voucherCode: '',
    voucherName: '',
    voucherDescription: '',
    voucherIcon: 'badgePercent',
    discountType: 'PERCENT',
    discountValue: '',
    maxDiscount: '',
    minOrder: '',
    startDate: '',
    endDate: '',
    voucherActive: true,
  })

  const titleHtml = computed(() => MODAL_TITLES[modal.value.type] ?? 'Modal')
  const isOpen = computed(() => modal.value.open)
  const isWide = computed(() => WIDE_MODALS.has(modal.value.type))

  function resetForm(payload = null) {
    const type = modal.value.type
    Object.assign(form, {
      name: payload?.name ?? '',
      email: payload?.email ?? '',
      role: payload?.role ?? 'Khách hàng',
      roleId: payload?.roleId ?? payload?.roles?.[0]?.id ?? '',
      accountStatus: payload?.status === 'blocked' || payload?.status === 'banned' ? 'BANNED' : 'ACTIVE',
      password: '',
      orderStatus: payload?.statusLabel ?? 'Chờ xác nhận',
      trackingCode: '',
      note: '',
      roleDescription: payload?.description ?? '',
      imageUrl: payload?.imageUrl ?? '',
      categoryImageUpload: null,
      permissions: payload?.permissionIds ?? ['dashboard'],
      adminRole: payload?.role ?? 'Manager',
      stockSku: payload?.sku ?? '',
      stockProductId: payload?.productId ?? '',
      stockVariantId: payload?.variantId ?? '',
      stockQty: '',
      stockNote: '',
      voucherCode: payload?.code ?? '',
      voucherName: payload?.name ?? '',
      voucherDescription: payload?.description ?? '',
      voucherIcon: payload?.icon ?? 'badgePercent',
      discountType: payload?.discountType ?? 'PERCENT',
      discountValue: payload?.discountValue ?? '',
      maxDiscount: payload?.maxDiscount ?? '',
      minOrder: payload?.minOrder ?? '',
      startDate: toDateTimeLocal(payload?.startDate),
      endDate: toDateTimeLocal(payload?.endDate),
      voucherActive: payload?.active ?? true,
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

  async function onProductImages(files) {
    saving.value = true
    try {
      await applyProductImageFiles(form, files)
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi tải ảnh', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  async function removeImage(url) {
    saving.value = true
    try {
      await removeProductImage(form, url)
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi xóa ảnh', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  function moveImage(fromIndex, toIndex) {
    moveProductImage(form, fromIndex, toIndex)
  }

  function addVariant() {
    form.variants = [...(form.variants ?? []), createEmptyVariant({ sku: form.sku })]
  }

  function removeVariant(index) {
    const variants = [...(form.variants ?? [])]
    if (variants.length <= 1) return
    variants.splice(index, 1)
    form.variants = variants
  }

  async function onCategoryImage(file) {
    saving.value = true
    try {
      const ownerId = modal.value.payload?.id || crypto.randomUUID()
      const upload = await mediaApi.uploadStaged(file, {
        ownerType: 'CATEGORY',
        ownerId,
      })
      form.imageUrl = upload.secureUrl || upload.secure_url || upload.url || ''
      form.categoryImageUpload = upload
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi tải ảnh', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  async function removeCategoryImage() {
    if (form.categoryImageUpload?.mediaId && !form.categoryImageUpload.persisted) {
      await mediaApi.cancelUpload(form.categoryImageUpload.mediaId).catch(() => {})
    }
    form.categoryImageUpload = null
    form.imageUrl = ''
  }

  async function closeModal() {
    if (modal.value.type === 'addProd' || modal.value.type === 'editProd') {
      saving.value = true
      try {
        await cancelUnpersistedProductImages(form)
      } finally {
        saving.value = false
      }
    }
    if (modal.value.type === 'addCat' || modal.value.type === 'editCat') {
      saving.value = true
      try {
        await removeCategoryImage()
      } finally {
        saving.value = false
      }
    }
    ui.closeModal()
  }

  async function save() {
    saving.value = true
    try {
      const type = modal.value.type
      if (type === 'addUser') await adminApi.createAdminUser({
        name: form.name?.trim(),
        email: form.email?.trim(),
        role: form.roleId || form.role,
        password: form.password,
      })
      if (type === 'editUser') {
        if (!modal.value.payload?.id) throw new Error('Thiếu người dùng cần cập nhật.')
        await adminApi.updateAdminUser(modal.value.payload.id, buildUserPayload(form))
      }
      if (type === 'addCat' || type === 'editCat') {
        if (form.categoryImageUpload && !form.categoryImageUpload.completed) {
          form.categoryImageUpload = await mediaApi.completeStagedUpload(form.categoryImageUpload)
        }
        if (type === 'addCat') await adminApi.createCategory(buildCategoryPayload(form))
        if (type === 'editCat' && modal.value.payload?.id) await adminApi.updateCategory(modal.value.payload.id, buildCategoryPayload(form))
        if (form.categoryImageUpload) form.categoryImageUpload.persisted = true
      }
      if (type === 'addProd' || type === 'editProd') {
        await completePendingProductImages(form)
        const payload = buildProductPayload(form)
        if (type === 'addProd') await adminApi.createProduct(payload)
        else if (modal.value.payload?.id) await adminApi.updateProduct(modal.value.payload.id, payload)
        markProductImagesPersisted(form)
      }
      if (type === 'editOrder' && modal.value.payload?.id) {
        const status = ORDER_STATUS_TO_API[form.orderStatus]
        if (!status) throw new Error('Trạng thái này chưa được backend hỗ trợ cập nhật từ admin.')
        await adminApi.updateOrder(modal.value.payload.id, { status, trackingCode: form.trackingCode, note: form.note })
      }
      if (type === 'stockIn') {
        await adminApi.stockInVariant({
          productId: form.stockProductId,
          variantId: form.stockVariantId,
          quantity: Number(form.stockQty) || 0,
          note: form.stockNote,
        })
      }
      if (type === 'addVoucher' || type === 'editVoucher') {
        const payload = {
          code: form.voucherCode,
          name: form.voucherName,
          description: form.voucherDescription,
          icon: form.voucherIcon,
          discountType: form.discountType,
          discountValue: Number(form.discountValue) || 0,
          maxDiscount: Number(form.maxDiscount) || 0,
          minOrder: Number(form.minOrder) || 0,
          startDate: fromDateTimeLocal(form.startDate),
          endDate: fromDateTimeLocal(form.endDate),
          active: form.voucherActive,
        }
        if (type === 'addVoucher') await adminApi.createVoucher(payload)
        else if (modal.value.payload?.id) await adminApi.updateVoucher(modal.value.payload.id, payload)
      }
      if (type === 'addRole' || type === 'editRole' || type === 'addAdmin') {
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
    close: closeModal,
    save,
    onModelFile,
    onProductImages,
    removeImage,
    moveImage,
    addVariant,
    removeVariant,
    onCategoryImage,
    removeCategoryImage,
  }
}

function toDateTimeLocal(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

function fromDateTimeLocal(value) {
  if (!value) return ''
  return value.length === 16 ? `${value}:00` : value
}
