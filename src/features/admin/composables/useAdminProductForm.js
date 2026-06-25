import { mediaApi } from '@shared/lib/api/services'

/** Product form defaults & 3D model upload for admin modals. */

export const PRODUCT_MODEL_MAX_SIZE = 100 * 1024 * 1024

export const PRODUCT_FORM_DEFAULTS = {
  name: '',
  category: 'Phòng ngủ',
  sku: '',
  status: 'Còn hàng',
  imageUrls: [],
  imageUploads: [],
  variantErrors: {},
  variants: [
    {
      id: '',
      sku: '',
      color: '',
      material: 'N/A',
      warranty: '',
      price: '',
      stock: '',
      weight: 1,
      length: 1,
      width: 1,
      height: 1,
      lowStockThreshold: 5,
    },
  ],
}

const PRODUCT_STATUS_TO_API = {
  'Còn hàng': 'ACTIVE',
  'Sắp hết': 'ACTIVE',
  'Hết hàng': 'INACTIVE',
  'Ngừng bán': 'INACTIVE',
}

const PRODUCT_STATUS_TO_LABEL = {
  ACTIVE: 'Còn hàng',
  INACTIVE: 'Ngừng bán',
  OUT_OF_STOCK: 'Hết hàng',
}

export function mapProductToForm(row) {
  if (!row) return { ...PRODUCT_FORM_DEFAULTS }
  if (!row) return { ...PRODUCT_FORM_DEFAULTS }
  return {
    ...PRODUCT_FORM_DEFAULTS,
    name: row.name ?? '',
    category: row.category ?? 'Phòng ngủ',
    sku: row.sku ?? '',
    status: row.statusLabel ?? PRODUCT_STATUS_TO_LABEL[String(row.status || '').toUpperCase()] ?? 'Còn hàng',
    imageUrls: Array.isArray(row.imageUrls) ? [...row.imageUrls] : [],
    imageUploads: [],
    variantErrors: {},
    variants: normalizeVariants(row.variants, row),
  }
}

export async function applyProductModelFile(variant, file) {
  validateProductModelFile(file)
  await cancelUnpersistedProductModel(variant)
  releaseProductModelPreview(variant)

  const previewUrl = URL.createObjectURL(file)
  variant.modelFile = file
  variant.modelFileName = file.name
  variant.modelFileSize = file.size
  variant.modelPreviewUrl = previewUrl
  variant.modelPreviewObjectUrl = previewUrl
  variant.modelPreviewError = ''
  variant.modelPreviewLoading = true
  variant.modelUpload = null
  variant.modelUploadController = new AbortController()
  variant.modelUploadProgress = 0
  variant.modelUploadError = ''
  variant.modelUploading = true

  try {
    variant.modelUpload = await mediaApi.uploadStaged(file, {
      ownerType: 'PRODUCT_MODEL',
      ownerId: crypto.randomUUID(),
      contentType: file.type || 'model/gltf-binary',
      signal: variant.modelUploadController.signal,
      onUploadProgress: (event) => {
        if (!event.total) return
        variant.modelUploadProgress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      },
    })
    variant.modelUploadProgress = 100
  } catch (error) {
    if (error?.code === 'ERR_CANCELED') return
    variant.modelUploadProgress = 0
    variant.modelUploadError = error?.response?.data?.message || error.message || 'Không thể tải model 3D.'
    throw error
  } finally {
    variant.modelUploading = false
    variant.modelUploadController = null
  }
}

export function validateProductModelFile(file) {
  if (!file) throw new Error('Vui lòng chọn file GLB.')
  if (!file.name?.toLowerCase().endsWith('.glb')) {
    throw new Error('Chỉ hỗ trợ model định dạng GLB.')
  }
  if (file.size <= 0) throw new Error('File GLB đang trống.')
  if (file.size > PRODUCT_MODEL_MAX_SIZE) {
    throw new Error('File GLB không được vượt quá 100 MB.')
  }
  const allowedTypes = new Set(['', 'model/gltf-binary', 'application/octet-stream'])
  if (!allowedTypes.has(file.type)) {
    throw new Error('File đã chọn không có định dạng GLB hợp lệ.')
  }
}

