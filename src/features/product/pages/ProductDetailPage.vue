<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ProductDetailTopSection from '../components/ProductDetailTopSection.vue'
import ProductDetailTabsSection from '../components/ProductDetailTabsSection.vue'
import ProductDetail3DModal from '../components/ProductDetail3DModal.vue'
import { fetchProductById } from '../api/productApi'
import '../styles/productDetail.css'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const product = ref(null)
const loading = ref(false)
const error = ref(null)
const selectedColor = ref('')
const selectedSize = ref('')
const qty = ref(1)
const wished = ref(false)
const activeEmoji = ref('')
const activeTab = ref('desc')
const show3DModal = ref(false)

async function loadProduct(id) {
  loading.value = true
  error.value = null
  product.value = null
  try {
    const res = await fetchProductById(id)
    product.value = res.data
    selectedColor.value = product.value.colors?.[0] ?? ''
    selectedSize.value = product.value.sizes?.[1] ?? product.value.sizes?.[0] ?? ''
    activeEmoji.value = product.value.gallery?.[0] ?? product.value.thumbnailUrl ?? ''
    qty.value = 1
    activeTab.value = 'desc'
    show3DModal.value = false
  } catch (e) {
    if (e.response?.status === 404) {
      error.value = 'not_found'
    } else {
      error.value = 'api_error'
    }
  } finally {
    loading.value = false
  }
}

function retry() {
  loadProduct(props.id)
}

function changeQty(delta) {
  qty.value = Math.max(1, Math.min(product.value?.stock ?? 99, qty.value + delta))
}

function openRoom3D() {
  router.push({
    name: 'room3d',
    query: {
      productId: product.value?.id ?? '',
      roomType: product.value?.roomTypeHint ?? '',
    },
  })
}

const breadcrumbLinks = ref([])
watch(product, (p) => {
  if (!p) { breadcrumbLinks.value = []; return }
  breadcrumbLinks.value = (p.breadcrumb ?? []).map((crumb) => ({
    label: crumb.label ?? crumb,
    to: (crumb.id === 'home' || crumb === 'Trang chủ')
      ? { name: 'home' }
      : { name: 'products', query: { category: crumb.id } },
  }))
})

watch(() => props.id, (id) => loadProduct(id))
onMounted(() => loadProduct(props.id))
</script>

<template>
  <div class="product-detail-page">
    <!-- Loading state -->
    <div v-if="loading" class="pd-state-center">
      <div class="pd-spinner"></div>
      <p>Đang tải sản phẩm...</p>
    </div>

    <!-- Not found state -->
    <div v-else-if="error === 'not_found'" class="pd-state-center">
      <p class="pd-state-icon">🔍</p>
      <h2>Sản phẩm không tồn tại</h2>
      <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <RouterLink class="pd-btn-back" :to="{ name: 'products' }">← Quay lại danh sách</RouterLink>
    </div>

    <!-- API error state -->
    <div v-else-if="error === 'api_error'" class="pd-state-center">
      <p class="pd-state-icon">⚠️</p>
      <h2>Không thể tải sản phẩm</h2>
      <p>Đã xảy ra lỗi kết nối. Vui lòng thử lại.</p>
      <button class="pd-btn-retry" @click="retry">Thử lại</button>
    </div>

    <!-- Product loaded -->
    <template v-else-if="product">
      <div class="pd-breadcrumb">
        <span v-for="(crumb, idx) in breadcrumbLinks" :key="crumb.label">
          <template v-if="idx > 0"> › </template>
          <RouterLink class="pd-breadcrumb-link" :to="crumb.to">{{ crumb.label }}</RouterLink>
        </span>
        <span> › <span class="pd-breadcrumb-current">{{ product.name }}</span></span>
      </div>
      <ProductDetailTopSection
        :product="product"
        :selected-color="selectedColor"
        :selected-size="selectedSize"
        :qty="qty"
        :wished="wished"
        :active-emoji="activeEmoji"
        @pick-emoji="activeEmoji = $event"
        @pick-color="selectedColor = $event"
        @pick-size="selectedSize = $event"
        @change-qty="changeQty"
        @toggle-wish="wished = !wished"
        @open-3d="show3DModal = true"
        @go-room3d="openRoom3D"
      />
      <ProductDetailTabsSection :product="product" :active-tab="activeTab" @switch-tab="activeTab = $event" />
      <ProductDetail3DModal
        :open="show3DModal"
        :model-url="product.modelUrl"
        :product-name="product.name"
        :supports3d="product.supports3d"
        :room-type-hint="product.roomTypeHint"
        @close="show3DModal = false"
        @go-room3d="openRoom3D"
      />
    </template>
  </div>
</template>
