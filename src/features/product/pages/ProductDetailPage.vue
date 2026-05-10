<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ProductDetailTopSection from '../components/ProductDetailTopSection.vue'
import ProductDetailTabsSection from '../components/ProductDetailTabsSection.vue'
import ProductDetail3DModal from '../components/ProductDetail3DModal.vue'
import { getProductDetailById, productDetailMap } from '../mock/productDetailMockData'
import '../styles/productDetail.css'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const product = computed(() => getProductDetailById(props.id) ?? productDetailMap['oak-bed'])
const selectedColor = ref(product.value.colors[0] ?? '')
const selectedSize = ref(product.value.sizes[1] ?? product.value.sizes[0] ?? '')
const qty = ref(1)
const wished = ref(false)
const activeEmoji = ref(product.value.gallery[0] ?? '🛏️')
const activeTab = ref('desc')
const show3DModal = ref(false)
const breadcrumbLinks = computed(() => {
  const crumbs = product.value.breadcrumb ?? []
  return crumbs.map((crumb, index) => {
    const query = {
      level: String(index + 1),
      breadcrumb: crumb,
      source: 'detail',
    }
    return {
      label: crumb,
      to: crumb === 'Trang chủ' ? { name: 'home' } : { name: 'products', query },
    }
  })
})

function changeQty(delta) {
  qty.value = Math.max(1, Math.min(product.value.stock, qty.value + delta))
}

function openRoom3D() {
  const query = {
    productId: product.value.room3dProductId ? String(product.value.room3dProductId) : '',
    roomType: product.value.roomTypeHint ?? '',
  }
  router.push({ name: 'room3d', query })
}

watch(
  () => props.id,
  () => {
    selectedColor.value = product.value.colors[0] ?? ''
    selectedSize.value = product.value.sizes[1] ?? product.value.sizes[0] ?? ''
    qty.value = 1
    activeEmoji.value = product.value.gallery[0] ?? '🛏️'
    activeTab.value = 'desc'
    show3DModal.value = false
  },
)
</script>

<template>
  <div class="product-detail-page">
    <div class="pd-breadcrumb">
      <span v-for="(crumb, idx) in breadcrumbLinks" :key="crumb.label">
        <template v-if="idx > 0"> › </template>
        <RouterLink class="pd-breadcrumb-link" :to="crumb.to">{{ crumb.label }}</RouterLink>
      </span>
      <span> › <span class="pd-breadcrumb-current">{{ product.currentCrumb }}</span></span>
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
  </div>
</template>