export async function completePendingProductModel(variant) {
  if (variant.modelUploading) throw new Error('Model 3D vẫn đang được tải lên.')
  if (variant.modelFile && variant.modelPreviewLoading) {
    throw new Error('Model 3D vẫn đang được kiểm tra preview.')
  }
  if (variant.modelFile && !variant.modelUpload) {
    throw new Error(variant.modelUploadError || 'Model 3D chưa được tải lên thành công.')
  }
  if (variant.modelFile && variant.modelPreviewError) {
    throw new Error('File GLB không thể render preview. Vui lòng chọn model hợp lệ khác.')
  }
  if (!variant.modelUpload) return

  if (!variant.modelUpload.completed) {
    variant.modelUpload = await mediaApi.completeStagedUpload(variant.modelUpload)
  }
  const url = mediaUploadUrl(variant.modelUpload)
  if (!url) throw new Error('Media service không trả về URL cho model 3D.')
  variant.modelUrl = url
  variant.modelMediaId = variant.modelUpload.mediaId || variant.modelUpload.id || ''
  variant.supports3d = true
}

export async function removeProductModel(variant) {
  await cancelUnpersistedProductModel(variant)
  releaseProductModelPreview(variant)
  variant.modelUrl = ''
  variant.modelMediaId = ''
  variant.supports3d = false
  variant.modelPreviewUrl = ''
  variant.modelPreviewError = ''
  variant.modelPreviewLoading = false
  variant.modelFileName = ''
  variant.modelFileSize = 0
  variant.modelFile = null
  variant.modelUpload = null
  variant.modelUploadController = null
  variant.modelUploadProgress = 0
  variant.modelUploadError = ''
  variant.modelUploading = false
}

export async function cancelUnpersistedProductModel(variant) {
  variant.modelUploadController?.abort()
  variant.modelUploadController = null
  if (variant.modelUpload?.mediaId && !variant.modelUpload.persisted) {
    await mediaApi.cancelUpload(variant.modelUpload.mediaId).catch(() => {})
  }
  variant.modelUpload = null
}

export function releaseProductModelPreview(variant) {
  if (variant.modelPreviewObjectUrl) {
    URL.revokeObjectURL(variant.modelPreviewObjectUrl)
  }
  variant.modelPreviewObjectUrl = ''
  if (variant.modelPreviewUrl?.startsWith('blob:')) {
    variant.modelPreviewUrl = ''
  }
}

export function markProductModelPersisted(variant) {
  if (variant.modelUpload) {
    variant.modelUpload = { ...variant.modelUpload, persisted: true }
  }
}

export async function applyProductImageFiles(form, files) {
  const ownerId = crypto.randomUUID()
  const uploads = await Promise.all(files.map((file) => mediaApi.uploadStaged(file, {
    ownerType: 'PRODUCT',
    ownerId,
  })))
  const nextUrls = uploads
    .map((item) => item.secureUrl || item.secure_url || item.url)
    .filter(Boolean)
  form.imageUrls = [...new Set([...(form.imageUrls ?? []), ...nextUrls])]
  form.imageUploads = [...(form.imageUploads ?? []), ...uploads]
}

export async function removeProductImage(form, url) {
  const upload = (form.imageUploads ?? []).find((item) => imageUploadUrl(item) === url)
  if (upload?.mediaId && !upload.persisted) {
    await mediaApi.cancelUpload(upload.mediaId)
  }
  form.imageUrls = (form.imageUrls ?? []).filter((item) => item !== url)
  form.imageUploads = (form.imageUploads ?? []).filter((item) => imageUploadUrl(item) !== url)
}

export function moveProductImage(form, fromIndex, toIndex) {
  const images = [...(form.imageUrls ?? [])]
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= images.length || toIndex >= images.length) return
  const [item] = images.splice(fromIndex, 1)
  images.splice(toIndex, 0, item)
  form.imageUrls = images
}

export async function completePendingProductImages(form) {
  const uploads = form.imageUploads ?? []
  for (let index = 0; index < uploads.length; index += 1) {
    if (!uploads[index].completed) {
      uploads[index] = await mediaApi.completeStagedUpload(uploads[index])
    }
  }
  form.imageUploads = uploads
}

export async function cancelUnpersistedProductImages(form) {
  const uploads = [...(form.imageUploads ?? [])]
  for (const upload of uploads) {
    if (upload?.mediaId && !upload.persisted) {
      await mediaApi.cancelUpload(upload.mediaId).catch(() => {})
    }
  }
  form.imageUploads = []
}

export function markProductImagesPersisted(form) {
  form.imageUploads = (form.imageUploads ?? []).map((upload) => ({
    ...upload,
    persisted: true,
  }))
}

function imageUploadUrl(upload) {
  return upload?.secureUrl || upload?.secure_url || upload?.url || ''
}

function mediaUploadUrl(upload) {
  return upload?.secureUrl
    || upload?.secure_url
    || upload?.url
    || upload?.asset?.secureUrl
    || upload?.asset?.url
    || ''
}

