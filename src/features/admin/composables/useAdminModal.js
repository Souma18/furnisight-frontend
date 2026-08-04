import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi, mediaApi } from '@shared/lib/api/services'
import {
  canEditOrderTrackingCode,
  getNextOrderStatusLabel,
  getOrderStatusApiValue,
} from '@shared/lib/orders/orderStatusMapper'
import { buildCategoryPayload, mapCategoryToForm } from './useAdminCategoryForm'
import {
  applyProductImageFiles,
  applyProductModelFile,
  applyVariantImageFiles,
  buildProductPayload,
  cancelUnpersistedProductImages,
  cancelUnpersistedProductModel,
  completePendingProductImages,
  completePendingProductModel,
  completePendingVariantImages,
  createEmptyVariant,
  mapProductToForm,
  markProductImagesPersisted,
  markProductModelPersisted,
  markVariantImagesPersisted,
  moveProductImage,
  moveVariantImage,
  releaseProductModelPreview,
  removeProductImage,
  removeProductModel,
  validateProductForm,
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
  addRoomType: 'Thêm loại phòng',
  editRoomType: 'Cập nhật loại phòng',
}

const WIDE_MODALS = new Set(['addRole', 'editRole', 'addProd', 'editProd'])

function resolveTrackingCode(order) {
  return order?.trackingCode || order?.tracking_code || order?.shippingTrackingCode || ''
}

function buildUserPayload(form) {
  return {
    name: form.name?.trim(),
    email: form.email?.trim(),
  }
}

function changedText(next, previous) {
  return String(next || '').trim() !== String(previous || '').trim()
}

function buildRolePayload(form) {
  const name = form.name?.trim()
  if (!name) {
    throw new Error('Vui lòng nhập tên vai trò.')
  }
  if (name.length < 3 || name.length > 50) {
    throw new Error('Tên vai trò phải từ 3 đến 50 ký tự.')
  }
  return {
    name,
    description: form.roleDescription?.trim(),
    permissions: normalizePermissions(form.permissions),
  }
}

function assertActionResult(response) {
  if (response?.data && response.data.success === false) {
    throw new Error(response.data.message || 'Thao tác không thành công.')
  }
}

function normalizePermission(value) {
  return String(value ?? '').trim().replace(/-/g, '_').toUpperCase()
}

