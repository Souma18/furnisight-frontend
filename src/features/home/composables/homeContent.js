export const homeHero = {
  tag: 'AI-Powered 3D Interior Design',
  titleTop: 'Trang trí nhà với',
  titleEmphasis: 'trí tuệ',
  titleBottom: 'nhân tạo trực quan',
  subtitle:
    'Tải ảnh phòng của bạn - AI phân tích không gian, gợi ý nội thất phù hợp và trực quan hóa ngay dạng mô hình 3D tương tác.',
}

export const homeFeatures = [
  { icon: 'truck', title: 'Mien phi giao hang', subtitle: 'Don tu 5 trieu VND' },
  { icon: 'refresh', title: 'Doi tra 30 ngay', subtitle: 'Khong can ly do' },
  { icon: 'shield', title: 'Bao hanh 2 nam', subtitle: 'Toan bo san pham' },
  { icon: 'phone', title: 'Ho tro 24/7', subtitle: 'Tu van thiet ke' },
]

export const homeTestimonials = [
  {
    id: 1,
    name: 'Nguyen Thi Hoa',
    role: 'Khach hang tai Ha Noi',
    text: 'Tinh nang truc quan 3D rat an tuong. Toi co the nhin thay chiec sofa phu hop truoc khi mua.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Tran Minh Duc',
    role: 'Khach hang tai TP.HCM',
    text: 'AI goi y kha dung cho phong ngu nho, toi tiet kiem kha nhieu thoi gian khi chon do.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Le Thu Phuong',
    role: 'Khach hang tai Da Nang',
    text: 'Tai anh phong bep len la co ngay danh sach noi that. Trai nghiem mua sam kha muot.',
    rating: 4,
  },
]

export const roomFallbacks = {
  'Phòng ngủ': { image: '/home/rooms/bedroom.jpg', isBig: true },
  'Phòng khách': { image: '/home/rooms/livingroom.jpeg', isBig: false },
  'Phòng tắm': { image: '/home/rooms/bathroom.jpg', isBig: false },
  'Phòng bếp': { image: '/home/rooms/kitchanroom.jpeg', isBig: false },
  'Phòng đọc sách': { image: '/home/rooms/readingroom.jpg', isBig: false },
  'Living Room': { image: '/home/rooms/livingroom.jpeg', isBig: false },
  Bedroom: { image: '/home/rooms/bedroom.jpg', isBig: true },
  Kitchen: { image: '/home/rooms/kitchanroom.jpeg', isBig: false },
  Bathroom: { image: '/home/rooms/bathroom.jpg', isBig: false },
  'Study Room': { image: '/home/rooms/readingroom.jpg', isBig: false },
  'Dining Room': { image: '/home/rooms/kitchanroom.jpeg', isBig: false },
  Workspace: { image: '/home/rooms/readingroom.jpg', isBig: false },
}
