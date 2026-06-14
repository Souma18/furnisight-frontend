export function formatVietnamAddress(address = {}) {
  return [
    address.detail || address.street,
    address.wardName || address.ward,
    address.provinceName || address.city,
  ].filter(Boolean).join(', ')
}
