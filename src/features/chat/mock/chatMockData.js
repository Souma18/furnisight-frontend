export const CHAT_AGENT = {
  name: 'LUXNEST Assistant',
  badge: 'AI',
  status: 'Đang hoạt động · phản hồi ngay',
}

export const CHAT_QUICK_CHIPS = [
  { id: 'bedroom', label: '🛏️ Tư vấn phòng ngủ', text: 'Tôi muốn tư vấn nội thất phòng ngủ' },
  { id: 'order', label: '📦 Theo dõi đơn hàng', text: 'Theo dõi đơn hàng của tôi' },
  { id: 'return', label: '🔄 Đổi trả', text: 'Chính sách đổi trả là gì?' },
  { id: 'promo', label: '🎁 Khuyến mãi', text: 'Có khuyến mãi gì không?' },
]

export const CHAT_WELCOME_MESSAGES = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content:
      'Xin chào! 👋 Tôi là <strong>LUXNEST AI Assistant</strong>, sẵn sàng giúp bạn tìm nội thất hoàn hảo cho không gian sống.<br><br>Bạn cần hỗ trợ gì hôm nay?',
    createdAt: '2026-05-15T15:24:00',
  },
  {
    id: 'welcome-2',
    role: 'assistant',
    content: '✨ Một số sản phẩm nổi bật tuần này:',
    products: [
      {
        id: 'sofa-nordic',
        name: 'Nordic 3 chỗ',
        category: 'Sofa',
        price: 8500000,
        image: 'https://cdn-icons-png.flaticon.com/128/3669/3669880.png',
        variant: 'Xám nhạt / 3 chỗ',
      },
      {
        id: 'bed-walnut',
        name: 'Walnut Premium',
        category: 'Giường',
        price: 12500000,
        image: 'https://cdn-icons-png.flaticon.com/128/2649/2649615.png',
        variant: 'Walnut / King 180cm',
      },
    ],
    createdAt: '2026-05-15T15:24:00',
  },
]

export const CHAT_KEYWORD_RESPONSES = [
  {
    keys: ['phòng ngủ', 'giường', 'ngủ'],
    reply:
      '🛏️ Tuyệt vời! Phong cách phòng ngủ yêu thích của bạn là gì? <strong>Japandi</strong> (tối giản), <strong>Nordic</strong> (ấm áp) hay <strong>Classic</strong> (cổ điển)?',
    product: null,
  },
  {
    keys: ['sofa', 'phòng khách', 'ghế'],
    reply:
      '🛋️ Chúng tôi có bộ sưu tập sofa cao cấp! <strong>Sofa Nordic 3 chỗ</strong> đang được khuyến mãi 30% — rất phù hợp cho không gian Scandinavian.',
    product: {
      id: 'sofa-nordic',
      name: 'Sofa Nordic 3 chỗ',
      category: 'Ghế sofa',
      price: 8500000,
      image: 'https://cdn-icons-png.flaticon.com/128/3669/3669880.png',
      variant: 'Xám nhạt / 3 chỗ',
    },
  },
  {
    keys: ['đơn hàng', 'theo dõi', 'giao hàng', 'vận chuyển'],
    reply:
      '📦 Tôi thấy đơn hàng <strong>#LX-2026-0948</strong> của bạn đang được vận chuyển bởi GHN Express. Dự kiến giao <strong>19–21/05/2026</strong>. Bạn có muốn xem chi tiết không?',
    product: null,
  },
  {
    keys: ['đổi', 'trả', 'hoàn', 'chính sách'],
    reply:
      '🔄 LUXNEST hỗ trợ <strong>đổi trả miễn phí trong 30 ngày</strong> kể từ ngày nhận hàng. Sản phẩm cần còn nguyên vẹn, đầy đủ phụ kiện. Bạn cần hỗ trợ đổi trả cụ thể không?',
    product: null,
  },
  {
    keys: ['khuyến mãi', 'giảm giá', 'sale', 'ưu đãi'],
    reply:
      '🎁 Hiện có <strong>Flash Sale cuối tuần giảm 30%</strong> cho bộ sưu tập Heritage Collection! Chỉ còn <strong>2 ngày</strong>. Dùng mã <strong style="color:#c9922a">HERITAGE30</strong> khi thanh toán.',
    product: null,
  },
  {
    keys: ['giá', 'bao nhiêu', 'chi phí'],
    reply:
      '💰 Sản phẩm LUXNEST có mức giá từ <strong>500.000₫</strong> (phụ kiện) đến <strong>50.000.000₫</strong> (bộ nội thất cao cấp). Bạn có ngân sách dự kiến cho không gian nào không? Tôi sẽ tư vấn chính xác hơn!',
    product: null,
  },
  {
    keys: ['3d', 'trực quan', 'thiết kế', 'phòng'],
    reply:
      '🏠 Tính năng <strong>Trực quan 3D</strong> cho phép bạn tải ảnh phòng lên, AI sẽ phân tích không gian và gợi ý nội thất phù hợp rồi render mô hình 3D ngay lập tức. Bạn muốn thử không?',
    product: null,
  },
]

export const CHAT_FALLBACK_REPLIES = [
  'Cảm ơn bạn đã nhắn tin! Bạn có thể cho tôi biết thêm để tôi tư vấn chính xác hơn không? 😊',
  'Tôi hiểu rồi! Để hỗ trợ tốt nhất, bạn có thể mô tả không gian bạn muốn trang trí không?',
  'Thông tin thú vị đấy! 🌟 Bạn muốn tôi gợi ý sản phẩm cụ thể hay tư vấn về phong cách thiết kế?',
  'Tôi sẽ chuyển câu hỏi này đến chuyên viên tư vấn nội thất của LUXNEST nhé! ⏱️ Thường phản hồi trong 5 phút.',
]
