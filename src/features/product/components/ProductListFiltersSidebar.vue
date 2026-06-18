<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import {
  PRODUCT_PRICE_BAND_OPTIONS,
} from '../composables/productFilterOptions'
import { useProductFiltersSidebar } from '../composables/useProductFiltersSidebar'

const props = defineProps({
  selectedCategory: { type: String, default: 'all' },
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

const {
  openBlocks,
  pending,
  displayCategories,
  displayMaterials,
  displayColors,
  displayRatings,
  totalCategoryCount,
  toggleBlock,
  selectCategory,
  toggleArrayItem,
  togglePriceBand,
  priceMinLabel,
  priceMaxLabel,
  applyFilters,
  clearAll,
  categoryActive,
} = useProductFiltersSidebar(props, emit)
</script>

<template>
  <aside class="pl-sidebar-filters">
    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('cat')">
        <div class="pl-fb-title">
          <AppIcon class="pl-fb-icon" name="category" :size="16" />
          Danh mục
          <span class="pl-fb-count">{{ totalCategoryCount }}</span>
        </div>
        <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.cat }" name="chevronDown" :size="16" />
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
        <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="banknote" :size="16" /> Khoảng giá</div>
        <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.price }" name="chevronDown" :size="16" />
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
          max="4"
          step="1"
          v-model.number="pending.priceSliderStep"
        />
        <div class="pl-price-checks">
          <label v-for="opt in PRODUCT_PRICE_BAND_OPTIONS" :key="opt.id" class="pl-check-row">
            <input
              type="checkbox"
              :value="opt.id"
              :checked="pending.priceBands.includes(opt.id)"
              @change="togglePriceBand(opt.id)"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div v-if="displayMaterials.length" class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('mat')">
        <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="box" :size="16" /> Chất liệu</div>
        <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.mat }" name="chevronDown" :size="16" />
      </div>
      <div v-show="openBlocks.mat" class="pl-filter-body">
        <div class="pl-mat-list">
          <label v-for="m in displayMaterials" :key="m.id" class="pl-mat-row">
            <input
              type="checkbox"
              :value="m.id"
              v-model="pending.materials"
            />
            <span>{{ m.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div v-if="displayColors.length" class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('color')">
        <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="palette" :size="16" /> Màu sắc</div>
        <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.color }" name="chevronDown" :size="16" />
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
            @click="toggleArrayItem('colors', c.id)"
          ></button>
        </div>
      </div>
    </div>

    <div class="pl-filter-block">
      <div class="pl-filter-block-header" role="button" @click="toggleBlock('rating')">
        <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="star" :size="16" /> Đánh giá</div>
        <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.rating }" name="chevronDown" :size="16" />
      </div>
      <div v-show="openBlocks.rating" class="pl-filter-body">
        <div class="pl-star-rows">
          <label v-for="opt in displayRatings" :key="opt.value" class="pl-star-row">
            <input
              type="radio"
              name="pl-star-filter"
              :value="opt.value"
              v-model="pending.minStar"
            />
            <span class="pl-star-icons" aria-label="Mức đánh giá">
              <AppIcon
                v-for="star in 5"
                :key="`${opt.value}-filter-star-${star}`"
                name="star"
                :size="14"
                :class="{ active: star <= opt.value }"
              />
            </span>
            <span class="pl-star-num">{{ opt.hint }}</span>
          </label>
          <label class="pl-star-row">
            <input
              type="radio"
              name="pl-star-filter"
              :value="null"
              v-model="pending.minStar"
            />
            <span class="pl-star-num">Tất cả</span>
          </label>
        </div>
      </div>
    </div>

    <div class="pl-filter-block pl-filter-actions">
      <button type="button" class="pl-filter-apply" @click="applyFilters">Áp dụng bộ lọc</button>
      <button type="button" class="pl-filter-clear" @click="clearAll">
        <AppIcon name="close" :size="15" />
        Xóa tất cả bộ lọc
      </button>
    </div>
  </aside>
</template>
