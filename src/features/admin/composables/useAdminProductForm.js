import { uploadProductModelMock } from '../api/adminMockApi'

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
  }
}

export async function applyProductModelFile(form, file) {
  form.modelFile = file
  form.model3dFileName = file.name
  form.model3dSize = file.size
  // TODO(BE): adminApi.uploadProductModel(formData)
  const res = await uploadProductModelMock(file)
  form.model3dUrl = res.data?.model3dUrl ?? ''
}

export function buildProductPayload(form) {
  return {
    name: form.name,
    category: form.category,
    price: Number(form.price) || 0,
    stock: Number(form.stock) || 0,
    sku: form.sku,
    statusLabel: form.status,
    model3dUrl: form.model3dUrl,
    model3dFileName: form.model3dFileName,
    model3dSize: form.model3dSize,
  }
}
