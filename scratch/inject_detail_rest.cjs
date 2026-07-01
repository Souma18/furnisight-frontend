const fs = require('fs');
const path = require('path');

const viPath = path.resolve('src/shared/i18n/locales/vi.json');
const enPath = path.resolve('src/shared/i18n/locales/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

viData.productDetail.page = {
  loading: "Đang tải sản phẩm...",
  notFoundTitle: "Sản phẩm không tồn tại",
  notFoundDesc: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
  backToList: "Quay lại danh sách",
  errorTitle: "Không thể tải sản phẩm",
  errorDesc: "Đã xảy ra lỗi kết nối. Vui lòng thử lại.",
  retry: "Thử lại"
};
viData.productDetail.modal = {
  defaultProduct: "Sản phẩm",
  title: "Trực quan 3D – {name}",
  close: "Đóng",
  tabProduct: "Sản phẩm",
  tabRoom: "Phòng đầy đủ",
  noModelDesc: "Mẫu này chưa có mô hình 3D thật. Bạn vẫn có thể xem thông tin và đặt",
  roomDesc: "Để xem sản phẩm trong không gian phòng, chuyển qua Trực quan 3D và đặt vào phòng mẫu.",
  openRoom: "Mở Trực quan 3D",
  loadingModel: "Đang tải mô hình...",
  showingModel: "Đang hiển thị mô hình sản phẩm 3D",
  navigating: "Chế độ phòng đầy đủ - điều hướng sang Room3D"
};
viData.productDetail.alerts = {
  eligibilityError: "Không thể kiểm tra điều kiện đánh giá. Vui lòng thử lại sau.",
  emptyContent: "Vui lòng nhập nội dung đánh giá.",
  submitSuccess: "Đã gửi đánh giá của bạn.",
  submitError: "Không thể gửi đánh giá. Có thể bạn đã đánh giá sản phẩm này rồi.",
  loadModelError: "Không tải được mô hình 3D."
};

enData.productDetail.page = {
  loading: "Loading product...",
  notFoundTitle: "Product not found",
  notFoundDesc: "The product you are looking for does not exist or has been deleted.",
  backToList: "Back to list",
  errorTitle: "Cannot load product",
  errorDesc: "A connection error occurred. Please try again.",
  retry: "Retry"
};
enData.productDetail.modal = {
  defaultProduct: "Product",
  title: "3D Visualizer – {name}",
  close: "Close",
  tabProduct: "Product",
  tabRoom: "Full room",
  noModelDesc: "This variant does not have a real 3D model. You can still view info and order.",
  roomDesc: "To view the product in a room space, switch to 3D Visualizer and place it in a template room.",
  openRoom: "Open 3D Visualizer",
  loadingModel: "Loading model...",
  showingModel: "Showing 3D product model",
  navigating: "Full room mode - navigating to Room3D"
};
enData.productDetail.alerts = {
  eligibilityError: "Cannot check review eligibility. Please try again later.",
  emptyContent: "Please enter review content.",
  submitSuccess: "Your review has been submitted.",
  submitError: "Cannot submit review. You may have already reviewed this product.",
  loadModelError: "Failed to load 3D model."
};

fs.writeFileSync(viPath, JSON.stringify(viData, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log('Injected remaining detail translations.');
