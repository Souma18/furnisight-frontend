<script setup>
import { computed, reactive, watch } from 'vue'
import {
  PRODUCT_PRICE_BAND_OPTIONS,
  PRODUCT_STAR_FILTER_OPTIONS,
} from '../mock/productListMockData'

const props = defineProps({
  selectedCategory: { type: String, default: 'all' },
  /** Bộ lọc đã áp dụng (đồng bộ khi bấm Áp dụng / Xóa từ cha). */
  applied: {
    type: Object,
    default: () => ({
      priceBands: [],
      priceSliderPct: 100,
      materials: [],
      colors: [],
      minStar: null,
    }),
  },
  facets: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['select-category', 'apply', 'clear'])

const openBlocks = reactive({
  cat: true,
  price: true,
  mat: true,
  color: true,
  rating: true,
})

const pending = reactive({
  priceBands: [],
  priceSliderPct: 100,
  materials: [],
  colors: [],
  minStar: null,
})

function syncPendingFromApplied() {
  const a = props.applied ?? {}
  pending.priceBands = [...(a.priceBands ?? [])]
  pending.priceSliderPct = Number(a.priceSliderPct ?? 100)
  pending.materials = [...(a.materials ?? [])]
  pending.colors = [...(a.colors ?? [])]
  pending.minStar = a.minStar != null ? Number(a.minStar) : null
}

watch(
  () => props.applied,
  () => syncPendingFromApplied(),
  { deep: true, immediate: true },
)

const displayCategories = computed(() => props.facets?.categories || [])
const displayMaterials = computed(() => props.facets?.materials || [])
const displayColors = computed(() => props.facets?.colors || [])

const totalCategoryCount = computed(() =>
  displayCategories.value.find((c) => c.id === 'all')?.count ?? 0,
)

function toggleBlock(key) {
  openBlocks[key] = !openBlocks[key]
}

function selectCategory(cat) {
  // Emit the slug for BE filtering; fallback to id if no slug
  emit('select-category', cat.slug ?? cat.id)
}

function toggleBand(id) {
  const i = pending.priceBands.indexOf(id)
  if (i === -1) pending.priceBands.push(id)
  else pending.priceBands.splice(i, 1)
}

function toggleMaterial(id) {
  const i = pending.materials.indexOf(id)
  if (i === -1) pending.materials.push(id)
  else pending.materials.splice(i, 1)
}

function toggleColor(id) {
  const i = pending.colors.indexOf(id)
  if (i === -1) pending.colors.push(id)
  else pending.colors.splice(i, 1)
}

function onSliderInput(e) {
  pending.priceSliderPct = Number(e.target.value)
}

const priceMinLabel = '0đ'
const priceMaxLabel = computed(() =>
  pending.priceSliderPct >= 100 ? '50tr+' : `${Math.round((pending.priceSliderPct / 100) * 50)}tr`,
)

function applyFilters() {
  emit('apply', {
    priceBands: [...pending.priceBands],
    priceSliderPct: pending.priceSliderPct,
    materials: [...pending.materials],
    colors: [...pending.colors],
    minStar: pending.minStar,
  })
}

function clearAll() {
  emit('clear')
}

function categoryActive(cat) {
  const current = String(props.selectedCategory ?? 'all').toLowerCase()
  // Match against slug (primary) or label (fallback)
  return current === String(cat.slug ?? '').toLowerCase() ||
         current === String(cat.label ?? '').toLowerCase()
}
</script>

<template>
  <aside class="pl-sidebar-filters">
    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('cat')">
        <div class="pl-fb-title">
          <span class="pl-fb-icon">📂</span> Danh mục
          <span class="pl-fb-count">{{ totalCategoryCount }}</span>
        </div>
        <span class="pl-fb-toggle" :class="{ open: openBlocks.cat }">▲</span>
      </div>
      <div v-show="openBlocks.cat" class="pl-filter-body">
        <ul class="pl-cat-list" role="list">
          <li
            v-for="cat in displayCategories"
            :key="cat.id"
            :class="{ active: categoryActive(cat) }"
            @click="selectCategory(cat)"
          >
            <span class="pl-cl-name">{{ cat.label }}</span>
            <span class="pl-cl-count">{{ cat.count }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('price')">
        <div class="pl-fb-title"><span class="pl-fb-icon">💰</span> Khoảng giá</div>
        <span class="pl-fb-toggle" :class="{ open: openBlocks.price }">▲</span>
      </div>
      <div v-show="openBlocks.price" class="pl-filter-body">
        <div class="pl-price-range-display">
          <span class="pl-price-val">{{ priceMinLabel }}</span>
          <span class="pl-price-sep">—</span>
          <span class="pl-price-val" style="text-align: right">{{ priceMaxLabel }}</span>
        </div>
        <input
          class="pl-range-slider"
          type="range"
          min="0"
          max="100"
          :value="pending.priceSliderPct"
          @input="onSliderInput"
        />
        <div class="pl-price-checks">
          <label v-for="opt in PRODUCT_PRICE_BAND_OPTIONS" :key="opt.id" class="pl-check-row">
            <input
              type="checkbox"
              :checked="pending.priceBands.includes(opt.id)"
              @change="toggleBand(opt.id)"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('mat')">
        <div class="pl-fb-title"><span class="pl-fb-icon">🪵</span> Chất liệu</div>
        <span class="pl-fb-toggle" :class="{ open: openBlocks.mat }">▲</span>
      </div>
      <div v-show="openBlocks.mat" class="pl-filter-body">
        <div class="pl-mat-list">
          <label v-for="m in displayMaterials" :key="m.id" class="pl-mat-row">
            <input
              type="checkbox"
              :checked="pending.materials.includes(m.id)"
              @change="toggleMaterial(m.id)"
            />
            <span>{{ m.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('color')">
        <div class="pl-fb-title"><span class="pl-fb-icon">🎨</span> Màu sắc</div>
        <span class="pl-fb-toggle" :class="{ open: openBlocks.color }">▲</span>
      </div>
      <div v-show="openBlocks.color" class="pl-filter-body">
        <div class="pl-color-filter-row">
          <button
            v-for="c in displayColors"
            :key="c.id"
            type="button"
            class="pl-cf-swatch"
            :class="{ active: pending.colors.includes(c.id) }"
            :style="{
              background: c.hex,
              border: c.id === 'ivory' ? '1px solid #ece2cf' : undefined,
            }"
            :title="c.label"
            :aria-label="c.label"
            @click="toggleColor(c.id)"
          ></button>
        </div>
      </div>
    </div>

    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('rating')">
        <div class="pl-fb-title"><span class="pl-fb-icon">⭐</span> Đánh giá</div>
        <span class="pl-fb-toggle" :class="{ open: openBlocks.rating }">▲</span>
      </div>
      <div v-show="openBlocks.rating" class="pl-filter-body">
        <div class="pl-star-rows">
          <label v-for="opt in PRODUCT_STAR_FILTER_OPTIONS" :key="opt.value" class="pl-star-row">
            <input
              type="radio"
              name="pl-star-filter"
              :checked="pending.minStar === opt.value"
              @change="pending.minStar = opt.value"
            />
            <span class="pl-star-icons">{{ opt.stars }}</span>
            <span class="pl-star-num">{{ opt.hint }}</span>
          </label>
          <label class="pl-star-row">
            <input
              type="radio"
              name="pl-star-filter"
              :checked="pending.minStar === null"
              @change="pending.minStar = null"
            />
            <span class="pl-star-num">Tất cả</span>
          </label>
        </div>
      </div>
    </div>

    <div class="pl-filter-block pl-filter-actions">
      <button type="button" class="pl-filter-apply" @click="applyFilters">Áp dụng bộ lọc</button>
      <button type="button" class="pl-filter-clear" @click="clearAll">✕ Xóa tất cả bộ lọc</button>
    </div>
  </aside>
</template>
