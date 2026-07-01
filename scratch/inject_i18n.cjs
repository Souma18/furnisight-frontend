const fs = require('fs');
const path = require('path');

const viPath = path.resolve('src/shared/i18n/locales/vi.json');
const enPath = path.resolve('src/shared/i18n/locales/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const productDetailVi = {
  tabs: {
    desc: "Mô tả sản phẩm",
    spec: "Thông số kỹ thuật",
    review: "Đánh giá ({count})"
  },
  desc: {
    overview: "Tổng quan",
    title: "Mô tả sản phẩm"
  },
  spec: {
    basic: "Thông số cơ bản",
    full: "Chi tiết kỹ thuật đầy đủ",
    keys: {
      material: "Chất liệu chính",
      color: "Màu sắc",
      dimension: "Kích thước",
      weight: "Khối lượng",
      warranty: "Bảo hành",
      stock: "Tồn kho",
      category: "Danh mục"
    },
    values: {
      items: "{count} sản phẩm"
    }
  },
  review: {
    count: "{count} đánh giá",
    write: "Viết đánh giá",
    checking: "Đang kiểm tra điều kiện đánh giá...",
    loginReq: "Đăng nhập để kiểm tra điều kiện đánh giá.",
    purchaseReq: "Bạn cần mua và nhận sản phẩm trước khi đánh giá.",
    noOrder: "Không tìm thấy dòng đơn hàng hợp lệ để đánh giá.",
    readyMsg: "Chia sẻ trải nghiệm thực tế của bạn về sản phẩm.",
    loginBtn: "Đăng nhập",
    selectedStars: "Đã chọn {n} sao",
    titlePlaceholder: "Tiêu đề đánh giá",
    contentPlaceholder: "Cảm nhận của bạn về sản phẩm",
    submitting: "Đang gửi...",
    submitBtn: "Gửi đánh giá",
    customer: "Khách hàng"
  },
  muted: "Nội dung tab đang được chuẩn hóa theo mẫu."
};

const productDetailEn = {
  tabs: {
    desc: "Description",
    spec: "Specifications",
    review: "Reviews ({count})"
  },
  desc: {
    overview: "Overview",
    title: "Product description"
  },
  spec: {
    basic: "Basic specifications",
    full: "Full technical details",
    keys: {
      material: "Main material",
      color: "Color",
      dimension: "Dimensions",
      weight: "Weight",
      warranty: "Warranty",
      stock: "In stock",
      category: "Category"
    },
    values: {
      items: "{count} items"
    }
  },
  review: {
    count: "{count} reviews",
    write: "Write a review",
    checking: "Checking review eligibility...",
    loginReq: "Log in to check review eligibility.",
    purchaseReq: "You must purchase and receive this product to review it.",
    noOrder: "No eligible order item found for review.",
    readyMsg: "Share your real experience with this product.",
    loginBtn: "Log in",
    selectedStars: "{n} stars selected",
    titlePlaceholder: "Review title",
    contentPlaceholder: "Your thoughts on this product",
    submitting: "Submitting...",
    submitBtn: "Submit review",
    customer: "Customer"
  },
  muted: "Tab content is being standardized."
};

viData.productDetail = productDetailVi;
enData.productDetail = productDetailEn;

fs.writeFileSync(viPath, JSON.stringify(viData, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log('Injected translations.');
