---
name: vue-refactor-standards
description: >
  Hướng dẫn chuẩn để refactor, tổ chức lại và viết mới Vue SFC trong project này.
  Áp dụng nguyên tắc SRP, tách logic ra Composable, không viết DTO tự phát — phải dựa
  vào response thực tế từ Backend API. Sử dụng khi thêm tính năng mới, sửa component
  hiện tại, hoặc khi review/refactor code Vue.
metadata:
  version: "2026.1.0"
  project: interior-3d (Furnisight Frontend)
---

# Vue Refactor Standards — Furnisight Frontend

> Dựa trên kết quả phân tích kiến trúc toàn diện của Senior Frontend Architect.
> Tất cả quy tắc ở đây là **BẮT BUỘC**, không phải gợi ý.

---

## 1. Quy tắc Trách nhiệm Component (SRP)

**Mỗi Vue SFC chỉ được có TỐI ĐA 2 trách nhiệm.**

| Trách nhiệm cho phép trong Component | Trách nhiệm phải đưa ra ngoài |
|--------------------------------------|-------------------------------|
| ✅ Rendering (template/CSS) | ❌ Gọi API trực tiếp |
| ✅ User event binding (click, keydown) | ❌ Logic phân trang, debounce |
| ✅ Local UI state (isOpen, hovered) | ❌ Tính toán phức tạp (math, sort, filter) |
| ✅ Điều phối emit lên parent | ❌ localStorage read/write |
| | ❌ Drag/drop geometry math |

**Kiểm tra nhanh**: Đọc phần `<script setup>`, đếm số `async function` và `watch`.
Nếu có **> 2 async function** hoặc **> 2 watch** → vi phạm SRP → phải tách Composable.

---

## 2. Quy tắc Composable (Logic Extraction)

Khi logic cần tách ra, tạo file `use<Feature>.js` trong thư mục `composables/`:

```
src/features/<domain>/composables/
  useProductSearch.js       ← API + pagination + debounce
  useDraggableWidget.js     ← pointer math, position
  useMessageTemplates.js    ← template CRUD
  useChat.js                ← WebSocket, message send
```

### Cấu trúc chuẩn của Composable:

```js
// src/features/<domain>/composables/use<Feature>.js
import { ref, watch, onUnmounted } from 'vue'

export function use<Feature>(/* params nếu cần */) {
  // 1. State
  const items = ref([])
  const loading = ref(false)

  // 2. Private helpers (không export)
  async function _fetchInternal() { ... }

  // 3. Public actions
  async function load(reset = false) { ... }
  function reset() { ... }

  // 4. Watchers nội bộ (nếu cần)
  watch(someParam, () => load(true))

  // 5. Cleanup
  onUnmounted(() => { /* clearTimeout, abort, etc. */ })

  // 6. Return — chỉ export những gì Component cần
  return { items, loading, load, reset }
}
```

### Quy tắc Watcher:

| Loại Watcher | Được phép | Vị trí |
|---|---|---|
| DOM side-effect (scroll, focus) | ✅ | Trong Component |
| API call triggered by user input | ✅ | Trong Composable, KHÔNG trong Component |
| Chained state mutation (watch A → sửa B → sửa C) | ❌ | Không bao giờ |

**Chained mutation** là anti-pattern nghiêm trọng nhất:
```js
// ❌ KHÔNG BAO GIỜ làm thế này:
watch(() => templateMgr.pendingText, (text) => {
  messageText.value = text           // mutate local state
  store.workspace.msgType = 'reply'  // mutate store state ngầm
})

// ✅ Dùng defineExpose để parent gọi method trực tiếp:
// Parent: inputAreaRef.value.insertTemplate(text)
// Child: defineExpose({ insertTemplate })
```

---

## 3. Quy tắc DTO — BẮT BUỘC dựa vào Backend Response

**NGHIÊM CẤM tự phát minh shape của DTO/Model.**

### Quy trình bắt buộc khi cần dùng data từ API mới:

**Bước 1**: Gọi API thực tế và xem response:
```bash
curl -s "http://127.0.0.1:8080/<path>?..." | python3 -m json.tool
```

Hoặc kiểm tra Docker log của service:
```bash
docker logs <container_name> --tail 30
```

**Bước 2**: Map field tên đúng như response trả về. Ví dụ:

```json
// Response thực tế từ /catalog/products:
{
  "items": [...],
  "totalPages": 4,
  "totalElements": 12,
  "currentPage": 1,
  "pageSize": 20
}
```

```js
// ✅ Parse đúng theo response thực:
const items = data?.items ?? data?.content ?? []
const totalPages = data?.totalPages ?? 1
const currentPage = data?.currentPage ?? 1

// ❌ Tự đoán sai field:
const items = data?.products   // → undefined
const total = data?.total      // → undefined
```

**Bước 3**: Với mỗi field trong template, tra cứu lại response:
```vue
<!-- ❌ Đoán bừa: -->
<img :src="p.imageUrls[0]" />  <!-- field không tồn tại -->
<span>{{ p.stock }}</span>     <!-- field tên là stockQuantity -->

<!-- ✅ Đúng tên field từ response: -->
<img :src="p.images?.[0]?.imageUrl" />
<span>{{ p.variants?.[0]?.stockQuantity }}</span>
```

