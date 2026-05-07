export const homeNavItems = [
  { label: 'Trang Chu', href: '#', active: true },
  { label: 'San pham', href: '#products' },
  { label: 'Truc quan 3D', href: '/room3d' },
  { label: 'Du an', href: '#rooms' },
  { label: 'Lien he', href: '#footer' },
]

export const homeHero = {
  tag: 'AI-Powered 3D Interior Design',
  titleTop: 'Trang trí nhà với',
  titleEmphasis: 'trí tuệ',
  titleBottom: 'nhân tạo trực quan',
  subtitle:
    'Tải ảnh phòng của bạn - AI phân tích không gian, gợi ý nội thất phù hợp và trực quan hóa ngay dạng mô hình 3D tương tác.',
  stats: [
    { value: '300+', label: 'San pham 3D' },
    { value: '12K', label: 'Du an hoan thanh' },
    { value: '1 Nam', label: 'Dong hanh' },
  ],
}

export const homeFeatures = [
  { icon: '🚚', title: 'Mien phi giao hang', subtitle: 'Don tu 5 trieu VND' },
  { icon: '🔄', title: 'Doi tra 30 ngay', subtitle: 'Khong can ly do' },
  { icon: '🛡️', title: 'Bao hanh 2 nam', subtitle: 'Toan bo san pham' },
  { icon: '📞', title: 'Ho tro 24/7', subtitle: 'Tu van thiet ke' },
]

export const homeCategories = [
  { id: 'ghe', icon: '🪑', name: 'Ghe', count: '19 san pham' },
  { id: 'giuong', icon: '🛏️', name: 'Giuong', count: '12 san pham' },
  { id: 'ban', icon: '🪞', name: 'Ban', count: '24 san pham' },
  { id: 'sofa', icon: '🛋️', name: 'Sofa', count: '8 san pham' },
  { id: 'tu-ke', icon: '📚', name: 'Tu ke', count: '16 san pham' },
  { id: 'den', icon: '💡', name: 'Den', count: '31 san pham' },
]

export const homeRoomFilters = ['Tat ca', 'Phong ngu', 'Phong khach', 'Phong bep', 'Phong lam viec']

export const homeRooms = [
  {
    id: 'modern-oak',
    type: 'Phòng ngủ',
    name: 'Bộ sưu tập Modern Oak',
    count: '12 san pham',
    isBig: true,
    placeholder: '',
    // TODO: replace mock image path with real image.
    image: '/home/rooms/bedroom.jpg',
  },
  {
    id: 'nordic-living',
    type: 'Phòng khách',
    name: 'Nordic Living',
    count: '8 san pham',
    placeholder: '🛋️',
    // TODO: replace mock image path with real image.
    image: '/home/rooms/livingroom.jpeg',
  },
  {
    id: 'wfh',
    type: 'Phòng tắm',
    name: 'Work From Home',
    count: '6 san pham',
    placeholder: '',
    // TODO: replace mock image path with real image.
    image: '/home/rooms/bathroom.jpg',
  },
  {
    id: 'kitchen',
    type: 'Phong bep',
    name: 'Kitchen Essential',
    count: '15 san pham',
    placeholder: '',
    // TODO: replace mock image path with real image.
    image: '/home/rooms/kitchanroom.jpeg',
  },
  {
    id: 'balcony',
    type: 'Phòng đọc sách',
    name: 'Quiet Reading Nook',
    count: '9 san pham',
    placeholder: '',
    // TODO: replace mock image path with real image.
    image: '/home/rooms/readingroom.jpg',
  },
]

export const homeProducts = [
  {
    id: 'ergonomic-chair',
    category: 'Ghe van phong',
    name: 'Ghe Ergonomic ProFlex',
    price: '1.200.000 d',
    oldPrice: '',
    tag: 'HOT',
    tagType: 'hot',
    placeholder: '🪑',
    // TODO: replace mock image path with real image.
    image: '/home/products/ergonomic-proflex.jpg',
  },
  {
    id: 'oak-bed',
    category: 'Giuong ngu',
    name: 'Giuong Go Soi Minimalist',
    price: '5.200.000 d',
    oldPrice: '',
    tag: 'NEW',
    tagType: 'new',
    placeholder: '🛏️',
    // TODO: replace mock image path with real image.
    image: '/home/products/oak-bed.jpg',
  },
  {
    id: 'nordic-sofa',
    category: 'Sofa',
    name: 'Sofa Nordic 3 cho',
    price: '8.500.000 d',
    oldPrice: '10.200.000 d',
    tag: 'SALE',
    tagType: 'sale',
    placeholder: '🛋️',
    // TODO: replace mock image path with real image.
    image: '/home/products/nordic-sofa.jpg',
  },
  {
    id: 'tea-table',
    category: 'Trang tri',
    name: 'Don tra tron Minimalist',
    price: '860.000 d',
    oldPrice: '',
    tag: 'AI+',
    tagType: 'ai',
    placeholder: '🌿',
    // TODO: replace mock image path with real image.
    image: '/home/products/tea-table.jpg',
  },
]

export const homeTestimonials = [
  {
    id: 1,
    name: 'Nguyen Thi Hoa',
    role: 'Khach hang tai Ha Noi',
    text: 'Tinh nang truc quan 3D rat an tuong. Toi co the nhin thay chiec sofa phu hop truoc khi mua.',
    stars: '★★★★★',
  },
  {
    id: 2,
    name: 'Tran Minh Duc',
    role: 'Khach hang tai TP.HCM',
    text: 'AI goi y kha dung cho phong ngu nho, toi tiet kiem kha nhieu thoi gian khi chon do.',
    stars: '★★★★★',
  },
  {
    id: 3,
    name: 'Le Thu Phuong',
    role: 'Khach hang tai Da Nang',
    text: 'Tai anh phong bep len la co ngay danh sach noi that. Trai nghiem mua sam kha muot.',
    stars: '★★★★☆',
  },
]
