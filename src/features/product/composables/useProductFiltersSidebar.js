import { reactive, computed, watch } from 'vue'
import { PriceFormatter } from '@shared/lib/formatters'

const PRICE_BANDS = [
  { id: 'lt5m', step: 1, min: 0, max: 5000000 },
  { id: '5-15m', step: 2, min: 5000000, max: 15000000 },
  { id: '15-30m', step: 3, min: 15000000, max: 30000000 },
  { id: 'gt30m', step: 4, min: 30000000, max: 50000000, plus: true },
]

function bandById(id) {
  return PRICE_BANDS.find((band) => band.id === id) ?? null
}

function bandByStep(step) {
  return PRICE_BANDS.find((band) => band.step === Number(step)) ?? null
}

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
    priceSliderStep: 0,
    materials: [],
    colors: [],
    minStar: null,
  })

  function syncPendingFromApplied() {
    const a = props.applied ?? {}
    const activeBand = bandById(a.priceBands?.[0])
    pending.priceBands = activeBand ? [activeBand.id] : []
    pending.priceSliderStep = activeBand?.step ?? 0
    pending.priceSliderPct = Number(a.priceSliderPct ?? 100)
    pending.materials = [...(a.materials ?? [])]
    pending.colors = [...(a.colors ?? [])]
    pending.minStar = a.minStar != null ? Number(a.minStar) : null
  }

  let isSyncingPrice = false

  watch(() => pending.priceBands, (bands) => {
    if (isSyncingPrice) return
    isSyncingPrice = true
    const activeBand = bandById(bands[bands.length - 1])
    pending.priceBands = activeBand ? [activeBand.id] : []
    pending.priceSliderStep = activeBand?.step ?? 0
    pending.priceSliderPct = 100
    setTimeout(() => { isSyncingPrice = false }, 10)
  }, { deep: true })

  watch(() => pending.priceSliderStep, (step) => {
    if (isSyncingPrice) return
    isSyncingPrice = true
    const activeBand = bandByStep(step)
    pending.priceBands = activeBand ? [activeBand.id] : []
    pending.priceSliderPct = 100
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
  const displayRatings = computed(() => {
    const apiRatings = props.facets?.ratings || {}
    
    return [5, 4, 3, 2, 1].map(star => {
      const count = apiRatings[star] || 0
      return {
        value: star,
        hint: star === 5 ? `(${count})` : `${star} sao+ (${count})`,
        count: count,
      }
    })
  })

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

  function togglePriceBand(id) {
    const activeBand = bandById(id)
    if (!activeBand) return
    pending.priceBands = pending.priceBands.includes(id) ? [] : [id]
  }

  const activePriceBand = computed(() => bandById(pending.priceBands[0]))
  const priceMinLabel = computed(() => PriceFormatter.formatShort(activePriceBand.value?.min ?? 0))
  const priceMaxLabel = computed(() => {
    const band = activePriceBand.value
    if (!band) return PriceFormatter.formatShort(50000000, { plus: true })
    return PriceFormatter.formatShort(band.max, { plus: Boolean(band.plus) })
  })

  function applyFilters() {
    emit('apply', {
      priceBands: [...pending.priceBands],
      priceSliderPct: 100,
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
    displayRatings,
    totalCategoryCount,
    toggleBlock,
    selectCategory,
    toggleArrayItem,
    togglePriceBand,
    activePriceBand,
    priceMinLabel,
    priceMaxLabel,
    applyFilters,
    clearAll,
    categoryActive,
  }
}
