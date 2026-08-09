const fs = require('fs');
const path = require('path');

const viPath = path.resolve('src/shared/i18n/locales/vi.json');
const enPath = path.resolve('src/shared/i18n/locales/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

viData.productDetail.top.listedPrice = "Giá niêm yết";
viData.productDetail.top.quantity = "Số lượng";
viData.productDetail.top.optionsLabel = "Lựa chọn phiên bản";

enData.productDetail.top.listedPrice = "Listed price";
enData.productDetail.top.quantity = "Quantity";
enData.productDetail.top.optionsLabel = "Select variant";

fs.writeFileSync(viPath, JSON.stringify(viData, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log('Injected price translations.');
