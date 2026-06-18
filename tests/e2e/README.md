# FE Automation Tests

Chạy toàn bộ smoke test và UI/UX audit:

```bash
npm run test:e2e
```

Mở report HTML:

```bash
npm run test:e2e:report
```

Log lỗi UI/UX được ghi tại:

```text
test-results/ui-ux-audit/
```

Các test hiện kiểm tra:

- Trang public render không crash.
- Route cần đăng nhập/admin redirect hoặc block guest sạch.
- Tự động phát hiện link chi tiết sản phẩm từ trang danh sách rồi audit.
- Ghi console error/warning, page error, HTTP 4xx/5xx, request failed.
- Ghi lỗi UI cơ bản: overflow ngang, control nằm ngoài viewport, clickable không có accessible name, text tràn trong button.
- Smoke test chỉ fail khi có runtime `pageerror`; lỗi API/CORS vẫn được log để bạn xử lý riêng mà không làm kẹt audit UI.