### Cách xác minh field tồn tại:

```js
// Trong composable, log response một lần khi develop:
const res = await api.getProducts(params)
// Kiểm tra shape: Object.keys(res.data)
const items = Array.isArray(res.data)
  ? res.data
  : res.data?.items ?? res.data?.content ?? []
```

---

## 4. Quy tắc Phân cấp Component

```
View (Page)                 ← Orchestrates stores + modals
  └── Feature Component     ← 1 tính năng lớn (workspace, list panel)
        └── UI Component    ← 1 khối giao diện (header, timeline, input)
              └── Atom       ← Button, Badge, Icon (dùng chung)
```

**Emit chỉ đi lên 1 tầng**, không relay qua nhiều tầng:

```
// ❌ Relay emit 3 tầng:
ChatProductCard → emit('add-to-cart')
ChatMessageBubble → hứng, re-emit('add-to-cart')
ChatWidget → hứng, xử lý

// ✅ Dùng Store/Provide-Inject thay vì relay:
ChatProductCard → store.addToCart(product)  // hoặc inject action
```

### Modal Management:

Mỗi Modal cần file riêng. **Không nhét 2 modal vào 1 file**:

```
// ❌ 1 file chứa cả List Modal và Form Modal
ConversationTemplateModal.vue (300+ dòng)

// ✅ Tách đôi:
ConversationTemplateModal.vue  ← Orchestrator chỉ 50 dòng
  TemplateListModal.vue         ← Danh sách + filter
  TemplateFormModal.vue         ← Form thêm/sửa
```

---

## 5. Quy tắc Store (Pinia)

Store chỉ chứa:
- **State**: dữ liệu chia sẻ giữa nhiều component
- **Actions**: async operations (API calls, socket)
- **Getters**: derived state

**KHÔNG** đặt trong Store:
- Logic UI thuần túy (scroll, animation)
- Local state chỉ 1 component dùng (→ để trong component hoặc composable)

```js
// ❌ Store làm việc của Composable:
// adminConversationStore.js
const productPage = ref(0)         // pagination của modal product → không phải của store
const productSearchQuery = ref('') // search của modal → không phải store state

// ✅ Store chỉ giữ shared state:
const inbox = reactive({ items: [], page: 0, hasMore: true, loading: false })
const workspace = reactive({ convId: null, messages: [], msgType: 'reply' })
```

---

## 6. Checklist Trước khi Submit Code

Trước khi tạo hoặc sửa bất kỳ Vue SFC nào, kiểm tra:

- [ ] Component có ≤ 2 trách nhiệm?
- [ ] Không có `async function` gọi API trực tiếp trong component (trừ Store)?
- [ ] Mọi field dùng trong template đã được verify từ Backend response thực tế?
- [ ] Không có `watch` gây chained mutation (watch A sửa B sửa C)?
- [ ] Modal có file riêng, không lồng ghép nhiều modal trong 1 file?
- [ ] Emit chỉ đi lên 1 tầng, không relay qua nhiều component?
- [ ] Logic tái sử dụng đã được đặt trong Composable?
- [ ] File component dưới 150 dòng (nếu vượt → xem xét tách)?

---

## 7. Ví dụ Thực tế từ Project

### Pattern đúng: Composable tách API + Pagination

```js
// ✅ useProductSearch.js — logic đã cô lập, component chỉ dùng
export function useProductSearch() {
  const products = ref([])
  const page = ref(0)
  const hasMore = ref(true)
  const loading = ref(false)

  async function fetchProducts(reset = false) {
    if (loading.value || (!hasMore.value && !reset)) return
    loading.value = true
    if (reset) { page.value = 0; products.value = [] }
    try {
      const res = await productsApi.getProducts({ page: page.value, size: 20 })
      // Parse theo RESPONSE THỰC TẾ từ /catalog/products:
      const data = res.data
      const items = data?.items ?? []
      const totalPages = data?.totalPages ?? 1
      if (data?.currentPage >= totalPages) hasMore.value = false
      products.value = reset ? items : [...products.value, ...items]
      page.value++
    } finally { loading.value = false }
  }

  return { products, loading, hasMore, fetchProducts }
}
```

```vue
<!-- ✅ SendProductModal.vue — chỉ rendering, không logic -->
<script setup>
import { useProductSearch } from '../../composables/useProductSearch'
const { products, loading, fetchProducts } = useProductSearch()
</script>
```

### Pattern đúng: defineExpose thay vì chained watcher

```vue
<!-- ✅ WorkspaceInputArea.vue -->
<script setup>
const messageText = ref('')
function insertTemplate(text) {
  messageText.value = text
  store.setMsgType('reply')
}
defineExpose({ insertTemplate })
</script>

<!-- ✅ ConversationWorkspace.vue (parent) -->
<script setup>
const inputAreaRef = ref(null)
// Khi cần insert: inputAreaRef.value.insertTemplate(content)
</script>
<template>
  <WorkspaceInputArea ref="inputAreaRef" />
</template>
```
