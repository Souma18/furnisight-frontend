const fs = require('fs');
const path = require('path');

const viPath = path.resolve('src/shared/i18n/locales/vi.json');
const enPath = path.resolve('src/shared/i18n/locales/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

viData.productDetail.top = {
  reviews: "{count} đánh giá",
  inStock: "Còn hàng ({count} sản phẩm)",
  outOfStock: "Tạm hết hàng",
  soldOut: "Hết hàng",
  adding: "Đang thêm...",
  added: "Đã thêm",
  add: "Thêm vào giỏ",
  processing: "Đang xử lý...",
  buyNow: "Mua ngay",
  noModel3D: "Phiên bản này chưa có mô hình 3D."
};

enData.productDetail.top = {
  reviews: "{count} reviews",
  inStock: "In stock ({count} items)",
  outOfStock: "Out of stock",
  soldOut: "Sold out",
  adding: "Adding...",
  added: "Added",
  add: "Add to cart",
  processing: "Processing...",
  buyNow: "Buy now",
  noModel3D: "This variant does not have a 3D model."
};

fs.writeFileSync(viPath, JSON.stringify(viData, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log('Injected top translations.');
