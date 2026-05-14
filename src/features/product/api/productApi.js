import { apiClient } from '@shared/lib/api'
import { getProductDetailById } from '../mock/productDetailMockData'

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
