import { adminApi, mediaApi } from '@shared/lib/api/services'

/** Product form defaults & 3D model upload for admin modals. */

export const PRODUCT_FORM_DEFAULTS = {
  name: '',
  category: 'Phòng ngủ',
  price: '',
  stock: '',
  sku: '',
  status: 'Còn hàng',
  model3dFileName: '',
  model3dSize: 0,
  model3dUrl: '',
  modelFile: null,
  imageUrls: [],
  imageUploads: [],
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
    },
  ],
}

const PRODUCT_STATUS_TO_API = {
  'Còn hàng': 'ACTIVE',
  'Sắp hết': 'ACTIVE',
  'Hết hàng': 'INACTIVE',
  'Ngừng bán': 'INACTIVE',
}

export function mapProductToForm(row) {
  if (!row) return { ...PRODUCT_FORM_DEFAULTS }
  return {
    ...PRODUCT_FORM_DEFAULTS,
    name: row.name ?? '',
    category: row.category ?? 'Phòng ngủ',
    price: row.price ?? '',
    stock: row.stock ?? '',
    sku: row.sku ?? '',
    status: row.statusLabel ?? 'Còn hàng',
    model3dFileName: row.model3dFileName ?? '',
    model3dSize: row.model3dSize ?? 0,
    model3dUrl: row.model3dUrl ?? '',
    imageUrls: Array.isArray(row.imageUrls) ? [...row.imageUrls] : [],
    imageUploads: [],
    variants: normalizeVariants(row.variants, row),
  }
}

export async function applyProductModelFile(form, file) {
  form.modelFile = file
  form.model3dFileName = file.name
  form.model3dSize = file.size
  const res = await adminApi.uploadProductModel(file)
  form.model3dUrl = res.data?.model3dUrl ?? ''
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

export function buildProductPayload(form) {
  const variants = normalizeVariants(form.variants, form).map((variant) => ({
    id: variant.id || '',
    sku: variant.sku || '',
    color: variant.color || '',
    material: variant.material || 'N/A',
    warranty: variant.warranty || '',
    price: Number(variant.price) || 0,
    stock: Number(variant.stock) || 0,
    weight: Number(variant.weight) || 1,
    length: Number(variant.length) || 1,
    width: Number(variant.width) || 1,
    height: Number(variant.height) || 1,
  }))
  const primary = variants[0] ?? {}
  return {
    name: form.name,
    category: form.category,
    price: Number(primary.price ?? form.price) || 0,
    stock: Number(primary.stock ?? form.stock) || 0,
    sku: form.sku,
    status: PRODUCT_STATUS_TO_API[form.status] ?? form.status,
    statusLabel: form.status,
    model3dUrl: form.model3dUrl,
    model3dFileName: form.model3dFileName,
    model3dSize: form.model3dSize,
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
  }
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
    price: fallback.price ?? '',
    stock: fallback.stock ?? '',
  })]
}
