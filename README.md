# Interior 3D Frontend

Website gợi ý và trực quan hóa nội thất 3D.

## Tech stack

- Vue 3, Vite
- Vue Router, Pinia
- Axios (HTTP client dùng chung)

## Cấu trúc thư mục `src/`

Mỗi dòng gồm **đường dẫn** và **chú thích vai trò** (feature-based + tầng dùng chung).

```
src/
├── app/                              # Khởi động ứng dụng: mount Vue, đăng ký plugin, router
│   ├── main.js                       # Entry: tạo app, gọi setupApp, import CSS + API client
│   ├── App.vue                       # Shell gốc: layout xung quanh <RouterView />
│   ├── router/index.js               # Định nghĩa route → lazy-load page trong features/
│   └── plugins/                      # Gom pinia + router (dễ mở rộng thêm plugin sau)
│       ├── index.js                  # setupApp(app) — gọi lần lượt các plugin
│       ├── pinia.js                  # Cấu hình Pinia (state toàn cục)
│       └── router.js                 # Gắn vue-router vào app
│
├── shared/                           # Dùng chung toàn app, không gắn một domain nghiệp vụ cụ thể
│   ├── assets/                       # Ảnh, font, SVG tĩnh dùng lại nhiều nơi
│   ├── styles/global.css             # Biến theme, reset, typography toàn cục
│   ├── ui/                           # UI kit tái sử dụng (Button, Input, Modal…)
│   ├── layout/                       # Khung trang: header, footer, sidebar (không chứa logic nghiệp vụ)
│   ├── lib/api/                      # HTTP: một axios instance + interceptor
│   │   ├── client.js                 # Tạo axios (baseURL, timeout, header mặc định)
│   │   ├── interceptors.js           # Gắn token, xử lý lỗi tập trung
│   │   └── index.js                  # Export client + đăng ký interceptor khi import
│   ├── utils/                        # Hàm thuần: format, validate nhẹ, hằng số chung
│   ├── composables/                  # “Hooks” Vue dùng chung (toast, debounce, media query…)
│   └── types/                        # JSDoc typedef / placeholder trước khi chuyển TypeScript
│
└── features/                         # Mỗi thư mục = một miền nghiệp vụ (theo dọc)
    ├── auth/                         # Đăng nhập / phiên người dùng
    │   ├── pages/LoginPage.vue       # Trang route `/login`
    │   ├── components/               # Chỉ dùng trong auth (form, SSO button…)
    │   ├── store/authStore.js        # Pinia: token, profile, logout
    │   ├── api/authApi.js            # Gọi API `/auth/*` qua apiClient
    │   └── composables/useAuth.js    # Bọc store cho component
    │
    ├── product/                      # Danh mục / chi tiết sản phẩm
    │   ├── pages/
    │   │   ├── ProductListPage.vue   # `/`, `/products`
    │   │   └── ProductDetailPage.vue # `/products/:id`
    │   ├── components/               # ProductCard, filter, gallery…
    │   ├── store/productStore.js     # Danh sách, trạng thái tải (optional theo nhu cầu)
    │   ├── api/productApi.js
    │   └── composables/useProducts.js
    │
    ├── cart/                         # Giỏ hàng
    │   ├── pages/CartPage.vue        # `/cart`
    │   ├── components/
    │   ├── store/cartStore.js
    │   └── api/cartApi.js
    │
    └── room3d/                       # Trực quan phòng 3D, ghép nội thất
        ├── pages/Room3DPage.vue      # `/room3d`
        ├── components/               # Canvas wrapper, panel đặt đồ, gizmo…
        ├── store/room3DStore.js     # Context phòng đang xem, gợi ý loại phòng…
        ├── api/roomApi.js           # Upload ảnh phòng, lấy scene từ backend
        ├── composables/useRoom3D.js
        └── core/                     # Engine 3D (scene, loader, camera) tách khỏi Vue
            └── index.js              # Entry stub — sau này tích hợp Three.js v.v.
```

## Alias import (Vite)

| Alias        | Thư mục          |
|-------------|------------------|
| `@/`        | `src/`           |
| `@app/`     | `src/app/`       |
| `@shared/`  | `src/shared/`    |
| `@features/`| `src/features/`  |

## Biến môi trường

Tạo file `.env` (không commit secret) nếu cần đổi API:

```env
VITE_API_BASE_URL=https://api.example.com
```

Mặc định trong code: `/api` (thường dùng cùng `vite` proxy dev).

## Setup

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```
