export const ORDER_STATUS_LABELS = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  delivering: 'Đang giao hàng',
  done: 'Hoàn thành',
  cancel: 'Đã hủy',
}

export const ORDER_LIST_SEED = [
  {
    id: 'order-lx20260948',
    orderCode: '#LX-2026-0948',
    status: 'delivering',
    date: '14/05/2026',
    total: 21400000,
    items: 2,
    thumbs: ['🛏️', '🛋️'],
  },
  {
    id: 'order-lx20260226',
    orderCode: '#LX-2026-226',
    status: 'pending',
    date: '15/05/2026',
    total: 12500000,
    items: 1,
    thumbs: ['🛏️'],
  },
  {
    id: 'order-lx20260188',
    orderCode: '#LX-2026-188',
    status: 'pending',
    date: '14/05/2026',
    total: 3890000,
    items: 2,
    thumbs: ['🪑', '💡'],
  },
  {
    id: 'order-ln250523',
    orderCode: 'LN250523',
    status: 'delivering',
    date: '23/05/2025',
    total: 11820000,
    items: 3,
    thumbs: ['🛏️', '🗄️', '💡'],
  },
  {
    id: 'order-ln250512',
    orderCode: 'LN250512',
    status: 'delivering',
    date: '12/05/2025',
    total: 5200000,
    items: 1,
    thumbs: ['🛋️'],
  },
  {
    id: 'order-ln250418',
    orderCode: 'LN250418',
    status: 'done',
    date: '18/04/2025',
    total: 4450000,
    items: 2,
    thumbs: ['🪑', '🪞'],
  },
  {
    id: 'order-ln250301',
    orderCode: 'LN250301',
    status: 'cancel',
    date: '01/03/2025',
    total: 2100000,
    items: 1,
    thumbs: ['🪞'],
  },
]

const PENDING_DETAIL_TEMPLATE = {
  paymentLabel: 'Thanh toán khi nhận hàng (COD)',
  carrier: 'LUXNEST Logistics',
  trackingCode: null,
  eta: 'Chờ xác nhận đơn',
  address: {
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    detail: 'Ký Túc Xá ĐHQG TP.HCM, Khu B',
    wardName: 'Phường Đông Hòa',
    districtName: 'TP. Thủ Đức',
    provinceName: 'TP. Hồ Chí Minh',
  },
}

