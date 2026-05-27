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
        ├── components/               # Topbar/left/canvas/right/cart/modal tách nhỏ theo UI
        ├── store/room3DStore.js      # State room mode, product placed, cart, checkout
        ├── api/roomApi.js            # Mock service cho analyze room, room templates, suggestions
        ├── composables/useRoom3D.js  # Orchestrate flow UI -> API -> store
        ├── core/                     # Mock data + cấu hình scene dùng cho TroisJS
        └── models/                   # Nơi bỏ file .glb/.gltf phòng mẫu và nội thất
            ├── rooms/
            ├── furniture/
            └── model-catalog.sample.json
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

# MessageService (test mode, no gateway)
VITE_MESSAGE_SERVICE_PREFIX=
VITE_MESSAGE_SERVICE_BASE_URL=
VITE_MESSAGE_WS_URL=http://localhost:5173/ws
VITE_CHAT_BUYER_ID=1001
VITE_CHAT_STAFF_ID=5001
```

Mặc định trong code: `/api` (thường dùng cùng `vite` proxy dev). MessageService ở chế độ test hiện gọi trực tiếp các path nội bộ qua Vite proxy tới `localhost:8085` (xem `vite.config.js`). Mock user ID dùng cho đến khi gateway decode JWT — xem `.env.example`.

## Setup

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Room3D Mock Flow (đang dùng để demo)

- Chế độ `Upload`: mô phỏng AI phân tích loại phòng.
- Chế độ `Phòng có sẵn`: chọn trực tiếp room template nếu không upload ảnh.
- Product panel bên phải: lọc/tìm kiếm, thêm vào scene 3D, đồng bộ giỏ hàng.
- Checkout/success hiện ở dạng mock để ráp backend sau.

## Thêm model 3D mới trong 3 bước

1. Bỏ file model vào:
   - phòng: `src/features/room3d/models/rooms/`
   - nội thất: `src/features/room3d/models/furniture/`
2. Cập nhật mapping trong:
   - `src/features/room3d/models/model-catalog.sample.json`
   - `src/features/room3d/core/mockData.js` (trường `modelUrl`, `fallback`, `roomTypes`)
3. Chạy `npm run dev` và kiểm tra trang `/room3d`. Nếu thiếu model thì app tự fallback sang primitive shape.

## Smoke test checklist cho `/room3d`

- Chuyển giữa 2 mode `Hình ảnh` và `Phòng có sẵn`.
- Chọn một phòng mẫu, xác nhận AI suggestion strip và canvas hiển thị.
- Tìm kiếm + lọc category bên panel phải.
- Thêm/xóa sản phẩm khỏi cart, kiểm tra tổng tiền cập nhật.
- Mở checkout, submit mock, kiểm tra success modal và cart được reset.
