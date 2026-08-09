const fs = require('fs');
const path = require('path');

const viPath = path.resolve('src/shared/i18n/locales/vi.json');
const enPath = path.resolve('src/shared/i18n/locales/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

viData.orders = {
  status: {
    all: 'Tất cả',
    unpaid: 'Chờ thanh toán',
    unpaid_cod: 'Đã đặt đơn',
    payment_failed: 'Thanh toán thất bại',
    paid: 'Đã thanh toán',
    shipping: 'Đang vận chuyển',
    in_transit: 'Đang giao',
    delivered: 'Đã nhận',
    cancelled: 'Đã hủy',
    refund_pending: 'Chờ hoàn tiền',
    refunded: 'Đã hoàn tiền'
  }
};

enData.orders = {
  status: {
    all: 'All',
    unpaid: 'Pending payment',
    unpaid_cod: 'Order placed',
    payment_failed: 'Payment failed',
    paid: 'Paid',
    shipping: 'Shipping',
    in_transit: 'In transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refund_pending: 'Refund pending',
    refunded: 'Refunded'
  }
};

fs.writeFileSync(viPath, JSON.stringify(viData, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log('Injected order status translations.');
