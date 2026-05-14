import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PRODUCT_LIST_MOCK_ITEMS } from '@features/product/mock/productListMockData'
import { productDetailMap } from '@features/product/mock/productDetailMockData'

function buildDefaultLine(item, qty = 1) {
  const detail = item.detailId ? productDetailMap[item.detailId] : null
  return {
    id: item.id,
    productId: item.detailId ?? item.id,
    name: detail?.name ?? item.name,
    category: item.category,
    imageFallback: item.imageFallback,
    price: item.price,
    oldPrice: item.oldPrice,
    qty,
    selectedColor: detail?.colors?.[0] ?? '',
    selectedSize: detail?.sizes?.[1] ?? detail?.sizes?.[0] ?? '',
    colors: detail?.colors ?? [],
    sizes: detail?.sizes ?? [],
    stock: detail?.stock ?? 0,
  }
}

function createDefaultLines() {
  return [
    buildDefaultLine(PRODUCT_LIST_MOCK_ITEMS[0], 1),
    buildDefaultLine(PRODUCT_LIST_MOCK_ITEMS[2], 2),
  ]
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref(createDefaultLines())

  function setLines(next) {
    lines.value = Array.isArray(next) ? next : []
  }

  function removeLine(lineId) {
    lines.value = lines.value.filter((line) => line.id !== lineId)
  }

  function updateLineQty(lineId, nextQty) {
    const qty = Math.max(1, Number(nextQty) || 1)
    lines.value = lines.value.map((line) => (line.id === lineId ? { ...line, qty } : line))
  }

  function updateLineVariant(lineId, field, value) {
    if (!['selectedColor', 'selectedSize'].includes(field)) return
    lines.value = lines.value.map((line) => (line.id === lineId ? { ...line, [field]: value } : line))
  }

  return { lines, setLines, removeLine, updateLineQty, updateLineVariant }
})
