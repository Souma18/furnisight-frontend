### README Setup Frontend — KLTN (Vue 3 + Vite + TroisJS + Pinia + Axios)

Tài liệu này dùng để **onboard team Frontend**: đọc xong là có thể **tạo project, cấu hình chuẩn, chạy dev/build/deploy**.  
Chúng ta **chưa làm feature**, chỉ tập trung **cấu hình + kiến trúc + quy ước** để code sau này sạch và mở rộng được.

---

### I. Mục tiêu của Frontend trong đề tài này

Frontend trong KLTN này **không phải web thường**. Nó phải đảm nhiệm đồng thời:

- **UI/UX thương mại điện tử**: listing sản phẩm, cart, checkout, profile, order.
- **Hiển thị 3D realtime**: render phòng 3D, tương tác xoay/zoom/chọn object, kéo thả nội thất.
- **Giao tiếp AI service**: gửi layout/scene → nhận gợi ý nội thất / bố trí / scoring.
- **Giao tiếp microservice backend**: product/user/cart/order/payment… qua API Gateway.
- **Quản lý state phức tạp**: user + auth + cart + 3D scene (objects/camera/mode) + server state.

Vì vậy cần thiết kế **ngay từ đầu** theo hướng:
- tách lớp rõ ràng (UI / state / service / 3D layer)
- cấu hình tập trung
- dễ mở rộng và dễ làm việc nhóm

---

### II. Tech Stack Frontend (và vì sao chọn)

#### 1) Framework: Vue 3 (Composition API)

Vue 3 là **UI layer**:
- render giao diện
- quản lý lifecycle
- binding state ↔ UI

Vì sao Composition API:
- code dễ chia module theo “feature”
- state + logic tái sử dụng tốt (composable)
- scale tốt hơn Options API khi app lớn

