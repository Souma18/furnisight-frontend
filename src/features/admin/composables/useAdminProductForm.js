import { mediaApi } from '@shared/lib/api/services'

/** Product form defaults & 3D model upload for admin modals. */

export const PRODUCT_MODEL_MAX_SIZE = 100 * 1024 * 1024

export const PRODUCT_FORM_DEFAULTS = {
  name: '',
  category: 'Phòng ngủ',
  sku: '',
  status: 'Còn hàng',
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
  const modelUrl = row.modelUrl ?? row.model3dUrl ?? ''
  return {
    ...PRODUCT_FORM_DEFAULTS,
    name: row.name ?? '',
    category: row.category ?? 'Phòng ngủ',
    sku: row.sku ?? '',
    status: row.statusLabel ?? PRODUCT_STATUS_TO_LABEL[String(row.status || '').toUpperCase()] ?? 'Còn hàng',
    modelUrl,
    modelMediaId: row.modelMediaId ?? '',
    supports3d: Boolean(row.supports3d || modelUrl),
    modelFileName: row.modelFileName ?? row.model3dFileName ?? fileNameFromUrl(modelUrl),
    modelFileSize: row.modelFileSize ?? row.model3dSize ?? 0,
    modelFile: null,
    modelUpload: null,
    modelUploadController: null,
    modelPreviewUrl: modelUrl,
    modelPreviewObjectUrl: '',
    modelPreviewError: '',
    modelPreviewLoading: false,
    modelUploadProgress: 0,
    modelUploading: false,
    modelUploadError: '',
    imageUrls: Array.isArray(row.imageUrls) ? [...row.imageUrls] : [],
    imageUploads: [],
    variantErrors: {},
    variants: normalizeVariants(row.variants, row),
  }
}

export async function applyProductModelFile(form, file) {
  validateProductModelFile(file)
  await cancelUnpersistedProductModel(form)
  releaseProductModelPreview(form)

  const previewUrl = URL.createObjectURL(file)
  form.modelFile = file
  form.modelFileName = file.name
  form.modelFileSize = file.size
  form.modelPreviewUrl = previewUrl
  form.modelPreviewObjectUrl = previewUrl
  form.modelPreviewError = ''
  form.modelPreviewLoading = true
  form.modelUpload = null
  form.modelUploadController = new AbortController()
  form.modelUploadProgress = 0
  form.modelUploadError = ''
  form.modelUploading = true

  try {
    form.modelUpload = await mediaApi.uploadStaged(file, {
      ownerType: 'PRODUCT_MODEL',
      ownerId: crypto.randomUUID(),
      contentType: file.type || 'model/gltf-binary',
      signal: form.modelUploadController.signal,
      onUploadProgress: (event) => {
        if (!event.total) return
        form.modelUploadProgress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      },
    })
    form.modelUploadProgress = 100
  } catch (error) {
    if (error?.code === 'ERR_CANCELED') return
    form.modelUploadProgress = 0
    form.modelUploadError = error?.response?.data?.message || error.message || 'Không thể tải model 3D.'
    throw error
  } finally {
    form.modelUploading = false
    form.modelUploadController = null
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

export async function completePendingProductModel(form) {
  if (form.modelUploading) throw new Error('Model 3D vẫn đang được tải lên.')
  if (form.modelFile && form.modelPreviewLoading) {
    throw new Error('Model 3D vẫn đang được kiểm tra preview.')
  }
  if (form.modelFile && !form.modelUpload) {
    throw new Error(form.modelUploadError || 'Model 3D chưa được tải lên thành công.')
  }
  if (form.modelFile && form.modelPreviewError) {
    throw new Error('File GLB không thể render preview. Vui lòng chọn model hợp lệ khác.')
  }
  if (!form.modelUpload) return

  if (!form.modelUpload.completed) {
    form.modelUpload = await mediaApi.completeStagedUpload(form.modelUpload)
  }
  const url = mediaUploadUrl(form.modelUpload)
  if (!url) throw new Error('Media service không trả về URL cho model 3D.')
  form.modelUrl = url
  form.modelMediaId = form.modelUpload.mediaId || form.modelUpload.id || ''
  form.supports3d = true
}

export async function removeProductModel(form) {
  await cancelUnpersistedProductModel(form)
  releaseProductModelPreview(form)
  form.modelUrl = ''
  form.modelMediaId = ''
  form.supports3d = false
  form.modelPreviewUrl = ''
  form.modelPreviewError = ''
  form.modelPreviewLoading = false
  form.modelFileName = ''
  form.modelFileSize = 0
  form.modelFile = null
  form.modelUpload = null
  form.modelUploadController = null
  form.modelUploadProgress = 0
  form.modelUploadError = ''
  form.modelUploading = false
}

export async function cancelUnpersistedProductModel(form) {
  form.modelUploadController?.abort()
  form.modelUploadController = null
  if (form.modelUpload?.mediaId && !form.modelUpload.persisted) {
    await mediaApi.cancelUpload(form.modelUpload.mediaId).catch(() => {})
  }
  form.modelUpload = null
}

export function releaseProductModelPreview(form) {
  if (form.modelPreviewObjectUrl) {
    URL.revokeObjectURL(form.modelPreviewObjectUrl)
  }
  form.modelPreviewObjectUrl = ''
  if (form.modelPreviewUrl?.startsWith('blob:')) {
    form.modelPreviewUrl = ''
  }
}

export function markProductModelPersisted(form) {
  if (form.modelUpload) {
    form.modelUpload = { ...form.modelUpload, persisted: true }
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
    }
  })
  return {
    name: form.name,
    category: form.category,
    sku: form.sku,
    status: PRODUCT_STATUS_TO_API[form.status] ?? form.status,
    statusLabel: form.status,
    modelUrl: form.modelUrl || '',
    modelMediaId: form.modelMediaId || '',
    supports3d: Boolean(form.modelUrl && form.supports3d),
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
