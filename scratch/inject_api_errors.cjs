const fs = require('fs');
const path = require('path');

const viPath = path.resolve('src/shared/i18n/locales/vi.json');
const enPath = path.resolve('src/shared/i18n/locales/en.json');

const viData = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

viData.api = {
  errors: {
    GENERIC: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
    NETWORK: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.',
    TIMEOUT: 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.',
    ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản.',
    ACCOUNT_ALREADY_EXISTS: 'Tài khoản đã tồn tại.',
    ACCOUNT_BANNED: 'Tài khoản đã bị khóa.',
    ACCOUNT_TEMPORARILY_LOCKED: 'Tài khoản đang tạm khóa. Vui lòng thử lại sau.',
    ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác minh.',
    INVALID_PASSWORD: 'Mật khẩu không chính xác.',
    INVALID_TOKEN: 'Mã xác thực không hợp lệ hoặc đã hết hạn.',
    TOKEN_EXPIRED: 'Phiên xác thực đã hết hạn. Vui lòng thử lại.',
    TOKEN_ALREADY_USED: 'Mã xác thực đã được sử dụng.',
    NOT_ENOUGH_PERMISSION: 'Bạn không có quyền thực hiện thao tác này.',
    VALIDATION_ERROR: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.',
    BAD_REQUEST: 'Thông tin gửi lên chưa hợp lệ.',
    MISSING_PARAMETER: 'Thiếu thông tin bắt buộc.',
    UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục.',
    FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
    NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
    CONFLICT: 'Dữ liệu đã tồn tại hoặc đang bị trùng.',
    PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
    CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
    PRODUCT_VARIANT_NOT_FOUND: 'Không tìm thấy phiên bản sản phẩm.',
    DUPLICATE_PRODUCT_NAME: 'Tên sản phẩm đã tồn tại.',
    DUPLICATE_CATEGORY_SLUG: 'Đường dẫn danh mục đã tồn tại.',
    DUPLICATE_CATEGORY_NAME: 'Tên danh mục đã tồn tại.',
    INSUFFICIENT_STOCK: 'Sản phẩm không đủ tồn kho.',
    INVALID_STOCK_QUANTITY: 'Số lượng tồn kho không hợp lệ.',
    INVALID_PRICE: 'Giá sản phẩm không hợp lệ.',
    REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá.',
    ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
    INVALID_ORDER_STATUS: 'Trạng thái đơn hàng không hợp lệ.',
    INVALID_PAYMENT_METHOD: 'Phương thức thanh toán không hợp lệ.',
    INVALID_PAYMENT_AMOUNT: 'Số tiền thanh toán không hợp lệ.',
    MEDIA_NOT_FOUND: 'Không tìm thấy tệp đã tải lên.',
    MEDIA_UPLOAD_FAILED: 'Không thể tải tệp lên. Vui lòng thử lại.',
    MESSAGE_NOT_FOUND: 'Không tìm thấy cuộc trò chuyện hoặc tin nhắn.',
    MESSAGE_FAILED: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
    NOTIFICATION_TEMPLATE_NOT_FOUND: 'Không tìm thấy mẫu thông báo.',
    INBOX_MESSAGE_NOT_FOUND: 'Không tìm thấy thông báo.',
    status: {
      413: 'Tệp tải lên quá lớn.',
      415: 'Định dạng tệp không được hỗ trợ.',
      429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
      502: 'Dịch vụ đang gián đoạn. Vui lòng thử lại sau.',
      503: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
      504: 'Dịch vụ phản hồi quá lâu. Vui lòng thử lại sau.'
    }
  }
};

enData.api = {
  errors: {
    GENERIC: 'An error occurred. Please try again later.',
    NETWORK: 'Cannot connect to the server. Please check your network and try again.',
    TIMEOUT: 'The request took too long. Please try again.',
    ACCOUNT_NOT_FOUND: 'Account not found.',
    ACCOUNT_ALREADY_EXISTS: 'Account already exists.',
    ACCOUNT_BANNED: 'Account is banned.',
    ACCOUNT_TEMPORARILY_LOCKED: 'Account is temporarily locked. Please try again later.',
    ACCOUNT_NOT_VERIFIED: 'Account is not verified.',
    INVALID_PASSWORD: 'Incorrect password.',
    INVALID_TOKEN: 'Invalid or expired authentication token.',
    TOKEN_EXPIRED: 'Authentication session expired. Please try again.',
    TOKEN_ALREADY_USED: 'Authentication token has already been used.',
    NOT_ENOUGH_PERMISSION: 'You do not have permission to perform this action.',
    VALIDATION_ERROR: 'Invalid information. Please check again.',
    BAD_REQUEST: 'Invalid request information.',
    MISSING_PARAMETER: 'Missing required information.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Requested data not found.',
    CONFLICT: 'Data already exists or is conflicting.',
    PRODUCT_NOT_FOUND: 'Product not found.',
    CATEGORY_NOT_FOUND: 'Category not found.',
    PRODUCT_VARIANT_NOT_FOUND: 'Product variant not found.',
    DUPLICATE_PRODUCT_NAME: 'Product name already exists.',
    DUPLICATE_CATEGORY_SLUG: 'Category slug already exists.',
    DUPLICATE_CATEGORY_NAME: 'Category name already exists.',
    INSUFFICIENT_STOCK: 'Insufficient product stock.',
    INVALID_STOCK_QUANTITY: 'Invalid stock quantity.',
    INVALID_PRICE: 'Invalid product price.',
    REVIEW_NOT_FOUND: 'Review not found.',
    ORDER_NOT_FOUND: 'Order not found.',
    INVALID_ORDER_STATUS: 'Invalid order status.',
    INVALID_PAYMENT_METHOD: 'Invalid payment method.',
    INVALID_PAYMENT_AMOUNT: 'Invalid payment amount.',
    MEDIA_NOT_FOUND: 'Uploaded file not found.',
    MEDIA_UPLOAD_FAILED: 'Failed to upload file. Please try again.',
    MESSAGE_NOT_FOUND: 'Conversation or message not found.',
    MESSAGE_FAILED: 'Failed to send message. Please try again.',
    NOTIFICATION_TEMPLATE_NOT_FOUND: 'Notification template not found.',
    INBOX_MESSAGE_NOT_FOUND: 'Notification not found.',
    status: {
      413: 'Uploaded file is too large.',
      415: 'File format is not supported.',
      429: 'You are performing actions too quickly. Please try again later.',
      502: 'Service is interrupted. Please try again later.',
      503: 'Service is temporarily unavailable. Please try again later.',
      504: 'Service is taking too long to respond. Please try again later.'
    }
  }
};

fs.writeFileSync(viPath, JSON.stringify(viData, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n', 'utf8');

console.log('Injected api.errors translations.');