function normalizePermissions(permissions = []) {
  return [...new Set((permissions || []).map(normalizePermission).filter(Boolean))]
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
    roomTypeId: '',
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
    imageUrls: [],
    imageUploads: [],
    roleDescription: '',
    permissions: [],
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
      orderStatus: getNextOrderStatusLabel(payload),
      trackingCode: resolveTrackingCode(payload),
      note: '',
      roleDescription: payload?.description ?? '',
      imageUrl: payload?.imageUrl ?? '',
      categoryImageUpload: null,
      permissions: normalizePermissions(payload?.permissionIds),
      adminRole: payload?.roleId ?? payload?.roles?.[0]?.id ?? '',
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
      form.permissions = normalizePermissions(payload?.permissionIds)
    }
    if (type === 'addRoomType' || type === 'editRoomType') {
      form.name = payload?.name ?? ''
      form.slug = payload?.slug ?? ''
      form.description = payload?.description ?? ''
      form.visible = payload?.visible ?? true
      form.imageUrl = payload?.imageUrl ?? ''
    }
  }

  function openSync() {
    resetForm(modal.value.payload)
  }

  async function onModelFile(file, variantIndex) {
    try {
      const variant = form.variants[variantIndex]
      if (!variant) return
      await applyProductModelFile(variant, file)
    } catch (e) {
      const variant = form.variants[variantIndex]
      if (variant) variant.modelUploadError = e?.response?.data?.message ?? e.message
      ui.showToast({ icon: 'x', title: 'Lỗi tải model 3D', subtitle: e?.response?.data?.message ?? e.message })
    }
  }

  async function retryModelUpload(variantIndex) {
    const variant = form.variants[variantIndex]
    if (!variant || !variant.modelFile || variant.modelUploading) return
    await onModelFile(variant.modelFile, variantIndex)
  }

  async function removeModel(variantIndex) {
    const variant = form.variants[variantIndex]
    if (!variant || variant.modelUploading) return
    await removeProductModel(variant)
  }

  function onModelPreviewError(message, variantIndex) {
    const variant = form.variants[variantIndex]
    if (variant) variant.modelPreviewError = message || 'Không thể render model GLB.'
  }

  function onModelPreviewReady(variantIndex) {
    const variant = form.variants[variantIndex]
    if (variant) variant.modelPreviewError = ''
  }

  function onModelPreviewLoading(loading, variantIndex) {
    const variant = form.variants[variantIndex]
    if (variant) variant.modelPreviewLoading = loading
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

  async function onVariantImages(files, variantIndex) {
    const variant = form.variants[variantIndex]
    if (!variant) return
    saving.value = true
    try {
      await applyVariantImageFiles(variant, files)
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi tải ảnh', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  async function removeVariantImage(url, variantIndex) {
    const variant = form.variants[variantIndex]
    if (!variant) return
    saving.value = true
    try {
      await removeProductImage(variant, url)
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi xóa ảnh', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  function moveVariantImageAt(fromIndex, toIndex, variantIndex) {
    const variant = form.variants[variantIndex]
    if (!variant) return
    moveVariantImage(variant, fromIndex, toIndex)
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
        for (const v of form.variants || []) await cancelUnpersistedProductImages(v)
        for (const v of form.variants || []) await cancelUnpersistedProductModel(v)
        for (const v of form.variants || []) releaseProductModelPreview(v)
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
      if (type === 'addUser') {
        assertActionResult(await adminApi.createAdminUser({
          name: form.name?.trim(),
          email: form.email?.trim(),
          role: form.roleId || form.role,
          password: form.password,
        }))
      }
      if (type === 'editUser') {
        const user = modal.value.payload
        if (!user?.id) throw new Error('Thiếu người dùng cần cập nhật.')

        if (changedText(form.name, user.name) || changedText(form.email, user.email)) {
          assertActionResult(await adminApi.updateAdminUser(user.id, buildUserPayload(form)))
        }

        const previousRoleId = user.roleId ?? user.roles?.[0]?.id ?? ''
        if (form.roleId && form.roleId !== previousRoleId) {
          assertActionResult(await adminApi.updateAdminUserRole(user.id, form.roleId, 'ASSIGN'))
        }

        const previousStatus = user.status === 'blocked' || user.status === 'banned' ? 'BANNED' : 'ACTIVE'
        if (form.accountStatus && form.accountStatus !== previousStatus) {
          assertActionResult(await adminApi.updateAdminUserStatus(user.id, form.accountStatus))
        }
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
        validateProductForm(form)
        await completePendingProductImages(form)
        for (const v of form.variants || []) await completePendingVariantImages(v)
        for (const v of form.variants || []) await completePendingProductModel(v)
        const payload = buildProductPayload(form)
        if (type === 'addProd') await adminApi.createProduct(payload)
        else if (modal.value.payload?.id) await adminApi.updateProduct(modal.value.payload.id, payload)
        markProductImagesPersisted(form)
        for (const v of form.variants || []) {
          markVariantImagesPersisted(v)
          markProductModelPersisted(v)
          releaseProductModelPreview(v)
        }
      }
      if (type === 'editOrder' && modal.value.payload?.orderCode) {
        const status = getOrderStatusApiValue(form.orderStatus)
        if (!status) throw new Error('Trạng thái này chưa được backend hỗ trợ cập nhật từ admin.')
        const canEditTracking = canEditOrderTrackingCode(modal.value.payload, form.orderStatus)
        if (canEditTracking && !form.trackingCode?.trim()) {
          throw new Error('Vui lòng nhập mã vận đơn khi chuyển sang trạng thái Đang vận chuyển.')
        }
        assertActionResult(await adminApi.updateOrder(modal.value.payload.orderCode, {
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
      if (type === 'addRoomType') {
        await adminApi.createRoomType({
          name: form.name,
          slug: form.slug,
          description: form.description,
          visible: form.visible,
          imageUrl: form.imageUrl
        })
      }
      if (type === 'editRoomType') {
        if (!modal.value.payload?.id) throw new Error('Thiếu loại phòng cần cập nhật.')
        await adminApi.updateRoomType(modal.value.payload.id, {
          name: form.name,
          slug: form.slug,
          description: form.description,
          visible: form.visible,
          imageUrl: form.imageUrl
        })
      }
      if (type === 'addAdmin') {
        if (!form.adminRole) {
          throw new Error('Vui lòng chọn vai trò cho tài khoản quản trị.')
        }
        assertActionResult(await adminApi.createAdminUser({
          name: form.name?.trim(),
          email: form.email?.trim(),
          role: form.adminRole,
          password: form.password,
        }))
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
    onVariantImages,
    removeVariantImage,
    moveVariantImageAt,
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
