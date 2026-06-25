<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { PriceFormatter } from '@shared/lib/formatters'
import { productsApi } from '@shared/lib/api/services'

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
  isOpen: Boolean,
})

const emit = defineEmits(['close', 'send-product'])
const mgr = props.manager

const searchQuery = ref('')
const activeCat = ref('all')
const categories = ref([{ id: 'all', name: 'Tất cả' }])

const products = ref([])
const page = ref(0)
const loading = ref(false)
const hasMore = ref(true)

const selectedProduct = computed(() => products.value.find((p) => p.id === mgr.selectedProdId.value))

async function loadCategories() {
  try {
    const res = await productsApi.getRootCategories()
    const list = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.content ?? []
    categories.value = [
      { id: 'all', name: 'Tất cả' },
      ...list.map(c => ({ id: c.slug || c.id, name: c.name }))
    ]
  } catch (error) {
    console.error('Failed to load categories', error)
  }
}

async function fetchProducts(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 0
    products.value = []
    hasMore.value = true
    mgr.selectedProdId.value = null
  }

  if (!hasMore.value) return
  loading.value = true

  try {
    const params = { size: 20, page: page.value }
    if (activeCat.value !== 'all') {
      params.category = activeCat.value
    }
    if (searchQuery.value) {
      params.q = searchQuery.value
    }

    const res = await productsApi.getProducts(params)
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.items ?? []
    
    if (items.length < 20) {
      hasMore.value = false
    }

    products.value = reset ? items : [...products.value, ...items]
    page.value++
  } catch (error) {
    console.error('Failed to fetch products', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout = null
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProducts(true)
  }, 500)
})

watch(activeCat, () => {
  fetchProducts(true)
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (categories.value.length <= 1) {
        loadCategories()
      }
      if (products.value.length === 0) {
        fetchProducts(true)
      }
    } else {
      searchQuery.value = ''
      activeCat.value = 'all'
    }
  },
)

function onScroll(e) {
  const target = e.target
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
    fetchProducts()
  }
}

function onOverlayClick(event) {
  if (event.target === event.currentTarget) close()
}

function close() {
  emit('close')
}

function sendProduct() {
  if (selectedProduct.value) {
    emit('send-product', {
      ...selectedProduct.value,
      price: selectedProduct.value.price || selectedProduct.value.variants?.[0]?.price || 0,
      stock: selectedProduct.value.stock || selectedProduct.value.variants?.[0]?.stock || 0,
    })
    close()
  }
}

function getProductPrice(p) {
  return p.price || p.variants?.[0]?.price || 0
}

function getProductStock(p) {
  return p.stock || p.variants?.[0]?.stock || 0
}
</script>

<template>
  <Teleport to="body">
    <div class="sp-overlay cm-feature-vars" :class="{ open: isOpen }" @click="onOverlayClick">
      <div class="sp-modal" role="dialog" aria-modal="true" @click.stop>
        <div class="sp-head">
          <div class="sp-head-title">Gửi <em>sản phẩm tư vấn</em></div>
          <button type="button" class="sp-close" aria-label="Đóng" @click="close">
            <AppIcon name="close" :size="14" />
          </button>
        </div>

        <div class="sp-body" @scroll="onScroll">
          <div class="sp-search-wrap">
            <AppIcon name="search" />
            <input v-model="searchQuery" type="text" placeholder="Tìm theo tên, SKU, danh mục..." />
          </div>

          <div class="sp-cats">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="sp-cat-chip"
              :class="{ active: activeCat === cat.id }"
              @click="activeCat = cat.id"
            >
              {{ cat.name }}
            </button>
          </div>

          <div class="sp-prod-grid">
            <div
              v-for="p in products"
              :key="p.id"
              class="sp-prod-item"
              :class="{ selected: mgr.selectedProdId.value === p.id }"
              @click="mgr.selectProduct(p.id)"
            >
              <div class="sp-prod-img">
                <img v-if="p.imageUrls && p.imageUrls.length" :src="p.imageUrls[0]" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" />
                <div v-else style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #eee; border-radius: 8px; color: #999;">No IMG</div>
                <div class="sp-prod-check"><AppIcon name="check" :size="10" /></div>
              </div>
              <div class="sp-prod-body">
                <div class="sp-prod-cat">{{ p.category }}</div>
                <div class="sp-prod-name">{{ p.name }}</div>
                <div class="sp-prod-price">{{ PriceFormatter.format(getProductPrice(p)) }}</div>
                <div class="sp-prod-sku">{{ p.sku || p.id }} · {{ getProductStock(p) > 0 ? `Còn ${getProductStock(p)} sp` : 'Hết hàng' }}</div>
              </div>
            </div>
            <div
              v-if="!products.length && !loading"
              style="grid-column: 1 / -1; padding: 20px; text-align: center; font-size: 12px; color: var(--text4)"
            >
              Không tìm thấy sản phẩm.
            </div>
            <div
              v-if="loading"
              style="grid-column: 1 / -1; padding: 20px; text-align: center; font-size: 12px; color: var(--text4)"
            >
              Đang tải...
            </div>
          </div>
        </div>

        <div class="sp-foot">
          <div class="sp-sel-info">
            <template v-if="selectedProduct">
              Đã chọn: <strong>{{ selectedProduct.name }}</strong>
            </template>
            <template v-else>Chưa chọn sản phẩm</template>
          </div>
          <div class="sp-foot-actions">
            <button type="button" class="sp-cancel-btn" @click="close">Huỷ</button>
            <button type="button" class="sp-send-btn" :disabled="!selectedProduct" @click="sendProduct">
              <AppIcon name="send" /> Gửi sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
