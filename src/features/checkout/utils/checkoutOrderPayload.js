import { formatVietnamAddress } from '@shared/lib/formatters'
import { clampPurchaseQuantity } from '@features/cart/lib/stockGuards'

export function buildShippingAddressDetail(address = {}) {
  return formatVietnamAddress(address)
}

export function resolveLineImageUrl(item = {}) {
  const imageCandidates = [
    item.imageUrl,
    item.productImageUrl,
    item.image,
    item.thumbnail,
    item.thumbnailUrl,
    item.coverImage,
    item.coverImageUrl,
    item.productSnapshot?.imageUrl,
    item.product?.imageUrl,
    item.product?.image,
  ]

  if (Array.isArray(item.gallery)) {
    imageCandidates.push(...item.gallery)
  }

  if (Array.isArray(item.images)) {
    imageCandidates.push(...item.images.map((image) => {
      if (typeof image === 'string') return image
      return image?.url || image?.imageUrl || image?.src || ''
    }))
  }

  return imageCandidates.find(Boolean) || ''
}

export function buildOrderItemPayload(item = {}) {
  return {
    productId: item.productId,
    variantId: item.variantId || null,
    categoryName: item.categoryName || item.categoryLabel || '',
    productName: item.productName || item.name,
    slug: item.slug || '',
    price: Number(item.price) || 0,
    quantity: clampPurchaseQuantity(item.qty ?? item.quantity, item),
    imageUrl: resolveLineImageUrl(item),
  }
}

export function buildOrderPayload({
  address,
  checkoutState,
  lines,
  summary,
}) {
  const shippingAddressDetail = buildShippingAddressDetail(address)
  const shippingAddressName = address.fullName || address.name || ''

  return {
    shippingAddressName,
    shippingAddressPhone: address.phone,
    shippingAddressDetail,
    shippingMethod: checkoutState.selectedShipping.value?.id || checkoutState.selectedShippingId.value,
    customerNote: checkoutState.sellerNote.value,
    paymentMethod: checkoutState.selectedPaymentId.value,
    shopVoucherCode: checkoutState.shopVoucher.value?.code || null,
    shippingVoucherCode: checkoutState.shippingVoucher.value?.code || null,
    comboId: checkoutState.selectedCombo.value?.id || null,
    discountAmount: summary.shopDiscount,
    shippingDiscount: summary.shippingDiscount,
    comboDiscount: summary.comboDiscount,
    shippingFee: summary.shipFee,
    insuranceFee: summary.insuranceAmount,
    items: lines.map(buildOrderItemPayload),
  }
}
