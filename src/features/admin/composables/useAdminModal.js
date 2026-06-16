import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi, mediaApi } from '@shared/lib/api/services'
import { buildCategoryPayload, mapCategoryToForm } from './useAdminCategoryForm'
import {
  applyProductImageFiles,
  applyProductModelFile,
  buildProductPayload,
  cancelUnpersistedProductImages,
  cancelUnpersistedProductModel,
  completePendingProductImages,
  completePendingProductModel,
  createEmptyVariant,
  mapProductToForm,
  markProductImagesPersisted,
  markProductModelPersisted,
  moveProductImage,
  releaseProductModelPreview,
  removeProductImage,
  removeProductModel,
  validateProductVariants,
} from './useAdminProductForm'
import { useAdminUiStore } from '../store/adminUiStore'

const MODAL_TITLES = {
  addUser: 'Thêm <em>người dùng</em>',
  viewUser: 'Thông tin <em>người dùng</em>',
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
  'Đã giao': 'DELIVERED',
  'Đã hoàn tiền': 'REFUNDED',
}

function nextOrderStatus(payload) {
  if (payload?.statusLabel === 'Thanh toán khi nhận hàng') return 'Đang giao'
  if (payload?.statusLabel === 'Đã thanh toán') return 'Đang giao'
  if (payload?.statusLabel === 'Đang giao') return 'Đã giao'
  if (payload?.statusLabel === 'Chờ hoàn tiền') return 'Đã hoàn tiền'
  if (isCodOrder(payload) && ['Chờ xác nhận', 'Chờ thanh toán'].includes(payload?.statusLabel)) return 'Đang giao'
  return ''
}

function isCodOrder(order) {
  return String(order?.paymentMethod || order?.paymentDetail?.paymentMethod || '').toLowerCase() === 'cod'
}

function resolveTrackingCode(order) {
  return order?.trackingCode || order?.tracking_code || order?.shippingTrackingCode || ''
}

function canEditTrackingCode(order, nextStatusLabel) {
  const currentStatus = String(order?.status || '').toUpperCase()
  return currentStatus !== 'DELIVERED' && nextStatusLabel === 'Đang giao'
}

function buildUserPayload(form) {
  return {
    name: form.name?.trim(),
    email: form.email?.trim(),
    roleId: form.roleId || null,
    status: form.accountStatus || null,
  }
}

function buildRolePayload(form) {
  return {
    name: form.name?.trim(),
    description: form.roleDescription?.trim(),
    permissions: form.permissions ?? [],
  }
}

function assertActionResult(response) {
  if (response?.data && response.data.success === false) {
    throw new Error(response.data.message || 'Thao tác không thành công.')
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
    modelUrl: '',
    modelMediaId: '',
    supports3d: false,
    modelFileName: '',
    modelFileSize: 0,
    modelFile: null,
    modelUpload: null,
    modelUploadController: null,
    modelPreviewUrl: '',
    modelPreviewObjectUrl: '',
    modelPreviewError: '',
    modelPreviewLoading: false,
    modelUploadProgress: 0,
    modelUploading: false,
    modelUploadError: '',
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
    variantErrors: {},
    activeVariantIndex: 0,
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
      orderStatus: nextOrderStatus(payload),
      trackingCode: resolveTrackingCode(payload),
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
      activeVariantIndex: 0,
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
    try {
      await applyProductModelFile(form, file)
    } catch (e) {
      form.modelUploadError = e?.response?.data?.message ?? e.message
      ui.showToast({ icon: 'x', title: 'Lỗi tải model 3D', subtitle: e?.response?.data?.message ?? e.message })
    }
  }

  async function retryModelUpload() {
    if (!form.modelFile || form.modelUploading) return
    await onModelFile(form.modelFile)
  }

  async function removeModel() {
    if (form.modelUploading) return
    await removeProductModel(form)
  }

  function onModelPreviewError(message) {
    form.modelPreviewError = message || 'Không thể render model GLB.'
  }

  function onModelPreviewReady() {
    form.modelPreviewError = ''
  }

  function onModelPreviewLoading(loading) {
    form.modelPreviewLoading = loading
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
    form.activeVariantIndex = form.variants.length - 1
  }

  function removeVariant(index) {
    const variants = [...(form.variants ?? [])]
    if (variants.length <= 1) return
    variants.splice(index, 1)
    form.variants = variants
    form.activeVariantIndex = Math.max(0, Math.min(form.activeVariantIndex, variants.length - 1))
  }

  function selectVariant(index) {
    form.activeVariantIndex = form.activeVariantIndex === index ? -1 : index
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
        await cancelUnpersistedProductModel(form)
        releaseProductModelPreview(form)
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
        validateProductVariants(form)
        await completePendingProductImages(form)
        await completePendingProductModel(form)
        const payload = buildProductPayload(form)
        if (type === 'addProd') await adminApi.createProduct(payload)
        else if (modal.value.payload?.id) await adminApi.updateProduct(modal.value.payload.id, payload)
        markProductImagesPersisted(form)
        markProductModelPersisted(form)
        releaseProductModelPreview(form)
      }
      if (type === 'editOrder' && modal.value.payload?.id) {
        const status = ORDER_STATUS_TO_API[form.orderStatus]
        if (!status) throw new Error('Trạng thái này chưa được backend hỗ trợ cập nhật từ admin.')
        const canEditTracking = canEditTrackingCode(modal.value.payload, form.orderStatus)
        assertActionResult(await adminApi.updateOrder(modal.value.payload.id, {
          status,
          trackingCode: canEditTracking ? form.trackingCode : null,
          note: form.note,
        }))
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
      if (type === 'addRole') {
        assertActionResult(await adminApi.createRole(buildRolePayload(form)))
      }
      if (type === 'editRole') {
        if (!modal.value.payload?.id) throw new Error('Thiếu vai trò cần cập nhật.')
        assertActionResult(await adminApi.updateRole(modal.value.payload.id, buildRolePayload(form)))
      }
      if (type === 'addAdmin') {
        await adminApi.createAdminUser({
          name: form.name?.trim(),
          email: form.email?.trim(),
          role: form.adminRole,
          password: form.password,
        })
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
    retryModelUpload,
    removeModel,
    onModelPreviewError,
    onModelPreviewReady,
    onModelPreviewLoading,
    onProductImages,
    removeImage,
    moveImage,
    addVariant,
    removeVariant,
    selectVariant,
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
