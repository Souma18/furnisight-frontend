export const CONTACT_BREADCRUMB = [{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]

export const CONTACT_HERO = {
  label: 'Liên hệ & Tư vấn',
  titleLine1: 'Chúng tôi sẵn sàng',
  titleLine2Prefix: 'lắng nghe ',
  titleAccent: 'bạn',
  titleLine2Suffix: '',
  subtitle:
    'Từ câu hỏi về sản phẩm đến tư vấn thiết kế toàn bộ căn nhà - đội ngũ LUXNEST luôn ở đây để đồng hành cùng bạn.',
  quickActions: [
    { label: 'Gửi tin nhắn', href: '#contact-form', variant: 'primary', icon: 'mail' },
    { label: 'Đặt lịch tư vấn', href: '#contact-booking', variant: 'ghost', icon: 'calendar' },
  ],
  infoCards: [
    {
      id: 'hotline',
      icon: 'phone',
      label: 'Hotline',
      value: '1800 6868 (miễn phí)',
      sub: 'Thứ 2 - Chủ nhật · 8:00 - 21:00',
    },
    {
      id: 'chat',
      icon: 'messageCircle',
      label: 'Chat trực tuyến',
      value: 'Phản hồi trong < 5 phút',
      sub: 'Đang online - 3 tư vấn viên',
      accent: 'success',
    },
    {
      id: 'showroom',
      icon: 'store',
      label: 'Showroom',
      value: '123 Nguyễn Đình Chiểu, Q.3, TP.HCM',
      sub: 'Xem thực tế 300+ sản phẩm',
    },
  ],
}

export const CONTACT_FORM_CONFIG = {
  tag: 'Gửi yêu cầu',
  titleLine1: 'Hãy kể cho chúng tôi',
  titleLine2Prefix: 'về ',
  titleAccent: 'không gian của bạn',
  titleLine2Suffix: '',
  note:
    'Chúng tôi sẽ phản hồi trong vòng 2 giờ làm việc. Thông tin của bạn được bảo mật tuyệt đối.',
  intents: [
    {
      id: 'general',
      label: 'Hỏi chung',
      icon: 'messageCircle',
      placeholder: 'Bạn có câu hỏi gì? Chúng tôi sẽ trả lời sớm nhất có thể...',
    },
    {
      id: 'design',
      label: 'Tư vấn TK',
      icon: 'house',
      placeholder: 'Mô tả thêm yêu cầu của bạn...',
      showDesignFields: true,
    },
    {
      id: 'order',
      label: 'Đơn hàng',
      icon: 'box',
      placeholder: 'Mã đơn hàng, sản phẩm, vấn đề cần hỗ trợ...',
    },
    {
      id: 'partner',
      label: 'Hợp tác',
      icon: 'handshake',
      placeholder: 'Giới thiệu về công ty bạn và hình thức hợp tác mong muốn...',
    },
  ],
  roomTypes: [
    'Phòng ngủ',
    'Phòng khách',
    'Phòng ăn',
    'Nhà bếp',
    'Văn phòng',
    'Toàn bộ căn hộ',
  ],
  areaOptions: ['Dưới 15m²', '15 - 25m²', '25 - 40m²', '40 - 70m²', 'Trên 70m²'],
  budgetOptions: ['Dưới 30tr', '30 - 80tr', '80 - 150tr', '150tr - 300tr', 'Trên 300tr'],
  initialBudget: '30 - 80tr',
}

export const CONTACT_SIDEBAR = {
  consultant: {
    avatarIcon: 'user',
    name: 'Huỳnh Minh Hiển',
    role: 'Chuyên gia tư vấn thiết kế',
    onlineText: 'Đang trực tuyến',
    description:
      'Hơn 8 năm kinh nghiệm trong thiết kế nội thất. Sẵn sàng tư vấn miễn phí cho dự án của bạn.',
    actions: [
      { id: 'chat', label: 'Chat ngay - Miễn phí', icon: 'messageCircle', href: '#' },
      { id: 'booking', label: 'Đặt lịch gọi video', icon: 'calendar', href: '#contact-booking', ghost: true },
    ],
  },
  contactInfo: [
    {
      id: 'hotline',
      icon: 'phone',
      label: 'Hotline (miễn phí)',
      value: '1800 6868',
      href: 'tel:18006868',
    },
    {
      id: 'email',
      icon: 'mail',
      label: 'Email',
      value: 'hello@luxnest.vn',
      href: 'mailto:hello@luxnest.vn',
    },
    {
      id: 'hcm',
      icon: 'mapPin',
      label: 'Showroom TP.HCM',
      value: '123 Nguyễn Đình Chiểu, Q.3, TP.HCM',
    },
    {
      id: 'hn',
      icon: 'mapPin',
      label: 'Showroom Hà Nội',
      value: '456 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    },
  ],
  socials: [
    { id: 'facebook', label: 'Facebook', icon: 'facebook', href: '#' },
    { id: 'instagram', label: 'Instagram', icon: 'instagram', href: '#' },
    { id: 'youtube', label: 'YouTube', icon: 'youtube', href: '#' },
    { id: 'tiktok', label: 'TikTok', icon: 'music2', href: '#' },
    { id: 'zalo', label: 'Zalo', icon: 'messagesSquare', href: '#' },
  ],
  hours: [
    { id: 'weekday', day: 'Thứ 2 - Thứ 6', time: '8:00 - 21:00' },
    { id: 'sat', day: 'Thứ 7', time: '8:00 - 20:00' },
    { id: 'sun', day: 'Chủ nhật', time: '9:00 - 18:00' },
    { id: 'chat', day: 'Chat online', time: '24/7', accent: 'success' },
  ],
}

export const CONTACT_BOOKING_SECTION = {
  label: 'Đặt lịch',
  titleLine1: 'Chọn hình thức',
  titleLine2Prefix: 'tư vấn',
  titleAccent: '',
  titleLine2Suffix: ' phù hợp',
  subtitle:
    'Miễn phí hoàn toàn - các chuyên gia của chúng tôi sẽ giúp bạn định hình không gian lý tưởng.',
}

export const CONTACT_BOOKING_OPTIONS = [
  {
    id: 'video',
    type: 'Online',
    icon: 'video',
    name: 'Tư vấn Video Call',
    description:
      'Kết nối trực tiếp với chuyên gia qua Zoom/Meet. Chia sẻ màn hình và xem demo 3D cùng nhau.',
    duration: '30 - 60 phút · Miễn phí',
    buttonLabel: 'Đặt lịch ngay',
    popular: true,
  },
  {
    id: 'showroom',
    type: 'Trực tiếp',
    icon: 'store',
    name: 'Tham quan Showroom',
    description:
      'Đến showroom trải nghiệm thực tế 300+ sản phẩm và thử chức năng 3D trên màn hình lớn.',
    duration: 'Linh hoạt · Miễn phí',
    buttonLabel: 'Đặt lịch tham quan',
  },
  {
    id: 'home',
    type: 'Tại nhà',
    icon: 'house',
    name: 'Tư vấn tại nhà bạn',
    description:
      'Chuyên gia đến tận nơi, đo đạc không gian thực tế và tư vấn chi tiết theo nhu cầu cụ thể.',
    duration: '1 - 2 giờ · TP.HCM & Hà Nội',
    buttonLabel: 'Đặt lịch hẹn',
  },
]

export const CONTACT_FAQ_SECTION = {
  label: 'Câu hỏi thường gặp',
  titleLine1: 'Bạn cần',
  titleLine2Prefix: '',
  titleAccent: 'biết gì thêm?',
  titleLine2Suffix: '',
}

export const CONTACT_FAQS = [
  {
    id: 'free-3d',
    question: 'Tính năng trực quan 3D có miễn phí không?',
    answer:
      'Hoàn toàn miễn phí! Bạn chỉ cần tải ảnh phòng lên, AI sẽ phân tích và tạo mô hình 3D ngay lập tức. Không cần đăng ký tài khoản để dùng thử.',
    open: true,
  },
  {
    id: 'shipping-time',
    question: 'Thời gian giao hàng trung bình bao lâu?',
    answer:
      'Thông thường 3-5 ngày làm việc trong nội thành TP.HCM và Hà Nội. Các tỉnh thành khác 5-7 ngày. Sản phẩm đặt riêng có thể cần 2-4 tuần.',
  },
  {
    id: 'return-policy',
    question: 'Có thể đổi trả sản phẩm không?',
    answer:
      'Chính sách đổi trả 30 ngày miễn phí nếu sản phẩm có lỗi từ nhà sản xuất. Sản phẩm nguyên vẹn chưa qua sử dụng có thể đổi trong 7 ngày.',
  },
  {
    id: 'ai-accuracy',
    question: 'AI có nhận diện đúng loại phòng của tôi không?',
    answer:
      'Độ chính xác nhận diện loại phòng đạt 94% với ảnh rõ ràng. Nếu AI nhận diện sai, bạn có thể chọn lại thủ công trong vòng 2 click - và AI sẽ cập nhật gợi ý ngay lập tức.',
  },
  {
    id: 'design-fee',
    question: 'Tư vấn thiết kế có tính phí không?',
    answer:
      'Buổi tư vấn đầu tiên (online hoặc tại showroom) hoàn toàn miễn phí. Tư vấn tại nhà bạn miễn phí trong TP.HCM và Hà Nội khi ngân sách dự án từ 50 triệu trở lên.',
  },
  {
    id: 'showroom-visit',
    question: 'Có thể xem sản phẩm thực tế trước khi mua không?',
    answer:
      'Có! Showroom của chúng tôi tại TP.HCM và Hà Nội trưng bày hơn 300 sản phẩm thực tế. Bạn có thể đặt lịch tham quan hoặc ghé thăm trong giờ làm việc mà không cần hẹn trước.',
  },
]

export const CONTACT_DEFAULT_TOAST = {
  title: 'Đã gửi thành công!',
  subtitle: 'Chúng tôi sẽ phản hồi trong vòng 2 giờ làm việc.',
}
