function sleep(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const profile = {
  firstName: 'Văn A',
  lastName: 'Nguyễn',
  email: 'nguyenvana@gmail.com',
  phone: '0901 234 567',
  birthday: '1995-06-15',
  gender: 'male',
  bio: 'Tôi yêu thích thiết kế nội thất phong cách Nordic và Japandi.',
  initials: 'NA',
  vip: true,
  avatarUrl: '',
}

const addresses = [
  {
    id: 'addr-1',
    fullName: 'Nguyễn Văn A',
    phone: '0901 234 567',
    detail: '123 Đường Nguyễn Huệ',
    wardName: 'Phường Bến Nghé',
    districtName: 'Quận 1',
    provinceName: 'TP. Hồ Chí Minh',
    type: 'home',
    isDefault: true,
  },
  {
    id: 'addr-2',
    fullName: 'Nguyễn Văn A (Văn phòng)',
    phone: '0901 234 567',
    detail: '456 Lê Lợi',
    wardName: 'Phường Bến Thành',
    districtName: 'Quận 1',
    provinceName: 'TP. Hồ Chí Minh',
    type: 'office',
    isDefault: false,
  },
]

const orders = [
  { id: 'LN250523', status: 'delivering', date: '23/05/2025', total: 11820000, items: 3 },
  { id: 'LN250512', status: 'delivering', date: '12/05/2025', total: 5200000, items: 1 },
  { id: 'LN250418', status: 'done', date: '18/04/2025', total: 4450000, items: 2 },
]

const cartItems = [
  {
    id: 'cart-1',
    detailId: 'nordic-sofa',
    name: 'Sofa Nordic 3 chỗ ngồi',
    qty: 1,
    price: 8500000,
    imageFallback: '🛋️',
    selectedColor: 'Be sáng',
    selectedSize: '2m1 × 95cm',
    outOfStock: true,
  },
  {
    id: 'cart-2',
    detailId: 'ergonomic-chair',
    name: 'Ghế ergonomic ProFlex X1',
    qty: 2,
    price: 1200000,
    imageFallback: '🪑',
    selectedColor: 'Xám đá',
    selectedSize: 'Tiêu chuẩn',
  },
  {
    id: 'cart-3',
    detailId: 'tea-table',
    name: 'Đèn treo trần Rattan Boho',
    qty: 1,
    price: 920000,
    imageFallback: '💡',
    selectedColor: 'Nâu gỗ',
    selectedSize: 'Ø60 × 45cm',
  },
]

const wishlist = [
  { id: 'wish-1', name: 'Giường ngủ gỗ sồi Minimalist', price: 5200000 },
  { id: 'wish-2', name: 'Tủ quần áo 4 cánh', price: 3800000 },
  { id: 'wish-3', name: 'Sofa da thật nhập khẩu', price: 12500000 },
]

const settings = {
  orderEmail: true,
  deliveryEmail: true,
  marketingEmail: true,
  aiSuggestionEmail: true,
  smsOrder: true,
  browserPush: false,
  twoFactorSms: true,
  twoFactorApp: false,
}

const projects = [
  { id: 'prj-1', name: 'Phòng ngủ chính', updatedAt: '23/05/2025', items: 4 },
  { id: 'prj-2', name: 'Phòng khách mới', updatedAt: '18/05/2025', items: 6 },
]

export async function fetchAccountOverviewMock() {
  await sleep()
  return {
    profile,
    addresses,
    orders,
    cartItems,
    wishlist,
    settings,
    projects,
  }
}

export async function saveProfileMock(payload) {
  await sleep()
  return { ...profile, ...payload }
}

export async function saveAddressMock(payload) {
  await sleep()
  return { id: `addr-${Date.now()}`, ...payload }
}

export async function uploadAvatarMock(file) {
  await sleep()
  // TODO(BE): replace with accountApi.uploadAvatar(file)
  const previewUrl = URL.createObjectURL(file)
  return {
    avatarUrl: previewUrl,
  }
}