Tài liệu: [Vue 3 Official Guide](https://vuejs.org/guide/introduction.html)

---

#### 2) Build tool: Vite

Lý do chọn Vite:
- startup nhanh
- HMR mượt
- native ES Modules
- build nhanh, output thư mục `dist/` để deploy static

Lệnh:

```bash
npm run dev
npm run build
npm run preview
```

Tài liệu: [Vite Guide](https://vitejs.dev/guide/)

---

#### 3) 3D Engine: TroisJS (wrapper Three.js cho Vue)

- **TroisJS** biến 3D thành **component Vue**
- bên dưới vẫn dùng **Three.js core**
- dễ quản lý lifecycle (mount/unmount), tránh “script rời”

Tài liệu:
- [TroisJS](https://troisjs.github.io/)
- [Three.js Docs](https://threejs.org/docs/)

---

#### 4) State Management: Pinia

- chuẩn Vue 3, nhẹ, thay Vuex
- dễ chia store theo domain: user/cart/room3D

Ví dụ Pinia cơ bản:

```js
// stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
  }),
});
```

Trong component:

```js
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
console.log(userStore.user);
```

Tài liệu: [Pinia Documentation](https://pinia.vuejs.org/)

---

#### 5) HTTP Client: Axios

Dùng để gọi API backend và AI service.

Vì sao Axios (so với fetch):
- cấu hình tập trung (baseURL/timeout)
- interceptor gắn token tự động
- xử lý lỗi chung, retry/cancel dễ hơn

Ví dụ:

```js
axios.get('/api/users');
axios.post('/api/login', data);
```

---

#### 6) UI Library: Naive UI

Trong đề tài này, UI dùng **Naive UI** (component library cho Vue 3).

Vì sao chọn Naive UI:
- Có sẵn component “chuẩn app” (Button, Form, Modal, Drawer, DataTable, Notification…)
- Theme dễ tùy biến (dark/light, theme overrides)
- Làm UI thương mại điện tử nhanh và đồng nhất giữa các page/feature

Tài liệu: [Naive UI](https://www.naiveui.com/)

##### Cấu hình tối thiểu (bắt buộc)

Quy ước: bọc app bằng `NConfigProvider` (theme + locale + message provider).

```vue
<!-- src/app/App.vue -->
<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import { darkTheme } from 'naive-ui';
import { useAppStore } from '@/features/app/store/appStore';

const appStore = useAppStore();
const theme = computed(() => (appStore.isDark ? darkTheme : null));
const themeOverrides = {
  common: {
    primaryColor: '#3B82F6',
  },
};
</script>
```

##### Ví dụ dùng component Naive UI

```vue
<template>
  <n-button type="primary" :loading="isLoading" @click="onSubmit">
    Submit
  </n-button>
</template>

<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
function onSubmit() {}
</script>
```

> Ghi chú: Tailwind **không bắt buộc** nữa. Nếu team vẫn muốn dùng utility class cho layout nhỏ (spacing, flex), có thể thêm sau như “optional”.

---

#### 6.1) CSS Utility: Tailwind CSS (lớp hỗ trợ UI)

Bạn nói đúng: **Tailwind là CSS** để hỗ trợ UI (layout/spacing/responsive), còn **Naive UI** là thư viện component.  
Khuyến nghị dùng theo nguyên tắc:

- **Naive UI**: button/form/modal/table… (component “chuẩn app”)
- **Tailwind**: layout nhanh (flex/grid/gap/padding), responsive (`md:`, `lg:`), các style “đơn giản” quanh component
- **Tránh**: custom lại style “bên trong” component Naive quá nhiều (dễ tốn công và khó đồng bộ theme)

Ví dụ dùng chung:

```vue
<template>
  <div class="mx-auto max-w-6xl p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Products</h1>
      <n-button type="primary">Add to cart</n-button>
    </div>
  </div>
</template>
```

##### Setup Tailwind (khuyến nghị cho team)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:

```js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

`src/shared/styles/tailwind.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import 1 lần ở entry:

```js
// src/app/main.js
import '@/shared/styles/tailwind.css';
```

Tài liệu: [Tailwind CSS](https://tailwindcss.com/docs/installation)

---

#### 7) Router: Vue Router

Vue Router giúp chuyển trang kiểu SPA **không reload toàn bộ**.

Tài liệu: [Vue Router](https://router.vuejs.org/)

---

### III. Khởi tạo project (chỉ cấu hình, chưa code feature)

#### 1) Tạo project Vue + Vite

```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install
```

#### 1.1) Quy ước alias import `@` (giảm import path rối)

Khuyến nghị cấu hình alias `@` → trỏ về `src/` để code gọn và đồng nhất trong team.

`vite.config.js` (ví dụ):

```js
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

Quy ước import:

```js
import api from '@/services/api';
import { useUserStore } from '@/stores/userStore';
```

#### 2) Cài dependencies cốt lõi

```bash
npm install pinia vue-router axios
npm install troisjs three
npm install naive-ui
```

Nếu dùng Tailwind (khuyến nghị), cài thêm:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 2.1) Scripts tối thiểu trong `package.json` (team dùng thống nhất)

- `dev`: chạy local
- `build`: build production ra `dist/`
- `preview`: test build local giống production

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 3) (Optional) Auto-import component Naive UI để code gọn hơn

Nếu muốn khỏi phải import tay từng component, dùng auto-import:

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

`vite.config.js` (ví dụ):

```js
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

Khi đó có thể viết thẳng:

```vue
<template>
  <n-button type="primary">OK</n-button>
</template>
```

---

### IV. Kiến trúc thư mục Frontend (cực quan trọng để ăn điểm)

Áp dụng mô hình: **Feature-based Architecture + Layer Separation** (đúng nghĩa “feature” như bạn hỏi).

Mục tiêu:
- **Team làm song song** theo feature (Product/Cart/Room3D/Auth) mà ít conflict
- Mỗi feature tự mang theo **page + component + store + service + composables** của nó
- “Shared” (dùng chung) tách riêng để không bị lẫn vào feature

#### IV.1) Feature-based là gì (và khác gì “layer-based”)

- **Layer-based**: `components/`, `views/`, `stores/`, `services/`… (dễ bắt đầu nhưng về sau dễ “phình” và khó tìm)
- **Feature-based**: mọi thứ thuộc về một nghiệp vụ gom vào một folder feature (dễ scale, dễ ownership)

Trong Vue, “hooks” tương đương React chính là **Vue Composables**: các hàm `useXxx()` trong `composables/`.

#### IV.2) Cấu trúc đề xuất (chuẩn feature-based)

```text
src/
├── app/                         # bootstrap app (pinia/router/plugins)
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   └── plugins/
│       ├── pinia.js
│       ├── router.js
│       └── index.js
├── shared/                      # dùng chung toàn app (KHÔNG gắn nghiệp vụ)
│   ├── assets/
│   ├── styles/
│   ├── ui/                      # UI kit: Button/Input/Modal/Card...
│   ├── layout/                  # Header/Footer/Sidebar
│   ├── lib/                     # axios instance, helpers chung
│   │   └── api/
│   │       ├── client.js        # axios client config
│   │       ├── interceptors.js  # request/response interceptors
│   │       └── index.js         # export + bootstrap interceptors
│   ├── utils/                   # format/validate/constants
│   ├── composables/             # "hooks" dùng chung (useToast, useDebounce...)
│   └── types/                   # JSDoc typedef / placeholder trước khi lên TypeScript
├── features/                    # mỗi feature = 1 domain nghiệp vụ
│   ├── auth/
│   │   ├── pages/               # route pages của feature
│   │   │   └── LoginPage.vue
│   │   ├── components/          # component chỉ dùng trong auth
│   │   ├── store/               # pinia store của feature (nếu cần)
│   │   │   └── authStore.js
│   │   ├── api/                 # service gọi API riêng cho auth
│   │   │   └── authApi.js
│   │   └── composables/         # "hooks" riêng cho auth
│   │       └── useAuth.js
│   ├── product/
│   │   ├── pages/
│   │   │   ├── ProductListPage.vue
│   │   │   └── ProductDetailPage.vue
│   │   ├── components/          # ProductCard, Filters, Gallery...
│   │   ├── store/
│   │   │   └── productStore.js
│   │   ├── api/
│   │   │   └── productApi.js
│   │   └── composables/
│   │       └── useProducts.js
│   ├── cart/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── store/
│   │   └── api/
│   └── room3d/
│       ├── pages/
│       │   └── Room3DPage.vue
│       ├── components/          # RoomScene, Gizmo, ObjectPanel...
│       ├── store/
│       │   └── room3DStore.js
│       ├── api/
│       │   └── roomApi.js
│       ├── composables/
│       │   └── useRoom3D.js
│       └── core/                # tách lớp 3D engine nếu cần (scene graph, loaders)
└── index.html
```

#### IV.3) Giải thích nhanh từng phần (để team mới đọc hiểu)

- **`src/app/`**: nơi “khởi động app” (router, pinia, plugins). Không chứa logic nghiệp vụ.
- **`src/shared/`**: bất cứ thứ gì **dùng lại được cho nhiều feature**. Ví dụ:
  - `shared/ui/`: Button, Modal, Table...
  - `shared/lib/api/`: `client.js` + `interceptors.js` + `index.js` (cấu hình 1 lần, dùng khắp nơi)
  - `shared/composables/`: `useDebounce()`, `useToast()`, `useEventListener()`
- **`src/features/<feature>/`**: tất cả thứ thuộc về một nghiệp vụ đặt chung:
  - `pages/`: page-level components (route components)
  - `components/`: component chỉ thuộc feature đó (ví dụ `ProductCard`)
  - `store/`: Pinia store của feature (state nghiệp vụ)
  - `api/`: module gọi API của feature (không để rải rác trong page/component)
  - `composables/`: “hooks” nghiệp vụ của feature (đóng gói flow + side effects)

---

### V. State Management Strategy (local / global / server)

Phân loại state:

| Loại state | Dùng gì | Ví dụ |
| --- | --- | --- |
| Local state | `ref()`, `reactive()` | form input, toggle modal |
| Global state | **Pinia** | user, cart, room layout, selected object |
| Server state | Axios + cache | products, orders, AI results |

Khuyến nghị thêm (nếu cần cache mạnh):
- cân nhắc **TanStack Query (Vue Query)** cho server state (không bắt buộc)

---

### V.1) “Hooks” trong Vue là gì? (tương đương React hooks)

Trong Vue 3, “hooks” = **composables**:
- file nằm trong `shared/composables/` hoặc `features/**/composables/`
- đặt tên theo quy ước `useXxx()`
- nhiệm vụ: gom logic (call API, sync store, validate, side effects) để component chỉ lo UI

Ví dụ composable cho Product:

```js
// features/product/composables/useProducts.js
import { computed } from 'vue';
import { useProductStore } from '../store/productStore';
import { productApi } from '../api/productApi';

export function useProducts() {
  const store = useProductStore();
  const products = computed(() => store.items);
  const isLoading = computed(() => store.isLoading);

  async function fetchProducts(params) {
    store.setLoading(true);
    try {
      const res = await productApi.getAll(params);
      store.setItems(res.data);
    } finally {
      store.setLoading(false);
    }
  }

  return { products, isLoading, fetchProducts };
}
```

---

### V.2) Luồng triển khai chuẩn (team follow theo là đúng)

Luồng “từ UI ra server và quay lại UI” (khuyến nghị):

1. **Page** (`features/*/pages/*.vue`) nhận route params → gọi composable
2. **Composable** (`useXxx`) quyết định “fetch khi nào”, map dữ liệu cho UI
3. **Store (Pinia)** giữ state nghiệp vụ (items/loading/error/selection)
4. **API module** (`features/*/api/*.js`) gọi axios instance từ `shared/lib/api/`
5. **Axios interceptors** tự gắn token, xử lý 401, log lỗi chung
6. Server trả về JSON → store cập nhật → Vue reactive tự render UI

Quy ước “đúng bài”:
- Component/Page **không gọi axios trực tiếp**
- Page **không chứa logic dài** → đẩy qua composable
- Store quản lý state + actions rõ ràng, dễ test/debug

### VI. Store quan trọng: `room3DStore` (quản lý 3D)

Store này quản lý state 3D để:
- UI (sidebar, properties panel) và scene (TroisJS) luôn sync
- tránh để “3D state” rải rác trong component

Yêu cầu state tối thiểu:
- danh sách object trong phòng
- object đang được chọn
- vị trí camera
- trạng thái zoom
- mode edit/view
- loading scene (load model/texture)

Ví dụ mẫu:

```js
// stores/room3DStore.js
import { defineStore } from 'pinia';

export const useRoom3DStore = defineStore('room3D', {
  state: () => ({
    objects: [],
    selectedObjectId: null,
    camera: { x: 0, y: 5, z: 10 },
    zoom: 1,
    mode: 'view', // 'view' | 'edit'
    isLoadingScene: false,
  }),
  getters: {
    selectedObject(state) {
      return state.objects.find(o => o.id === state.selectedObjectId) || null;
    },
  },
  actions: {
    addObject(obj) { this.objects.push(obj); },
    removeObject(id) { this.objects = this.objects.filter(o => o.id !== id); },
    selectObject(id) { this.selectedObjectId = id; },
    setMode(mode) { this.mode = mode; },
    setLoading(v) { this.isLoadingScene = v; },
  },
});
```

---

### VII. API Integration — gọi API chuẩn (service layer)

Nguyên tắc: **không gọi axios trực tiếp trong component** → gọi qua `services/`.

#### 1) Central config: `services/api.js`

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// tự động gắn token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// xử lý lỗi chung
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 2) Ví dụ module service: `services/productService.js`

```js
import api from './api';

export const productService = {
  getAll() { return api.get('/products'); },
  getById(id) { return api.get(`/products/${id}`); },
  search(q) { return api.get('/products/search', { params: { q } }); },
};
```

#### 3) Gọi AI service: `services/aiService.js`

```js
import api from './api';

export const aiService = {
  suggestFurniture(payload) {
    return api.post('/ai/suggest-furniture', payload);
  },
};
```

---

### VIII. 3D Layer — kiến trúc component và trách nhiệm

Mục tiêu: 3D **không phá kiến trúc** (không để Three.js chạy “tự do” trong view).

Các thành phần chính:
- **`RoomScene.vue`**: khởi tạo scene/camera/lights, gắn với store
- **`ObjectManager.vue`**: add/remove/update nội thất trong scene
- **`CameraController.vue`**: orbit controls, sync camera state
- **`CollisionService`**: chống xuyên tường, giới hạn vùng đặt object (module logic, không UI)

Ví dụ skeleton `RoomScene.vue` (TroisJS):

```vue
<template>
  <Renderer>
    <Camera :position="camera" />
    <Scene>
      <AmbientLight :intensity="0.5" />
      <PointLight :position="{ x: 0, y: 10, z: 0 }" />
      <Box
        v-for="obj in objects"
        :key="obj.id"
        :position="obj.position"
      />
    </Scene>
  </Renderer>
</template>

<script setup>
import { computed } from 'vue';
import { Renderer, Camera, Scene, AmbientLight, PointLight, Box } from 'troisjs';
import { useRoom3DStore } from '@/stores/room3DStore';

const store = useRoom3DStore();
const objects = computed(() => store.objects);
const camera = computed(() => store.camera);
</script>
```

---

### IX. Routing Strategy (SPA + Auth guard)

`router/index.js`:

```js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/product/:id', name: 'ProductDetail', component: () => import('@/views/ProductDetail.vue') },
  { path: '/room', name: 'Room3D', component: () => import('@/views/Room3D.vue'), meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: () => import('@/views/Cart.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) return next('/login');
  next();
});

export default router;
```

---

### X. Environment (Local / Dev / Staging / Production)

Khuyến nghị dùng `.env` theo môi trường:

- `.env.local` (máy dev)
- `.env.dev`
- `.env.staging`
- `.env.production`

Ví dụ biến môi trường:

```env
VITE_API_URL=https://api.example.com/api
VITE_AI_URL=https://ai.example.com
VITE_CDN_URL=https://cdn.example.com
```

Nguyên tắc:
- mọi baseURL lấy từ `import.meta.env.*`
- không hardcode domain trong code

---

### XI. Deploy (chuẩn DevOps)

#### 1) Build bằng Vite

```bash
npm run build
```

Output: `dist/` (static files).

---

#### 1.1) CI/CD gợi ý (để team deploy “1 nút bấm”)

Mục tiêu:
- push lên branch → tự build
- chạy lint/test (nếu có) → tạo artifact/image → deploy

Khuyến nghị branch theo môi trường:
- `develop` → Dev
- `staging` → Staging
- `main` → Production

Gợi ý pipeline (không bắt buộc):
- GitHub Actions build `npm ci` → `npm run build`
- build Docker image và push registry
- deploy bằng kubectl/helm hoặc trigger CD tool

#### 2) Docker + Nginx (khuyến nghị)

`Dockerfile` (template):

```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`nginx.conf` (SPA routing + proxy API):

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://api-gateway:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Build image:

```bash
docker build -t kltn-frontend:1.0 .
docker run -p 8080:80 kltn-frontend:1.0
```

---

#### 3) Kubernetes (khi hệ thống lớn)

Deployment tối thiểu:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: kltn-frontend:1.0
          ports:
            - containerPort: 80
```

Expose qua Ingress/API Gateway tuỳ kiến trúc.

---

### XII. Checklist triển khai cho team

- **Kiến trúc**
  - [ ] Tách `views/` / `components/` / `stores/` / `services/` / `three/`
  - [ ] Không gọi axios trực tiếp trong component (bắt buộc qua `services/`)
  - [ ] `room3DStore` làm “single source of truth” cho scene 3D
- **Config**
  - [ ] `.env.*` đúng môi trường
  - [ ] axios interceptor gắn token + handle 401
  - [ ] SPA routing trong Nginx (`try_files ... /index.html`)
- **Deploy**
  - [ ] `npm run build` tạo `dist/`
  - [ ] Docker image chạy ok
  - [ ] Nginx proxy `/api` về API Gateway
- **Chất lượng**
  - [ ] error handling có chuẩn (log/toast)
  - [ ] UI responsive
  - [ ] 3D FPS ổn định (ưu tiên > 30fps)

---

### XIII. Tài liệu tham khảo tổng hợp

- Vue 3: [https://vuejs.org/](https://vuejs.org/)
- Vite: [https://vitejs.dev/](https://vitejs.dev/)
- Pinia: [https://pinia.vuejs.org/](https://pinia.vuejs.org/)
- Vue Router: [https://router.vuejs.org/](https://router.vuejs.org/)
- Naive UI: [https://www.naiveui.com/](https://www.naiveui.com/)
- Tailwind CSS: [https://tailwindcss.com/](https://tailwindcss.com/)
- TroisJS: [https://troisjs.github.io/](https://troisjs.github.io/)
- Three.js: [https://threejs.org/docs/](https://threejs.org/docs/)
- Axios: [https://axios-http.com/](https://axios-http.com/)