export const ORDER_DETAIL_SEED = {
  'order-lx20260948': {
    id: 'order-lx20260948',
    orderCode: '#LX-2026-0948',
    status: 'delivering',
    placedAt: '14/05/2026 · 15:27',
    paymentLabel: 'Thẻ tín dụng ****1234',
    carrier: 'GHN Express',
    trackingCode: 'GHNVN112233445',
    eta: '19–21/05/2026',
    address: PENDING_DETAIL_TEMPLATE.address,
    timeline: [
      { title: 'Đơn hàng đã được xác nhận', sub: 'LUXNEST đã xác nhận và đang chuẩn bị đơn hàng', time: '14/05/2026 · 15:30', done: true },
      { title: 'Đơn hàng đã đóng gói', sub: 'Sản phẩm đã được đóng gói tại kho LUXNEST HCM', time: '14/05/2026 · 18:15', done: true },
      { title: 'Đang vận chuyển', sub: 'GHN Express · Mã vận đơn GHNVN112233445', time: 'Hôm nay · 09:22', active: true },
      { title: 'Giao hàng thành công', sub: 'Dự kiến: 19–21 tháng 5, 2026', pending: true },
    ],
    lines: [
      { name: 'Giường Walnut Premium', categoryLabel: 'Giường ngủ', variant: 'Walnut / King 180cm', qty: 1, price: 12500000, thumb: '🛏️' },
      { name: 'Sofa Nordic 3 chỗ', categoryLabel: 'Ghế sofa', variant: 'Xám nhạt / 3 chỗ', qty: 1, price: 8900000, thumb: '🛋️' },
    ],
    summary: { subtotal: 21400000, shipFee: 0, discount: 0, total: 21400000 },
  },
  'order-lx20260226': {
    id: 'order-lx20260226',
    orderCode: '#LX-2026-226',
    status: 'pending',
    placedAt: '15/05/2026 · 10:15',
    ...PENDING_DETAIL_TEMPLATE,
    timeline: [
      { title: 'Đặt hàng thành công', sub: 'Đơn đang chờ LUXNEST xác nhận', time: '15/05/2026 · 10:15', done: true },
      { title: 'Xử lý đơn hàng', sub: 'Bạn có thể huỷ đơn trong lúc chờ xác nhận', pending: true },
      { title: 'Vận chuyển', sub: 'Chưa bắt đầu', pending: true },
      { title: 'Hoàn tất', sub: '—', pending: true },
    ],
    lines: [
      { name: 'Giường Walnut Premium Heritage', categoryLabel: 'Giường ngủ', variant: '1m6 × 2m / Walnut Nâu', qty: 1, price: 12500000, thumb: '🛏️' },
    ],
    summary: { subtotal: 12500000, shipFee: 0, discount: 0, total: 12500000 },
  },
  'order-lx20260188': {
    id: 'order-lx20260188',
    orderCode: '#LX-2026-188',
    status: 'pending',
    placedAt: '14/05/2026 · 20:40',
    ...PENDING_DETAIL_TEMPLATE,
    timeline: [
      { title: 'Đặt hàng thành công', sub: 'Đơn đang chờ LUXNEST xác nhận', time: '14/05/2026 · 20:40', done: true },
      { title: 'Xử lý đơn hàng', sub: 'Bạn có thể huỷ đơn trong lúc chờ xác nhận', pending: true },
      { title: 'Vận chuyển', sub: 'Chưa bắt đầu', pending: true },
      { title: 'Hoàn tất', sub: '—', pending: true },
    ],
    lines: [
      { name: 'Ghế Accent Velvet', categoryLabel: 'Ghế', variant: 'Xanh navy', qty: 1, price: 2890000, thumb: '🪑' },
      { name: 'Đèn treo Rattan', categoryLabel: 'Đèn', variant: 'Tự nhiên / E27', qty: 1, price: 1000000, thumb: '💡' },
    ],
    summary: { subtotal: 3890000, shipFee: 0, discount: 0, total: 3890000 },
  },
  'order-ln250523': {
    id: 'order-ln250523',
    orderCode: 'LN250523',
    status: 'delivering',
    placedAt: '23/05/2025 · 14:20',
    paymentLabel: 'Thanh toán khi nhận hàng (COD)',
    carrier: 'GHN Express',
    trackingCode: 'GHNVN998877665',
    eta: '25–27/05/2025',
    address: {
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      detail: 'Ký Túc Xá ĐHQG TP.HCM, Khu B',
      wardName: 'Phường Đông Hòa',
      districtName: 'TP. Thủ Đức',
      provinceName: 'TP. Hồ Chí Minh',
    },
    timeline: [
      { title: 'Đơn hàng đã được xác nhận', sub: 'LUXNEST đã xác nhận và đang chuẩn bị đơn hàng', time: '23/05/2025 · 14:25', done: true },
      { title: 'Đơn hàng đã đóng gói', sub: 'Sản phẩm đã được đóng gói tại kho LUXNEST HCM', time: '23/05/2025 · 18:00', done: true },
      { title: 'Đang vận chuyển', sub: 'GHN Express · Mã vận đơn GHNVN998877665', time: '24/05/2025 · 09:10', active: true },
      { title: 'Giao hàng thành công', sub: 'Dự kiến: 25–27 tháng 5, 2025', pending: true },
    ],
    lines: [
      { name: 'Giường Walnut Premium', categoryLabel: 'Giường ngủ', variant: 'Walnut / King 180cm', qty: 1, price: 8500000, thumb: '🛏️' },
      { name: 'Tủ đầu giường Walnut', categoryLabel: 'Tủ', variant: 'Walnut Nâu', qty: 2, price: 1660000, thumb: '🗄️' },
    ],
    summary: { subtotal: 11820000, shipFee: 0, discount: 0, total: 11820000 },
  },
}

export function buildOrderDetailFromCheckout({ order, lines, summary, address }) {
  const orderId = order.orderId
  const orderCode = order.orderCode
  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN')
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return {
    id: orderId,
    orderCode,
    status: 'pending',
    placedAt: `${dateStr} · ${timeStr}`,
    paymentLabel: 'Thanh toán khi nhận hàng (COD)',
    carrier: 'LUXNEST Logistics',
    trackingCode: null,
    eta: 'Đang cập nhật',
    address: address
      ? {
          fullName: address.fullName,
          phone: address.phone,
          detail: address.detail,
          wardName: address.wardName,
          districtName: address.districtName,
          provinceName: address.provinceName,
        }
      : null,
    timeline: [
      {
        title: 'Đặt hàng thành công',
        sub: 'LUXNEST đã nhận đơn và sẽ xác nhận trong thời gian sớm nhất',
        time: `${dateStr} · ${timeStr}`,
        done: true,
      },
      { title: 'Xử lý đơn hàng', sub: 'Đang chờ xác nhận', pending: true },
      { title: 'Vận chuyển', sub: 'Chưa bắt đầu', pending: true },
      { title: 'Hoàn tất', sub: '—', pending: true },
    ],
    lines: lines.map((line) => ({
      name: line.name,
      categoryLabel: line.categoryLabel ?? 'Sản phẩm',
      variant: [line.selectedColor, line.selectedSize].filter(Boolean).join(' / ') || 'Mặc định',
      qty: line.qty,
      price: line.price,
      thumb: line.imageFallback ?? line.emoji ?? '🛍️',
    })),
    summary: {
      subtotal: summary.subtotal,
      shipFee: summary.shipFee,
      discount: (summary.shopDiscount ?? 0) + (summary.shippingDiscount ?? 0),
      total: summary.total,
    },
  }
}

export function buildOrderListItemFromCheckout({ order, lines, summary }) {
  return {
    id: order.orderId,
    orderCode: order.orderCode,
    status: 'pending',
    date: new Date().toLocaleDateString('vi-VN'),
    total: summary.total,
    items: lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0),
    thumbs: lines.map((line) => line.imageFallback ?? line.emoji ?? '🛍️').slice(0, 4),
  }
}
