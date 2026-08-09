const API_BASE_URL = 'https://provinces.open-api.vn/api/v2'
const REQUEST_TIMEOUT_MS = 8000

function withTimeout(url) {
  return fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
}

export async function getProvinces() {
  const response = await withTimeout(`${API_BASE_URL}/p/`)
  if (!response.ok) throw new Error('Failed to fetch provinces')
  return response.json()
}

export async function getWardsByProvince(provinceCode) {
  const response = await withTimeout(`${API_BASE_URL}/p/${provinceCode}?depth=2`)
  if (!response.ok) throw new Error('Failed to fetch wards')
  const data = await response.json()
  return data.wards ?? []
}

export const vietnamAddressPublicApiMeta = {
  provider: 'provinces.open-api.vn',
  version: 'v2',
  type: 'external_public_api',
  baseURL: API_BASE_URL,
  timeoutMs: REQUEST_TIMEOUT_MS,
  administrativeLevels: ['province', 'ward'],
}
