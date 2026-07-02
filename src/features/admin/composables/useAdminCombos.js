import { computed, reactive, ref } from 'vue'
import { adminApi, mediaApi } from '@shared/lib/api/services'
import {
  createComboFormState,
  createProductPickerState,
} from '../config/adminPromotionState'
import {
  filterLocal,
  getListPayload,
  toDatetimeLocal,
} from '../lib/adminPromotionFormatters'

export function useAdminCombos({
  filters,
  modal,
  editing,
  saving,
  notify,
}) {
  const combos = ref([])
  const products = ref([])
  const comboDeleteTarget = ref(null)
  const deletingCombo = ref(false)
  const comboForm = reactive(createComboFormState())
  const picker = reactive(createProductPickerState())

  const filteredCombos = computed(() => filterLocal(combos.value, filters.combo, ['name', 'status']))

  const filteredProducts = computed(() => {
    const query = picker.query.trim().toLowerCase()
    return products.value.filter((product) => {
      if (query && !`${product.name} ${product.sku}`.toLowerCase().includes(query)) return false
      if (picker.category && product.category !== picker.category) return false
      if (picker.status && product.status !== picker.status) return false
      if (picker.stock === 'instock' && product.stock <= 0) return false
      if (picker.stock === 'outstock' && product.stock > 0) return false
      return true
    })
  })

  const productCategories = computed(() => [...new Set(products.value.map((product) => product.category).filter(Boolean))])

  const selectedPickerProducts = computed(() => Object.entries(picker.selected).map(([id, quantity]) => {
    const product = products.value.find((item) => item.id === id)
    return product ? { ...product, quantity } : null
  }).filter(Boolean))

  const comboOriginalAmount = computed(() => comboForm.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0))

  const comboFinalAmount = computed(() => {
    const original = comboOriginalAmount.value
    const value = Number(comboForm.discountValue || 0)
    if (comboForm.discountType === 'PERCENTAGE') return Math.max(0, original * (1 - value / 100))
    if (comboForm.discountType === 'FIXED_AMOUNT') return Math.max(0, original - value)
    return Math.min(original, value)
  })

  const comboSavedAmount = computed(() => Math.max(0, comboOriginalAmount.value - comboFinalAmount.value))

  async function loadCombos() {
    try {
      const response = await adminApi.fetchMarketingCombos({ query: filters.combo.query, status: filters.combo.status, size: 50 })
      combos.value = getListPayload(response?.data)
    } catch (error) {
      combos.value = []
      notify(error?.response?.data?.message || error.message || 'Không tải được combo')
    }
  }

  async function loadProductsForPicker() {
    try {
      const response = await adminApi.fetchProducts({ size: 500 })
      const items = getListPayload(response?.data)
      products.value = items.map(mapProduct)
    } catch (error) {
      products.value = []
      notify(error?.response?.data?.message || error.message || 'Không tải được sản phẩm')
    }
  }

  function mapProduct(item) {
    const variant = item.variants?.[0] || item.defaultVariant || item
    return {
      id: item.id,
      variantId: variant.id || item.variantId || item.id,
      name: item.name,
      sku: variant.sku || item.sku || item.slug || item.id,
      category: item.categoryName || item.category?.name || item.category || 'Sản phẩm',
      price: Number(variant.price || item.price || item.minPrice || 0),
      stock: Number(variant.stockQuantity ?? variant.stock ?? item.stockQuantity ?? item.stock ?? 0),
      status: item.status || item.productStatus || 'Đang bán',
      image: item.image || item.thumbnailUrl || item.imageUrl || 'box',
      slug: item.slug,
    }
  }

  function resetComboForm(row = null) {
    editing.combo = row
    comboForm.name = row?.name || ''
    comboForm.description = row?.description || ''
    comboForm.imageMediaId = row?.imageMediaId || ''
    comboForm.imageUrl = row?.imageUrl || ''
    comboForm.imageUpload = null
    comboForm.discountType = row?.discountType || 'PERCENTAGE'
    comboForm.discountValue = row?.discountValue ?? 15
    comboForm.startDate = toDatetimeLocal(row?.startDate)
    comboForm.endDate = toDatetimeLocal(row?.endDate)
    comboForm.active = row?.active ?? true
    comboForm.items = row?.items ? row.items.map((item) => ({ ...item, id: item.id || item.productId, name: item.name || item.productName, category: item.category || item.categoryName, slug: item.productSlug || item.slug })) : []
  }

  async function openComboModal(row = null) {
    if (!products.value.length) await loadProductsForPicker()
    resetComboForm(row)
    modal.combo = true
  }

  async function uploadComboImage(file) {
    if (!file) return
    saving.value = true
    try {
      if (comboForm.imageUpload?.mediaId && !comboForm.imageUpload.persisted) {
        await mediaApi.cancelUpload(comboForm.imageUpload.mediaId).catch(() => {})
      }
      const ownerId = editing.combo?.id || crypto.randomUUID()
      const upload = await mediaApi.uploadStaged(file, {
        ownerType: 'MARKETING',
        ownerId,
      })
      comboForm.imageUpload = upload
      comboForm.imageMediaId = upload.mediaId || ''
      comboForm.imageUrl = upload.secureUrl || upload.secure_url || upload.url || ''
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không tải được ảnh combo')
    } finally {
      saving.value = false
    }
  }

  function onComboImageChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    uploadComboImage(file)
  }

  async function removeComboImage() {
    if (comboForm.imageUpload?.mediaId && !comboForm.imageUpload.persisted) {
      await mediaApi.cancelUpload(comboForm.imageUpload.mediaId).catch(() => {})
    }
    comboForm.imageUpload = null
    comboForm.imageMediaId = ''
    comboForm.imageUrl = ''
  }

  async function closeComboModal() {
    await removeComboImage()
    modal.combo = false
  }

  function comboPayload() {
    return {
      name: comboForm.name.trim(),
      description: comboForm.description,
      imageMediaId: comboForm.imageMediaId || null,
      imageUrl: comboForm.imageUrl || null,
      discountType: comboForm.discountType,
      discountValue: Number(comboForm.discountValue) || 0,
      startDate: comboForm.startDate || null,
      endDate: comboForm.endDate || null,
      active: comboForm.active,
      items: comboForm.items.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        productSlug: item.slug,
        quantity: Number(item.quantity || 1),
        productName: item.name || item.productName,
        sku: item.sku,
        categoryName: item.category || item.categoryName,
        image: item.image,
        price: Number(item.price || 0),
      })),
    }
  }

  async function saveCombo() {
    saving.value = true
    try {
      if (comboForm.imageUpload && !comboForm.imageUpload.completed) {
        comboForm.imageUpload = await mediaApi.completeStagedUpload(comboForm.imageUpload)
        comboForm.imageMediaId = comboForm.imageUpload.mediaId || comboForm.imageMediaId
        comboForm.imageUrl = comboForm.imageUpload.secureUrl
          || comboForm.imageUpload.secure_url
          || comboForm.imageUpload.url
          || comboForm.imageUrl
      }
      const payload = comboPayload()
      if (editing.combo?.id) await adminApi.updateMarketingCombo(editing.combo.id, payload)
      else await adminApi.createMarketingCombo(payload)
      if (comboForm.imageUpload) comboForm.imageUpload.persisted = true
      await loadCombos()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không lưu được combo')
      return
    } finally {
      saving.value = false
    }
    notify('Đã lưu combo')
    modal.combo = false
  }

  function openProductPicker() {
    picker.selected = Object.fromEntries(comboForm.items.map((item) => [item.id, item.quantity || 1]))
    picker.query = ''
    picker.category = ''
    picker.status = ''
    picker.stock = ''
    modal.picker = true
  }

  function togglePickerProduct(product, checked) {
    if (checked) picker.selected[product.id] = picker.selected[product.id] || 1
    else delete picker.selected[product.id]
  }

  function applyPickerProducts() {
    comboForm.items = selectedPickerProducts.value.map((product) => ({ ...product }))
    modal.picker = false
  }

  function removeComboItem(id) {
    comboForm.items = comboForm.items.filter((item) => item.id !== id)
  }

  function requestComboDelete(row) {
    comboDeleteTarget.value = row
  }

  function closeComboDelete() {
    if (deletingCombo.value) return
    comboDeleteTarget.value = null
  }

  async function confirmComboDelete() {
    const combo = comboDeleteTarget.value
    if (!combo?.id || deletingCombo.value) return

    deletingCombo.value = true
    try {
      const response = await adminApi.deleteMarketingCombo(combo.id)
      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Không thể xóa combo.')
      }
      comboDeleteTarget.value = null
      await loadCombos()
      notify(`Đã xóa combo ${combo.name}.`, 'success')
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không thể xóa combo.', 'error')
    } finally {
      deletingCombo.value = false
    }
  }

  return {
    combos,
    products,
    comboForm,
    picker,
    comboDeleteTarget,
    deletingCombo,
    filteredCombos,
    filteredProducts,
    productCategories,
    selectedPickerProducts,
    comboOriginalAmount,
    comboFinalAmount,
    comboSavedAmount,
    loadCombos,
    loadProductsForPicker,
    openComboModal,
    onComboImageChange,
    removeComboImage,
    closeComboModal,
    saveCombo,
    openProductPicker,
    togglePickerProduct,
    applyPickerProducts,
    removeComboItem,
    requestComboDelete,
    closeComboDelete,
    confirmComboDelete,
  }
}
