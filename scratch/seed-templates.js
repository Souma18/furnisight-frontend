const templates = [
  {
    _id: UUID(),
    code: 'summer-sale-promo',
    name: 'Khuyến mãi Mùa Hè 2026',
    variables: [],
    titleTemplate: 'Săn sale Mùa Hè - Giảm ngay 30%',
    bodyTemplate: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:20px auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,.1)}.header{text-align:center;background:#ffb03a;padding:20px;border-radius:8px 8px 0 0}.header h2{color:#fff;margin:0;text-transform:uppercase;font-size:24px}.content{padding: 20px; font-size:16px;color:#333;line-height:1.5;text-align:center}.code-box{background:#f9f9f9;border:2px dashed #ffb03a;padding:15px;font-size:22px;font-weight:bold;color:#ffb03a;margin:20px 0;border-radius:8px;letter-spacing:2px}.button{display:inline-block;margin:20px 0;padding:14px 28px;font-size:16px;color:#fff!important;background:#ee4d2d;text-decoration:none;border-radius:5px;font-weight:700}.footer{font-size:14px;color:#777;text-align:center;border-top:1px solid #eaeaea;padding-top:10px;margin-top:20px}</style></head><body><div class="container"><div class="header"><h2>Chào Hè Rực Rỡ ☀️</h2></div><div class="content"><p>Chào bạn,</p><p>Mùa hè này, FurniSight dành tặng bạn ưu đãi đặc biệt. Đừng bỏ lỡ cơ hội làm mới không gian sống của bạn!</p><p>Vui lòng xem thông tin mã khuyến mãi ở bên dưới hoặc trong mục Ví Voucher của bạn:</p><a href="https://furnisight.com" class="button">Mua Sắm Ngay</a></div><div class="footer"><p>&copy; 2026 FurniSight. All rights reserved.</p></div></div></body></html>`,
    type: 'PROMOTION',
    channel: 'EMAIL',
    defaultImage: '',
    defaultActionUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0
  },
  {
    _id: UUID(),
    code: 'new-product-launch',
    name: 'Ra Mắt Bộ Sưu Tập Mới',
    variables: [],
    titleTemplate: 'Khám phá Bộ sưu tập mới nhất từ FurniSight',
    bodyTemplate: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:20px auto;background:#fff;padding:0;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,.1);overflow:hidden;}.header{text-align:center;background:#2c3e50;padding:30px 20px}.header h2{color:#fff;margin:0;text-transform:uppercase;font-size:26px;letter-spacing:1px}.content{padding: 30px 20px; font-size:16px;color:#444;line-height:1.6;text-align:center}.product-name{font-size:20px;font-weight:bold;color:#2c3e50;margin:15px 0}.button{display:inline-block;margin:25px 0;padding:12px 30px;font-size:16px;color:#fff!important;background:#27ae60;text-decoration:none;border-radius:30px;font-weight:700}.footer{font-size:13px;color:#999;text-align:center;background:#f9f9f9;padding:15px;}</style></head><body><div class="container"><div class="header"><h2>Nội Thất Đẳng Cấp</h2></div><div class="content"><p>Xin chào bạn,</p><p>Chúng tôi vô cùng tự hào giới thiệu đến bạn siêu phẩm mới nhất đã cập bến tại FurniSight:</p><div class="product-name">Bộ Sưu Tập Mới</div><p>Mang phong cách thiết kế hiện đại, tinh tế và chất lượng vượt trội. Hãy là những người đầu tiên sở hữu siêu phẩm này!</p><a href="https://furnisight.com" class="button">Khám Phá Ngay</a></div><div class="footer"><p>&copy; 2026 FurniSight. Cảm ơn bạn đã luôn đồng hành cùng chúng tôi.</p></div></div></body></html>`,
    type: 'PROMOTION',
    channel: 'EMAIL',
    defaultImage: '',
    defaultActionUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0
  },
  {
    _id: UUID(),
    code: 'special-discount-push',
    name: 'Thông báo App: Ưu đãi cá nhân',
    variables: ['voucherCode', 'discountValue'],
    titleTemplate: 'Quà tặng dành riêng cho bạn 🎁',
    bodyTemplate: 'Chào bạn, một voucher ưu đãi đặc biệt vừa được gửi vào tài khoản của bạn. Mua sắm ngay trên App FurniSight kẻo lỡ!',
    type: 'PROMOTION',
    channel: 'IN_APP',
    defaultImage: '',
    defaultActionUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0
  }
];

db.notification_templates.insertMany(templates);
print("Inserted " + templates.length + " marketing templates.");
