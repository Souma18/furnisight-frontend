import { apiClient } from '@shared/lib/api'
import { getProductDetailById } from '../mock/productDetailMockData'
import { PRODUCT_LIST_MOCK_ITEMS } from '../mock/productListMockData'

const baseUrl = '/catalog'

export function fetchProducts(params) {
  return apiClient.get(`${baseUrl}/products`, { params })
}

export function fetchProductById(id) {
  return apiClient.get(`${baseUrl}/products/${id}`)
}

export function fetchCategories() {
  return apiClient.get(`${baseUrl}/categories`)
}

function sleep(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAxiosLikeResponse(data) {
  return { data }
}

function throwAxiosLikeError(message) {
  throw {
    response: {
      data: {
        message,
      },
    },
    message,
  }
}

// Mock API: giả lập payload riêng cho các tab detail như backend thật.
export async function fetchProductDetailTabDataMock(productId) {
  await sleep()
  const detail = getProductDetailById(productId)
  if (!detail) {
    throwAxiosLikeError('Không tìm thấy dữ liệu tab cho sản phẩm này.')
  }
  return buildAxiosLikeResponse({
    productId,
    specs: detail.specs ?? {
      summaryTitle: 'Thông số cơ bản',
      summaryRows: [],
      detailTitle: 'Chi tiết kỹ thuật đầy đủ',
      detailRows: [],
    },
    reviews: detail.reviews ?? { bars: [], items: [] },
    qa: detail.qa ?? [],
  })
}

function sleep(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAxiosLikeResponse(data) {
  return { data }
}

function throwAxiosLikeError(message) {
  throw {
    response: {
      data: {
        message,
      },
    },
    message,
  }
}

// Mock API: giả lập payload riêng cho các tab detail như backend thật.
export async function fetchProductDetailTabDataMock(productId) {
  await sleep()
  const detail = getProductDetailById(productId)
  if (!detail) {
    throwAxiosLikeError('Không tìm thấy dữ liệu tab cho sản phẩm này.')
  }
  return buildAxiosLikeResponse({
    productId,
    specs: detail.specs ?? {
      summaryTitle: 'Thông số cơ bản',
      summaryRows: [],
      detailTitle: 'Chi tiết kỹ thuật đầy đủ',
      detailRows: [],
    },
    reviews: detail.reviews ?? { bars: [], items: [] },
    qa: detail.qa ?? [],
  })
}

// Mock API theo form axios response để thay BE sau này.
/** `bands` từ checkbox — OR; rỗng = không lọc theo khoảng. */
const PRICE_BANDS = {
  lt5m: (p) => p < 5_000_000,
  '5-15m': (p) => p >= 5_000_000 && p < 15_000_000,
  '15-30m': (p) => p >= 15_000_000 && p < 30_000_000,
  gt30m: (p) => p >= 30_000_000,
}

function parseBands(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw.map(String)
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseIdList(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw.map(String)
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function priceSliderMaxVnd(percent) {
  const p = Math.min(100, Math.max(0, Number(percent)))
  return Math.round((p / 100) * 50_000_000)
}

function matchesMinRating(itemRating, minStarOption) {
  if (minStarOption == null || minStarOption === '') return true
  const m = Number(minStarOption)
  if (m >= 5) return itemRating >= 4.5
  if (m >= 4) return itemRating >= 4.0
  if (m >= 3) return itemRating >= 3.0
  return true
}

export async function fetchProductsMock(params = {}) {
  await sleep(480)
  const query = String(params.q ?? '').trim().toLowerCase()
  const category = String(params.category ?? 'all').trim().toLowerCase()
  const sort = String(params.sort ?? 'popular')

  const bands = parseBands(params.priceBands)
  const materials = parseIdList(params.materials)
  const colors = parseIdList(params.colors)
  const minStar = params.minStar != null && params.minStar !== '' ? Number(params.minStar) : null
  const saleOnly = params.saleOnly === true || params.saleOnly === 'true' || params.saleOnly === 1
  const sliderMax = params.priceSliderPct != null ? priceSliderMaxVnd(params.priceSliderPct) : null

  let items = [...PRODUCT_LIST_MOCK_ITEMS]

  if (category !== 'all') {
    items = items.filter((item) => item.category.toLowerCase() === category)
  }

  if (query) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    )
  }

  if (saleOnly) {
    items = items.filter((item) => item.tags?.includes('sale') || Boolean(item.oldPrice))
  }

  if (bands.length) {
    items = items.filter((item) =>
      bands.some((key) => PRICE_BANDS[key] && PRICE_BANDS[key](item.price)),
    )
  }

  if (sliderMax != null) {
    items = items.filter((item) => item.price <= sliderMax)
  }

  if (materials.length) {
    items = items.filter((item) => {
      const im = item.materials ?? []
      return materials.some((id) => im.includes(id))
    })
  }

  if (colors.length) {
    items = items.filter((item) => {
      const ic = item.colorIds ?? []
      return colors.some((id) => ic.includes(id))
    })
  }

  if (minStar != null && !Number.isNaN(minStar)) {
    items = items.filter((item) => matchesMinRating(item.rating, minStar))
  }

  if (sort === 'price-asc') items.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') items.sort((a, b) => b.price - a.price)
  if (sort === 'rating') items.sort((a, b) => b.rating - a.rating)
  if (sort === 'newest') items = [...items].reverse()

  return buildAxiosLikeResponse({
    items,
    total: items.length,
    facets: {
      categories: [
        { label: 'Tất cả', value: 'all' },
        { label: 'Giường ngủ', value: 'giường ngủ' },
        { label: 'Ghế', value: 'ghế' },
        { label: 'Sofa', value: 'sofa' },
        { label: 'Bàn trà', value: 'bàn trà' },
        { label: 'Tủ quần áo', value: 'tủ quần áo' },
      ],
    },
  })
}
