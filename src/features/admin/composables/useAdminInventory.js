import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminInventory() {
  const ui = useAdminUiStore()
  const { reloadTick } = storeToRefs(ui)

  const data = ref(null)
  const loading = ref(false)
  const error = ref('')
  const savingThresholds = ref({})
  const expandedProducts = ref(new Set())

  const badgeMap = { success: 'b-success', low: 'b-low', cancel: 'b-cancel' }

  const groupedProducts = computed(() => {
    if (!data.value?.items) return []
    const map = new Map()
    for (const item of data.value.items) {
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          productId: item.productId,
          name: item.name,
          category: item.category,
          variants: [],
        })
      }
      map.get(item.productId).variants.push(item)
    }
    return Array.from(map.values()).map(group => {
      const totalStock = group.variants.reduce((sum, v) => sum + v.stock, 0)
      const hasOut = group.variants.some(v => v.stock <= 0)
      const hasLow = group.variants.some(v => v.stock > 0 && v.stock <= v.threshold)
      const worstStatus = hasOut ? 'cancel' : hasLow ? 'low' : 'success'
      const worstLabel = hasOut ? 'Hết hàng' : hasLow ? 'Sắp hết' : 'Đủ hàng'
      return { ...group, totalStock, worstStatus, worstLabel }
    })
  })

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const inventoryRes = await adminApi.fetchInventory()
      const rawData = inventoryRes.data
      if (rawData && Array.isArray(rawData.kpis)) {
        const kpiLabels = {
          PRODUCTS: { label: 'Mẫu sản phẩm', icon: 'box' },
          VARIANTS: { label: 'Phân loại (SKU)', icon: 'layers' },
          STOCK: { label: 'Tổng tồn kho', icon: 'archive' },
          LOW_STOCK: { label: 'Sắp hết hàng', icon: 'alertTriangle', tone: 'low' },
          OUT_OF_STOCK: { label: 'Hết hàng', icon: 'xOctagon', tone: 'cancel' }
        }
        rawData.kpis = rawData.kpis.map(k => ({
          ...k,
          ...(kpiLabels[k.type] || { label: k.type, icon: 'info' })
        }))
      }
      data.value = rawData
      if (groupedProducts.value.length && expandedProducts.value.size === 0) {
        groupedProducts.value.forEach(g => expandedProducts.value.add(g.productId))
      }
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Không tải được dữ liệu kho.'
    } finally {
      loading.value = false
    }
  }

  function toggleProduct(productId) {
    const next = new Set(expandedProducts.value)
    if (next.has(productId)) {
      next.delete(productId)
    } else {
      next.add(productId)
    }
    expandedProducts.value = next
  }

  function isExpanded(productId) {
    return expandedProducts.value.has(productId)
  }

  function expandAll() {
    expandedProducts.value = new Set(groupedProducts.value.map(g => g.productId))
  }

  function collapseAll() {
    expandedProducts.value = new Set()
  }

  async function updateVariantThreshold(row, event) {
    const threshold = Math.min(9999, Math.max(1, Number(event.target.value) || 5))
    savingThresholds.value = { ...savingThresholds.value, [row.variantId]: true }
    try {
      await adminApi.updateVariantLowStockThreshold(row.variantId, { lowStockThreshold: threshold })
      ui.showToast({ icon: 'check', title: 'Đã cập nhật ngưỡng', subtitle: `${row.sku}: ${threshold}` })
      await load()
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi cập nhật ngưỡng', subtitle: e?.response?.data?.message || e.message })
    } finally {
      const next = { ...savingThresholds.value }
      delete next[row.variantId]
      savingThresholds.value = next
    }
  }

  return {
    ui,
    reloadTick,
    data,
    loading,
    error,
    savingThresholds,
    badgeMap,
    groupedProducts,
    load,
    toggleProduct,
    isExpanded,
    expandAll,
    collapseAll,
    updateVariantThreshold,
  }
}
