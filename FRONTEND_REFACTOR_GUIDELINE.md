# Hướng dẫn Tái cấu trúc Module Frontend (Kiến trúc chuẩn)

Bộ hướng dẫn này được rút ra từ quá trình tái cấu trúc module `Account`, nhằm chuẩn hóa kiến trúc cho các module khác trong dự án (ví dụ: `Cart`, `Checkout`, `Products`, v.v...). 

Mục tiêu chính là **Giảm thiểu sự phụ thuộc (Decoupling)**, **Đóng gói Logic (Encapsulation)** và **Đồng bộ Dữ liệu từ Backend (Data Alignment)**.

---

## 1. Tránh mô hình "Cha gánh vác tất cả" (Monolithic Parent)
**🚫 Lỗi thường gặp trước đây:**
- Component Cha (như `AccountPage.vue`) gọi toàn bộ API, lưu toàn bộ State, và truyền dữ liệu xuống các Component con (Views) qua `props`.
- Component Con mỗi khi có thao tác (lưu, xóa) lại phải `$emit` ngược toàn bộ Payload lên Cha để xử lý (`@save`, `@upload-avatar`, `@remove`).

**✅ Tiêu chuẩn mới (Self-Contained Components):**
- Component Cha chỉ làm nhiệm vụ **Layout & Routing** (xác định view nào được hiển thị).
- Component Con (như `ProfileView`, `OrdersView`) hoàn toàn tự trị. Chúng tự kết nối với Composable riêng biệt để lấy dữ liệu, xử lý form và gửi API.
- Các event `$emit` lên Cha chỉ nên dành cho những tác vụ mang tính giao diện toàn cục (ví dụ: `@notify` để gọi Toast message).

---

## 2. Phân chia logic bằng Domain-Specific Composables
Thay vì dồn hết logic của cả module vào một file `useModule.js` khổng lồ, hãy chia nhỏ logic theo từng chức năng (Domain) bằng các file Composable riêng.

**Ví dụ từ module Account:**
- `useProfileForm.js`: Chuyên xử lý form thông tin cá nhân và upload ảnh.
- `useAddressForm.js`: Chuyên quản lý form địa chỉ (tỉnh/thành) và lưu địa chỉ.
- `usePasswordManager.js`: Chuyên đổi mật khẩu.
- `useContactManager.js`: Chuyên xử lý logic liên kết/đổi Email, SĐT có OTP.

**Quy tắc cho Composable mới:**
1. **Import Store trực tiếp**: Composable tự gọi `useProfileStore()`, `useAddressStore()` và gọi trực tiếp Action của Store (ví dụ: `addressStore.addAddress(payload)`).
2. **Quản lý Loading State cục bộ**: Khai báo `isLoading` ngay trong Composable để khóa UI (Disable buttons) riêng biệt cho tính năng đó.
3. **Xử lý Error và Notify**: Bắt `try/catch` trực tiếp trong Composable và đẩy thông báo lỗi.

---

## 3. Kiến trúc Pinia Store Độc lập
Các Store không nên phụ thuộc chéo vào nhau. Mỗi Store quản lý một tập dữ liệu riêng và tự quản lý vòng đời (lifecycle) của mình.

**Quy tắc Store:**
- **Không có Master Hydrate**: Xóa bỏ các hàm `Promise.all` gọi cục bộ hàng loạt API không liên quan. Component nào cần dữ liệu của Store nào thì Store đó tự fetch khi cần (hoặc fetch ở component mount).
- **Trách nhiệm duy nhất**: `profileStore` chỉ lo Profile, `orderStore` chỉ lo Order. Không để `accountStore` nắm giữ State của những phần khác.

---

## 4. Dùng trực tiếp dữ liệu từ Model chuẩn (DTOs)
**🚫 Lỗi thường gặp trước đây:**
- Giao diện UI code dựa trên cấu trúc Mock Data tạm thời (`date`, `items: 2`, `thumbs`, v.v...).
- Tồn tại các file model "rác" tự chế ở Frontend (`models/favoriteProduct.js`).

**✅ Tiêu chuẩn mới (Data Alignment):**
1. **Sử dụng Model từ Services**: Các Store phải map/khởi tạo dữ liệu dựa trên Model chuẩn đã định nghĩa ở `src/shared/lib/api/services/` (ví dụ: `FavoriteResponse`, `OrderResponse`, `ProfileResponse`).
2. **Render theo DTO**: UI Component *phải* render các biến dựa theo model (Ví dụ: dùng `order.createdAt` thay vì `order.date`, `order.finalAmount` thay vì `order.total`).
3. **Mở rộng Model nếu cần**: Nếu UI cần hiển thị trường mới (như `birthday`, `gender`, `bio`), hãy bổ sung trường đó vào Data Model Class ở file `*.model.js` của Services, đảm bảo mọi luồng dữ liệu đều được ánh xạ rõ ràng và thống nhất với Backend API.

---

## Tóm tắt luồng dữ liệu chuẩn (Chuẩn "3 Lớp"):
1. **Tầng API & Model (`shared/lib/api/services/`)**: Khai báo API Caller và Class DTO chuẩn.
2. **Tầng Store (`features/*/store/`)**: Gọi API, map response thành DTO Class, lưu trữ Global State.
3. **Tầng Composable (`features/*/composables/`)**: Connect vào Store, quản lý form state, validation, event triggers (Save/Delete).
4. **Tầng UI (`features/*/components/`)**: Chỉ lo hiển thị UI (binding HTML/CSS) bằng cách import biến và hàm từ Composable.
