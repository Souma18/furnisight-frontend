<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

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

const categories = [
  { key: 'all', label: 'Tất cả', emoji: '' },
  { key: 'phong-ngu', label: 'Phòng ngủ', emoji: '🛏️' },
  { key: 'phong-khach', label: 'Phòng khách', emoji: '🛋️' },
  { key: 'van-phong', label: 'Văn phòng', emoji: '🪑' },
  { key: 'den', label: 'Đèn', emoji: '💡' },
]

const filteredProducts = computed(() => {
  let filtered = mgr.products.value

  if (activeCat.value !== 'all') {
    filtered = filtered.filter((p) => p.catKey === activeCat.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q),
    )
  }

  return filtered
})

const selectedProduct = computed(() => mgr.products.value.find((p) => p.id === mgr.selectedProdId.value))

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      searchQuery.value = ''
      activeCat.value = 'all'
      mgr.selectedProdId.value = null
    }
  },
)

function onOverlayClick(event) {
  if (event.target === event.currentTarget) close()
}

function close() {
  emit('close')
}

function sendProduct() {
  if (selectedProduct.value) {
    emit('send-product', selectedProduct.value)
    close()
  }
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

        <div class="sp-body">
          <div class="sp-search-wrap">
            <AppIcon name="search" />
            <input v-model="searchQuery" type="text" placeholder="Tìm theo tên, SKU, danh mục..." />
          </div>

          <div class="sp-cats">
            <button
              v-for="cat in categories"
              :key="cat.key"
              type="button"
              class="sp-cat-chip"
              :class="{ active: activeCat === cat.key }"
              @click="activeCat = cat.key"
            >
              {{ cat.emoji ? `${cat.emoji} ` : '' }}{{ cat.label }}
            </button>
          </div>

          <div class="sp-prod-grid">
            <div
              v-for="p in filteredProducts"
              :key="p.id"
              class="sp-prod-item"
              :class="{ selected: mgr.selectedProdId.value === p.id }"
              @click="mgr.selectProduct(p.id)"
            >
              <div class="sp-prod-img">
                {{ p.icon }}
                <div class="sp-prod-check"><AppIcon name="check" :size="10" /></div>
              </div>
              <div class="sp-prod-body">
                <div class="sp-prod-cat">{{ p.cat }}</div>
                <div class="sp-prod-name">{{ p.name }}</div>
                <div class="sp-prod-price">{{ p.price }}</div>
                <div class="sp-prod-sku">{{ p.id }} · {{ p.stock > 0 ? `Còn ${p.stock} sp` : 'Hết hàng' }}</div>
              </div>
            </div>
            <div
              v-if="!filteredProducts.length"
              style="grid-column: 1 / -1; padding: 20px; text-align: center; font-size: 12px; color: var(--text4)"
            >
              Không tìm thấy sản phẩm.
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
