function sleep(ms = 420) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAxiosLikeResponse(data) {
  return { data }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const notificationSeed = [
  {
    id: 'noti-1',
    type: 'order',
    unread: true,
    title: 'Đơn hàng đang được giao',
    desc: 'Đơn hàng #LX-2024-0892 đã rời kho và đang trên đường giao đến bạn.',
    time: '10 phút trước',
    dateLabel: 'Hôm nay',
    icon: 'truck',
    tagLabel: 'Đang giao',
    tagTone: 'pending',
    detail: {
      'Mã đơn': '#LX-2024-0892',
      'Sản phẩm': 'Giường Walnut Premium 1m6',
      'Mã vận đơn': 'SPXVN062866583164',
      'Vị trí': 'Kho Bình Dương -> TP.HCM Q.7',
      'Tổng tiền': '12.500.000 đ',
    },
    actions: [
      { label: 'Theo dõi đơn', variant: 'primary' },
      { label: 'Xem chi tiết', variant: 'ghost' },
    ],
  },
  {
    id: 'noti-2',
    type: 'promo',
    unread: true,
    title: 'Flash Sale cuối tuần giảm 30%',
    desc: 'Ưu đãi đặc biệt cho bộ sưu tập Heritage Collection, chỉ còn 2 ngày.',
    time: '1 giờ trước',
    dateLabel: 'Hôm nay',
    icon: 'gift',
    tagLabel: 'Khuyến mãi',
    tagTone: 'promo',
    detail: {
      'Mã giảm giá': 'HERITAGE30',
      'Giảm tới': '30% toàn bộ bộ sưu tập',
      'Hết hạn': 'Chủ nhật 23:59',
      'Đơn tối thiểu': '5.000.000 đ',
    },
    actions: [
      { label: 'Mua ngay', variant: 'primary' },
      { label: 'Sao chép mã', variant: 'ghost' },
    ],
  },
  {
    id: 'noti-3',
    type: 'review',
    unread: true,
    title: 'Hãy đánh giá sản phẩm vừa nhận',
    desc: 'Bạn vừa nhận Sofa Nordic 3 chỗ. Chia sẻ trải nghiệm để nhận 50.000 điểm thưởng.',
    time: '3 giờ trước',
    dateLabel: 'Hôm nay',
    icon: 'star',
    tagLabel: 'Đánh giá',
    tagTone: 'info',
    detail: {
      'Sản phẩm': 'Sofa Nordic 3 chỗ - Màu xám',
      'Phần thưởng': '50.000 điểm LUXNEST',
      'Hạn đánh giá': '7 ngày kể từ hôm nay',
    },
    actions: [{ label: 'Đánh giá ngay', variant: 'primary' }],
  },
  {
    id: 'noti-4',
    type: 'system',
    unread: false,
    title: 'Tài khoản được xác thực thành công',
    desc: 'Email nguyenvana@gmail.com đã được xác thực. Bạn có thể sử dụng đầy đủ tính năng LUXNEST.',
    time: 'Hôm qua 14:32',
    dateLabel: 'Hôm qua',
    icon: 'check',
    tagLabel: 'Hệ thống',
    tagTone: 'success',
    detail: {
      'Loại xác thực': 'Email',
      'Tài khoản': 'nguyenvana@gmail.com',
      'Thời gian': '14:32 - 13/05/2025',
    },
    actions: [{ label: 'Xem tài khoản', variant: 'ghost' }],
  },
  {
    id: 'noti-5',
    type: 'promo',
    unread: true,
    title: 'Sản phẩm yêu thích đang giảm giá',
    desc: 'Ghế Ergonomic ProFlex trong wishlist của bạn vừa giảm 15%.',
    time: 'Hôm qua 09:10',
    dateLabel: 'Hôm qua',
    icon: 'badgePercent',
    tagLabel: 'Giá tốt',
    tagTone: 'promo',
    detail: {
      'Sản phẩm': 'Ghế Ergonomic ProFlex',
      'Giá gốc': '1.200.000 đ',
      'Giá sau giảm': '1.020.000 đ',
      'Còn lại': '8 sản phẩm',
    },
    actions: [
      { label: 'Thêm vào giỏ', variant: 'primary' },
      { label: 'Xem sản phẩm', variant: 'ghost' },
    ],
  },
  {
    id: 'noti-6',
    type: 'order',
    unread: false,
    title: 'Giao hàng thành công',
    desc: 'Đơn hàng LN250512 đã được giao thành công. Cảm ơn bạn đã mua sắm tại LUXNEST.',
    time: '02/05/2026',
    dateLabel: 'Tuần trước',
    icon: 'box',
    tagLabel: 'Hoàn tất',
    tagTone: 'done',
    detail: {
      'Mã đơn': 'LN250512',
      'Người nhận': 'Nguyễn Văn A',
      'Địa chỉ': '123 Nguyễn Huệ, Quận 1, TP.HCM',
      'Tổng tiền': '5.200.000 đ',
    },
    actions: [{ label: 'Mua lại', variant: 'ghost' }],
  },
]

let notificationsDb = clone(notificationSeed)

export async function fetchNotificationsMock() {
  await sleep()
  return buildAxiosLikeResponse({
    items: clone(notificationsDb),
  })
}

export async function markNotificationReadMock(notificationId) {
  await sleep(220)
  notificationsDb = notificationsDb.map((item) =>
    item.id === notificationId ? { ...item, unread: false } : item,
  )

  return buildAxiosLikeResponse({
    success: true,
    id: notificationId,
  })
}

export async function markAllNotificationsReadMock() {
  await sleep(260)
  notificationsDb = notificationsDb.map((item) => ({ ...item, unread: false }))

  return buildAxiosLikeResponse({
    success: true,
  })
}
