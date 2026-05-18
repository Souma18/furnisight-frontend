import { reactive, computed, watch } from 'vue'

export function useProductFiltersSidebar(props, emit) {
  const openBlocks = reactive({
    cat: true,
    price: true,
    mat: true,
    color: true,
    rating: true,
  })

  const pending = reactive({
    priceBands: [],
    priceSliderPct: 100,
    materials: [],
    colors: [],
    minStar: null,
  })

  function syncPendingFromApplied() {
    const a = props.applied ?? {}
    pending.priceBands = [...(a.priceBands ?? [])]
    pending.priceSliderPct = Number(a.priceSliderPct ?? 100)
    pending.materials = [...(a.materials ?? [])]
    pending.colors = [...(a.colors ?? [])]
    pending.minStar = a.minStar != null ? Number(a.minStar) : null
  }

  let isSyncingPrice = false

  watch(() => pending.priceBands, (bands) => {
    if (isSyncingPrice) return
    isSyncingPrice = true
    
    if (bands.length > 1) {
      pending.priceBands = [bands[bands.length - 1]]
      bands = pending.priceBands
    }

    if (bands.includes('gt30m')) pending.priceSliderPct = 100
    else if (bands.includes('15-30m')) pending.priceSliderPct = 60
    else if (bands.includes('5-15m')) pending.priceSliderPct = 30
    else if (bands.includes('lt5m')) pending.priceSliderPct = 10
    else pending.priceSliderPct = 100
    setTimeout(() => { isSyncingPrice = false }, 10)
  }, { deep: true })

  watch(() => pending.priceSliderPct, (pct) => {
    if (isSyncingPrice) return
    isSyncingPrice = true
    pending.priceBands = []
    if (pct <= 10) pending.priceBands.push('lt5m')
    else if (pct > 10 && pct <= 30) pending.priceBands.push('5-15m')
    else if (pct > 30 && pct <= 60) pending.priceBands.push('15-30m')
    else if (pct > 60) pending.priceBands.push('gt30m')
    setTimeout(() => { isSyncingPrice = false }, 10)
  })

  watch(
    () => props.applied,
    () => syncPendingFromApplied(),
    { deep: true, immediate: true },
  )

  const displayCategories = computed(() => {
    const list = props.facets?.categories || []
    if (list.length > 0 && !list.some(c => c.id === 'all')) {
      const totalCount = list.reduce((sum, c) => sum + (c.count || 0), 0)
      return [{ id: 'all', slug: 'all', label: 'Tất cả sản phẩm', count: totalCount }, ...list]
    }
    return list
  })
  const displayMaterials = computed(() => props.facets?.materials || [])
  const displayColors = computed(() => props.facets?.colors || [])

  const totalCategoryCount = computed(() =>
    displayCategories.value.find((c) => c.id === 'all')?.count ?? 0,
  )

  function toggleBlock(key) {
    openBlocks[key] = !openBlocks[key]
  }

  function selectCategory(cat) {
    emit('select-category', cat.slug ?? cat.id)
  }

  function toggleArrayItem(key, id) {
    const arr = pending[key]
    const i = arr.indexOf(id)
    if (i === -1) arr.push(id)
    else arr.splice(i, 1)
  }

  const priceMinLabel = '0đ'
  const priceMaxLabel = computed(() =>
    pending.priceSliderPct >= 100 ? '50tr+' : `${Math.round((pending.priceSliderPct / 100) * 50)}tr`,
  )

  function applyFilters() {
    emit('apply', {
      priceBands: [...pending.priceBands],
      priceSliderPct: pending.priceSliderPct,
      materials: [...pending.materials],
      colors: [...pending.colors],
      minStar: pending.minStar,
    })
  }

  function clearAll() {
    emit('clear')
  }

  function categoryActive(cat) {
    const current = String(props.selectedCategory ?? 'all').toLowerCase()
    return current === String(cat.slug ?? '').toLowerCase() ||
           current === String(cat.label ?? '').toLowerCase()
  }

  return {
    openBlocks,
    pending,
    displayCategories,
    displayMaterials,
    displayColors,
    totalCategoryCount,
    toggleBlock,
    selectCategory,
    toggleArrayItem,
    priceMinLabel,
    priceMaxLabel,
    applyFilters,
    clearAll,
    categoryActive,
  }
}