function fileNameFromUrl(url) {
  if (!url) return ''
  try {
    return decodeURIComponent(new URL(url, window.location.origin).pathname.split('/').pop() || '')
  } catch {
    return ''
  }
}

export function buildProductPayload(form) {
  validateProductVariants(form)
  const productSku = String(form.sku || '').trim().toUpperCase()
  const variants = normalizeVariants(form.variants, form).map((variant) => {
    let variantSku = variant.sku.trim().toUpperCase()
    if (productSku && variantSku && !variantSku.startsWith(`${productSku}-`)) {
      variantSku = `${productSku}-${variantSku}`
    }
    return {
      id: variant.id || '',
      sku: variantSku,
      color: variant.color || '',
      material: variant.material || 'N/A',
      warranty: variant.warranty || '',
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
      weight: Number(variant.weight) || 1,
      length: Number(variant.length) || 1,
      width: Number(variant.width) || 1,
      height: Number(variant.height) || 1,
      lowStockThreshold: Number(variant.lowStockThreshold) || 5,
      modelUrl: variant.modelUrl || '',
      modelMediaId: variant.modelMediaId || '',
      supports3d: Boolean(variant.modelUrl && variant.supports3d),
    }
  })
  return {
    name: form.name,
    category: form.category,
    sku: form.sku,
    status: PRODUCT_STATUS_TO_API[form.status] ?? form.status,
    statusLabel: form.status,
    imageUrls: form.imageUrls ?? [],
    variants,
  }
}

export function createEmptyVariant(seed = {}) {
  return {
    id: seed.id ?? '',
    sku: seed.sku ?? '',
    color: seed.color ?? '',
    material: seed.material ?? 'N/A',
    warranty: seed.warranty ?? '',
    price: seed.price ?? '',
    stock: seed.stock ?? '',
    weight: seed.weight ?? 1,
    length: seed.length ?? 1,
    width: seed.width ?? 1,
    height: seed.height ?? 1,
    lowStockThreshold: seed.lowStockThreshold ?? 5,
    modelUrl: seed.modelUrl ?? seed.model_url ?? '',
    modelMediaId: seed.modelMediaId ?? seed.model_media_id ?? '',
    supports3d: seed.supports3d ?? false,
    modelFileName: seed.modelFileName ?? fileNameFromUrl(seed.modelUrl ?? seed.model_url),
    modelFileSize: seed.modelFileSize ?? 0,
    modelFile: null,
    modelUpload: null,
    modelUploadController: null,
    modelPreviewUrl: seed.modelUrl ?? seed.model_url ?? '',
    modelPreviewObjectUrl: '',
    modelPreviewError: '',
    modelPreviewLoading: false,
    modelUploadProgress: 0,
    modelUploading: false,
    modelUploadError: '',
  }
}

export function validateProductVariants(form) {
  const variants = normalizeVariants(form.variants, form)
  const seen = new Set()
  const errors = {}
  const productSku = String(form.sku || '').trim().toUpperCase()
  variants.forEach((variant, index) => {
    let variantSku = String(variant.sku || '').trim().toUpperCase()
    if (productSku && variantSku && !variantSku.startsWith(`${productSku}-`)) {
      variantSku = `${productSku}-${variantSku}`
    }
    variant.sku = variantSku
    if (!variantSku) {
      errors[index] = 'SKU variant là bắt buộc.'
    } else if (seen.has(variantSku)) {
      errors[index] = `SKU ${variantSku} bị trùng trong sản phẩm.`
    }
    seen.add(variantSku)
    const threshold = Number(variant.lowStockThreshold)
    if (!Number.isInteger(threshold) || threshold < 1 || threshold > 9999) {
      errors[index] = errors[index] || 'Ngưỡng cảnh báo phải từ 1 đến 9999.'
    }
  })
  form.variants = variants
  form.variantErrors = errors
  const firstErrorIndex = Number(Object.keys(errors)[0])
  if (Number.isInteger(firstErrorIndex)) form.activeVariantIndex = firstErrorIndex
  if (Object.keys(errors).length) throw new Error(errors[firstErrorIndex])
}

export function normalizeVariants(variants, fallback = {}) {
  if (Array.isArray(variants) && variants.length) {
    return variants.map((variant) => createEmptyVariant({
      ...variant,
      stock: variant.stock ?? variant.stockQuantity ?? '',
      price: variant.price ?? '',
    }))
  }
  return [createEmptyVariant({
    sku: fallback.sku ?? '',
  })]
}
