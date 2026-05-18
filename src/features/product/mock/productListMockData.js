export const PRODUCT_CATEGORY_HERO = {
  /** Không bắt buộc có “Trang chủ” — có thể rút gọn vì header đã có về home; `to` tùy từng mục */
  breadcrumb: [
    { label: 'Sản phẩm', to: '/products' },
    { label: 'Phòng ngủ' },
  ],
  collection: 'Danh mục · Heritage Collection',
  title: 'Nội thất Phòng ngủ',
  subtitle: 'Khám phá sản phẩm tinh tuyển cho không gian thư giãn hoàn hảo.',
  stats: [
    { value: '248', label: 'Sản phẩm' },
    { value: '12', label: 'Thương hiệu' },
    { value: '4.9★', label: 'Đánh giá TB' },
  ],
}

export const PRODUCT_QUICK_FILTERS = ['Giường ngủ', 'Tủ quần áo', 'Đầu tủ', 'Bàn trang điểm', 'Đèn ngủ', 'Sale -30%']

/** Sidebar trái — dữ liệu mock; sau này map từ API `facets`. */
export const PRODUCT_SIDEBAR_CATEGORIES = [
  { id: 'all', label: 'Tất cả phòng ngủ', count: 248 },
  { id: 'giường ngủ', label: 'Giường ngủ', count: 87 },
  { id: 'tủ quần áo', label: 'Tủ quần áo', count: 54 },
  { id: 'đầu tủ & kệ', label: 'Đầu tủ & kệ', count: 38 },
  { id: 'bàn trang điểm', label: 'Bàn trang điểm', count: 29 },
  { id: 'đèn & phụ kiện', label: 'Đèn & phụ kiện', count: 40 },
]

export const PRODUCT_SIDEBAR_MATERIALS = [
  { id: 'walnut', label: 'Gỗ Walnut Mỹ' },
  { id: 'oak', label: 'Gỗ Sồi (Oak)' },
  { id: 'ash', label: 'Gỗ Tần bì (Ash)' },
  { id: 'mdf', label: 'MDF cao cấp' },
  { id: 'metal-wood', label: 'Kim loại & Gỗ' },
]

export const PRODUCT_PRICE_BAND_OPTIONS = [
  { id: 'lt5m', label: 'Dưới 5.000.000đ' },
  { id: '5-15m', label: '5 – 15.000.000đ' },
  { id: '15-30m', label: '15 – 30.000.000đ' },
  { id: 'gt30m', label: 'Trên 30.000.000đ' },
]

export const PRODUCT_STAR_FILTER_OPTIONS = [
  { value: 5, stars: '★★★★★', hint: '(97)' },
  { value: 4, stars: '★★★★☆', hint: '4 sao+ (142)' },
  { value: 3, stars: '★★★☆☆', hint: '3 sao+ (189)' },
]

export const PRODUCT_SIDEBAR_COLORS = [
  { id: 'walnut-brown', label: 'Walnut Nâu', hex: '#c4903a' },
  { id: 'ebony', label: 'Đen Ebony', hex: '#2a2a2a' },
  { id: 'teak', label: 'Nâu Teak', hex: '#8b6340' },
  { id: 'cream', label: 'Kem Sáng', hex: '#d4b896' },
  { id: 'nordic-gray', label: 'Xám Bắc Âu', hex: '#b8c4cc' },
  { id: 'ivory', label: 'Trắng Ngà', hex: '#f5f5f0' },
]

export const PRODUCT_LIST_MOCK_ITEMS = [
  {
    id: 'pl-1',
    detailId: 'oak-bed',
    category: 'Giường ngủ',
    materials: ['walnut'],
    colorIds: ['walnut-brown', 'ebony'],
    name: 'Giường ngủ Walnut Premium Heritage 2024',
    rating: 4.9,
    ratingCount: 128,
    price: 12500000,
    oldPrice: 15600000,
    tags: ['new', 'sale'],
    imageFallback: '🛏️',
    description: 'Giường gỗ cao cấp chuẩn boutique, phù hợp phòng ngủ master.',
  },
  {
    id: 'pl-2',
    detailId: 'agape-bed',
    category: 'Giường ngủ',
    materials: ['walnut', 'mdf'],
    colorIds: ['cream', 'walnut-brown'],
    name: 'Giường Agape Premium',
    rating: 4.8,
    ratingCount: 86,
    price: 5900000,
    oldPrice: 7100000,
    tags: ['new'],
    imageFallback: '🛏️',
    description: 'Form bo mềm hiện đại, dễ phối với nội thất tông ấm.',
  },
  {
    id: 'pl-3',
    detailId: 'ergonomic-chair',
    category: 'Ghế',
    materials: ['metal-wood', 'mdf'],
    colorIds: ['nordic-gray', 'ebony'],
    name: 'Ghế Ergonomic ProFlex',
    rating: 4.6,
    ratingCount: 96,
    price: 1200000,
    oldPrice: 1450000,
    tags: ['hot', 'ai'],
    imageFallback: '🪑',
    description: 'Ghế công thái học hỗ trợ làm việc dài giờ.',
  },
  {
    id: 'pl-4',
    detailId: 'nordic-sofa',
    category: 'Sofa',
    materials: ['mdf', 'oak'],
    colorIds: ['cream', 'nordic-gray'],
    name: 'Sofa Nordic 3 chỗ',
    rating: 4.7,
    ratingCount: 72,
    price: 8500000,
    oldPrice: 10200000,
    tags: ['sale'],
    imageFallback: '🛋️',
    description: 'Sofa tối giản phong cách Bắc Âu cho căn hộ hiện đại.',
  },
  {
    id: 'pl-5',
    detailId: 'tea-table',
    category: 'Bàn trà',
    materials: ['oak', 'metal-wood'],
    colorIds: ['teak', 'ivory'],
    name: 'Đôn trà tròn Minimalist',
    rating: 4.5,
    ratingCount: 54,
    price: 860000,
    oldPrice: 990000,
    tags: ['ai'],
    imageFallback: '🌿',
    description: 'Bàn trà nhỏ gọn cho góc thư giãn.',
  },
  {
    id: 'pl-6',
    detailId: null,
    category: 'Tủ quần áo',
    materials: ['walnut', 'ash'],
    colorIds: ['walnut-brown', 'nordic-gray'],
    name: 'Tủ quần áo 4 cánh Walnut Nordic',
    rating: 4.8,
    ratingCount: 63,
    price: 18000000,
    oldPrice: 24000000,
    tags: ['sale'],
    imageFallback: '🗄️',
    description: 'Tủ lớn lưu trữ linh hoạt, hoàn thiện veneer walnut.',
  },
]

export function formatVnd(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}
