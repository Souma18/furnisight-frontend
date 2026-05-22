export const CHECKOUT_BREADCRUMB = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giỏ hàng', to: '/account?view=cart' },
  { label: 'Thanh toán' },
]

export const CHECKOUT_STEPS = [
  { id: 'cart', label: 'Giỏ hàng', status: 'done', to: '/account?view=cart' },
  { id: 'checkout', label: 'Thanh toán', status: 'active' },
  { id: 'done', label: 'Hoàn tất', status: 'pending' },
]

export const CHECKOUT_SHOP = {
  name: 'LUXNEST Official Store',
  icon: 'store',
}

export const CHECKOUT_INSURANCE = {
  id: 'furniture-insurance',
  label: 'Bảo hiểm nội thất LUXNEST',
  description: 'Bảo vệ sản phẩm khỏi hư hỏng vật lý trong 2 năm sử dụng.',
  price: 450000,
  badge: 'MỚI',
}

export const CHECKOUT_SHIPPING_OPTIONS = [
  {
    id: 'express',
    name: 'Nhanh',
    badge: 'Khuyến nghị',
    eta: 'Nhận từ 16 Th05 – 20 Th05',
    note: 'Dùng voucher vận chuyển để miễn phí',
    fee: 28700,
    isFree: false,
  },
  {
    id: 'standard',
    name: 'Tiêu chuẩn',
    eta: 'Nhận từ 18 Th05 – 22 Th05',
    fee: 15000,
    isFree: false,
  },
  {
    id: 'assembly',
    name: 'Lắp ráp tại nhà',
    badge: 'LUXNEST',
    badgeTone: 'gold',
    eta: 'Đặt lịch 19 Th05 – 25 Th05',
    note: 'Bao gồm phí lắp ráp chuyên nghiệp',
    fee: 0,
    isFree: true,
  },
]

export const CHECKOUT_PAYMENT_METHODS = [
  { id: 'card', name: 'Thẻ tín dụng/Ghi nợ', sub: 'Visa, Mastercard, JCB', icon: 'creditCard' },
  { id: 'banking', name: 'Thẻ nội địa NAPAS', sub: 'Internet Banking', icon: 'building2' },
  { id: 'momo', name: 'Ví MoMo', sub: 'Thanh toán nhanh', icon: 'wallet' },
  { id: 'cod', name: 'Thanh toán khi nhận hàng', sub: 'COD – Tiền mặt / QR', icon: 'banknote' },
]

export const CHECKOUT_SHOP_VOUCHERS = [
  {
    id: 'LUXNEST15',
    code: 'LUXNEST15',
    name: 'Giảm 15% đơn hàng',
    desc: 'Áp dụng cho đơn từ 10.000.000đ · Tối đa 3.000.000đ',
    expire: 'Hết hạn: 31/05/2025',
    icon: 'badgePercent',
    discountType: 'percent',
    discountValue: 15,
    maxDiscount: 3000000,
    minOrder: 10000000,
  },
  {
    id: 'HERITAGE30',
    code: 'HERITAGE30',
    name: 'Flash Sale – Giảm 30% Heritage',
    desc: 'Chỉ áp dụng cho bộ sưu tập Heritage · Tối đa 5.000.000đ',
    expire: 'Hết hạn: 19/05/2025',
    icon: 'sparkles',
    discountType: 'percent',
    discountValue: 30,
    maxDiscount: 5000000,
    minOrder: 0,
  },
  {
    id: 'NEWUSER500',
    code: 'NEWUSER500',
    name: 'Khách hàng mới – Giảm 500.000đ',
    desc: 'Đơn từ 5.000.000đ · Dùng 1 lần',
    expire: 'Hết hạn: 30/06/2025',
    icon: 'gift',
    discountType: 'fixed',
    discountValue: 500000,
    minOrder: 5000000,
  },
]

export const CHECKOUT_SHIPPING_VOUCHERS = [
  {
    id: 'FREESHIP50K',
    code: 'FREESHIP50K',
    name: 'Miễn phí vận chuyển 50K',
    desc: 'Áp dụng cho đơn từ 500.000đ',
    expire: 'Hết hạn: 30/06/2025',
    icon: 'truck',
    discountType: 'shipping_cap',
    discountValue: 50000,
  },
]

export const CHECKOUT_COD_NOTE =
  'Thanh toán khi nhận hàng (COD). Phí thu hộ: 0đ. Ưu đãi về phí vận chuyển (nếu có) áp dụng cả với phí thu hộ.'

export const CHECKOUT_DEFAULT_SHIPPING_VOUCHER = {
  code: 'FREESHIP50K',
  name: 'Miễn phí vận chuyển',
}
