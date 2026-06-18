import { computed, ref } from 'vue'
import { promotionsApi } from '@shared/lib/api/services'
import { normalizeCombo, normalizeList } from '../lib/promotionNormalizers'
import { comboStockIssue, enrichComboItemStock } from '../lib/comboStock'

const COMBO_PAGE_SIZE = 6

export function usePromotionsCombos({ enrichComboItemImage, showToast }) {
  const combos = ref([])
  const comboPage = ref(0)
  const comboTotal = ref(0)
  const comboSort = ref('save-desc')
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMoreCombos = computed(() => combos.value.length < comboTotal.value)

  async function loadCombos(reset = false) {
    if (reset) {
      comboPage.value = 0
      combos.value = []
      loading.value = true
    } else {
      loadingMore.value = true
    }

    try {
      const response = await promotionsApi.getCombos({
        placement: 'PROMOTION',
        page: comboPage.value,
        size: COMBO_PAGE_SIZE,
        sort: comboSort.value,
      })
      const payload = response.data || {}
      const rows = await Promise.all(normalizeList(payload).map(async (rawCombo) => {
        const combo = normalizeCombo(rawCombo)
        combo.items = await Promise.all(combo.items.map(async (item) =>
          enrichComboItemStock(await enrichComboItemImage(item)),
        ))
        combo.stockIssue = comboStockIssue(combo)
        return combo
      }))
      comboTotal.value = Number(payload.totalElements ?? payload.total ?? rows.length)
      combos.value = reset ? rows : [...combos.value, ...rows]
    } catch (error) {
      if (reset) {
        combos.value = []
        comboTotal.value = 0
      }
      showToast('Chưa tải được combo', error.response?.data?.message || 'Vui lòng thử lại sau.', 'alert')
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function loadMoreCombos() {
    if (!hasMoreCombos.value || loadingMore.value) return
    comboPage.value += 1
    await loadCombos(false)
  }

  async function changeComboSort(event) {
    comboSort.value = event.target.value
    await loadCombos(true)
  }

  return {
    combos,
    comboTotal,
    comboSort,
    loading,
    loadingMore,
    hasMoreCombos,
    loadCombos,
    loadMoreCombos,
    changeComboSort,
  }
}
