export const PRICE_BAND_TAGS = {
  lt5m: 'Dưới 5tr',
  '5-15m': '5tr - 15tr',
  '15-30m': '15tr - 30tr',
  gt30m: '30tr - 50tr+',
}

export function createDefaultProductFilters() {
  return {
    priceBands: [],
    priceSliderPct: 100,
    materials: [],
    colors: [],
    minStar: null,
  }
}

export function parseProductListQueryPreset(query = {}) {
  const qCategory = String(query.category ?? '').trim()
  const qBreadcrumb = String(query.breadcrumb ?? '').trim()
  const qKeyword = String(query.q ?? '').trim()

  return {
    selectedCategory: qCategory && qCategory !== 'all'
      ? qCategory
      : qBreadcrumb && qBreadcrumb !== 'sản phẩm'
        ? qBreadcrumb || 'all'
        : 'all',
    searchKeyword: qKeyword || '',
  }
}

export function buildProductListParams({
  appliedFilters,
  saleOnly,
  searchKeyword,
  selectedCategory,
  selectedSubcategory,
  sortBy,
  page,
}) {
  let categorySlug = ''
  if (selectedSubcategory !== 'all') {
    categorySlug = selectedSubcategory
  } else if (selectedCategory !== 'all') {
    categorySlug = selectedCategory
  }

  return {
    ...(searchKeyword ? { q: searchKeyword } : {}),
    ...(categorySlug ? { category: categorySlug } : {}),
    sort: sortBy,
    ...(page > 0 ? { page } : {}),
    ...(appliedFilters.priceBands?.length ? { priceBands: appliedFilters.priceBands } : {}),
    ...(appliedFilters.priceSliderPct < 100 ? { priceSliderPct: appliedFilters.priceSliderPct } : {}),
    ...(appliedFilters.materials?.length ? { materials: appliedFilters.materials } : {}),
    ...(appliedFilters.colors?.length ? { colors: appliedFilters.colors } : {}),
    ...(appliedFilters.minStar != null ? { minStar: appliedFilters.minStar } : {}),
    ...(saleOnly ? { saleOnly: true } : {}),
  }
}

export function buildActiveProductTags({
  appliedFilters,
  saleOnly,
  searchKeyword,
  selectedCategory,
  selectedSubcategory,
}) {
  const tags = []
  if (selectedCategory !== 'all') tags.push(selectedCategory)
  if (selectedSubcategory !== 'all') tags.push(selectedSubcategory)
  if (searchKeyword.trim()) tags.push(`"${searchKeyword.trim()}"`)
  if (saleOnly) tags.push('Sale')
  if (appliedFilters.materials?.length) tags.push(`${appliedFilters.materials.length} chất liệu`)
  if (appliedFilters.colors?.length) tags.push(`${appliedFilters.colors.length} màu`)
  if (appliedFilters.minStar != null) tags.push(`${appliedFilters.minStar}+ sao`)
  if (appliedFilters.priceBands?.length) tags.push(PRICE_BAND_TAGS[appliedFilters.priceBands[0]] ?? 'Khoảng giá')
  return tags
}
