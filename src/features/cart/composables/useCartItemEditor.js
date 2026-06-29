import { ref, watch } from 'vue'
import { productsApi, ProductResponse } from '@shared/lib/api/services'
import { clampPurchaseQuantity } from '../lib/stockGuards'

function variantSizeLabel(variant) {
  if (!variant) return ''
  if (variant.size) return variant.size
  if (variant.dimensionText) return variant.dimensionText

  const dims = [variant.length, variant.width, variant.height]
    .filter((value) => value != null && value !== '')

  return dims.length === 3 ? `${dims.join(' × ')} cm` : ''
}

function normalizeEditorVariants(variants = []) {
  return variants
    .map((variant) => ({
      ...variant,
      color: variant?.color || '',
      size: variantSizeLabel(variant),
    }))
    .filter((variant) => variant.color || variant.size)
}

function resolveProductDetailLookup(item) {
  return item?.slug || item?.productId || ''
}

export function useCartItemEditor(items, updateItem) {
  const activeItem = ref(null)
  const activeDraft = ref(null)
  const editorLoading = ref(false)

  watch(
    items,
    (nextItems) => {
      if (!activeItem.value) return

      const latestItem = nextItems.find((item) => item.id === activeItem.value.id) ?? null
      if (!latestItem) {
        closeItemEditor()
        return
      }

      activeItem.value = {
        ...latestItem,
        variants: Array.isArray(latestItem.variants) && latestItem.variants.length
          ? latestItem.variants
          : (activeItem.value.variants ?? []),
        colors: Array.isArray(latestItem.colors) && latestItem.colors.length
          ? latestItem.colors
          : (activeItem.value.colors ?? []),
        sizes: Array.isArray(latestItem.sizes) && latestItem.sizes.length
          ? latestItem.sizes
          : (activeItem.value.sizes ?? []),
      }
    },
    { deep: true },
  )

  watch(
    () => activeDraft.value?.selectedColor,
    () => {
      if (!activeItem.value || !activeDraft.value) return

      const nextSizes = getVariantOptions(activeItem.value, 'sizes')
      if (!nextSizes.length) return

      if (!nextSizes.includes(activeDraft.value.selectedSize)) {
        activeDraft.value.selectedSize = nextSizes[0]
      }
    },
  )

  async function buildEditorItem(item) {
    const normalizedExistingVariants = normalizeEditorVariants(item?.variants ?? [])
    if (normalizedExistingVariants.length) {
      return {
        ...item,
        variants: normalizedExistingVariants,
        variantLoadFailed: false,
      }
    }

    const lookupId = resolveProductDetailLookup(item)
    if (!lookupId) {
      return {
        ...item,
        variantLoadFailed: true,
      }
    }

    try {
      const response = await productsApi.getProductDetail(lookupId)
      const product = new ProductResponse(response?.data)
      const fetchedVariants = normalizeEditorVariants(product?.variants ?? [])

      if (!fetchedVariants.length) {
        return {
          ...item,
          variantLoadFailed: true,
        }
      }

      return {
        ...item,
        variants: fetchedVariants,
        variantLoadFailed: false,
        colors: Array.isArray(product?.colors) ? product.colors : [],
        sizes: Array.isArray(product?.sizes) ? product.sizes : [],
        selectedColor: item.selectedColor || product?.colors?.[0] || '',
        selectedSize: item.selectedSize || product?.sizes?.[0] || '',
      }
    } catch (error) {
      return {
        ...item,
        variantLoadFailed: true,
      }
    }
  }

  async function openItemEditor(item) {
    editorLoading.value = true
    try {
      const editorItem = await buildEditorItem(item)
      const colorOptions = getVariantOptions(editorItem, 'colors')
      const nextColor = editorItem.selectedColor || colorOptions[0] || ''
      const sizeOptions = getVariantOptions(editorItem, 'sizes')

      activeItem.value = editorItem
      activeDraft.value = {
        selectedColor: nextColor,
        selectedSize: editorItem.selectedSize || sizeOptions[0] || '',
        qty: Math.max(1, Number(editorItem.qty || 1)),
      }
    } finally {
      editorLoading.value = false
    }
  }

  function closeItemEditor() {
    activeItem.value = null
    activeDraft.value = null
    editorLoading.value = false
  }

  function getVariantOptions(item, field) {
    if (!item) return []

    const variants = Array.isArray(item.variants) ? item.variants : []
    if (variants.length) {
      if (field === 'colors') {
        return [...new Set(variants.map((variant) => variant.color).filter(Boolean))]
      }

      if (field === 'sizes') {
        return [...new Set(variants.map((variant) => variantSizeLabel(variant)).filter(Boolean))]
      }
    }

    if (field === 'colors') return (item.colors ?? []).filter(Boolean)
    if (field === 'sizes') return (item.sizes ?? []).filter(Boolean)
    return []
  }

  function resolveDraftVariantId(item, draft) {
    return resolveDraftVariant(item, draft)?.id ?? item?.variantId ?? null
  }

  function resolveDraftVariant(item, draft) {
    const variants = Array.isArray(item?.variants) ? item.variants : []
    if (!variants.length) return null

    const selectedColor = draft?.selectedColor || ''
    const selectedSize = draft?.selectedSize || ''

    const matched = variants.find((variant) => {
      const variantColor = variant?.color || ''
      const variantSize = variantSizeLabel(variant)
      const colorMatches = !selectedColor || variantColor === selectedColor
      const sizeMatches = !selectedSize || variantSize === selectedSize
      return colorMatches && sizeMatches
    })

    return matched ?? null
  }

  async function applyActiveItemChanges() {
    if (!activeItem.value || !activeDraft.value) return

    const draftVariant = resolveDraftVariant(activeItem.value, activeDraft.value)
    const stockContext = {
      ...activeItem.value,
      stockQuantity: draftVariant?.stockQuantity ?? activeItem.value.stockQuantity,
    }

    await updateItem(activeItem.value.id, {
      variantId: resolveDraftVariantId(activeItem.value, activeDraft.value),
      selectedColor: activeDraft.value.selectedColor,
      selectedSize: activeDraft.value.selectedSize,
      qty: clampPurchaseQuantity(activeDraft.value.qty, stockContext),
    })
    closeItemEditor()
  }

  function changeDraftQty(delta) {
    if (!activeDraft.value) return
    const draftVariant = resolveDraftVariant(activeItem.value, activeDraft.value)
    const stockContext = {
      ...activeItem.value,
      stockQuantity: draftVariant?.stockQuantity ?? activeItem.value?.stockQuantity,
    }
    activeDraft.value.qty = clampPurchaseQuantity(Number(activeDraft.value.qty || 1) + delta, stockContext)
  }

  function setDraftQty(value) {
    if (!activeDraft.value) return
    const normalizedValue = String(value ?? '').replace(/[^\d]/g, '')
    if (normalizedValue === '') {
      activeDraft.value.qty = ''
      return
    }
    const draftVariant = resolveDraftVariant(activeItem.value, activeDraft.value)
    const stockContext = {
      ...activeItem.value,
      stockQuantity: draftVariant?.stockQuantity ?? activeItem.value?.stockQuantity,
    }
    activeDraft.value.qty = clampPurchaseQuantity(normalizedValue, stockContext)
  }

  return {
    activeItem,
    activeDraft,
    editorLoading,
    openItemEditor,
    closeItemEditor,
    getVariantOptions,
    applyActiveItemChanges,
    changeDraftQty,
    setDraftQty,
  }
}
