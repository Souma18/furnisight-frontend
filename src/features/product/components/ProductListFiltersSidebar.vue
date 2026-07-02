<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { onMounted, onUnmounted } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import {
  PRODUCT_PRICE_BAND_OPTIONS,
} from '../composables/productFilterOptions'
import { useProductFiltersSidebar } from '../composables/useProductFiltersSidebar'

const props = defineProps({
  mode: { type: String, default: 'sidebar' },
  open: { type: Boolean, default: true },
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

const emit = defineEmits(['select-category', 'apply', 'clear', 'close'])

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

function handleEscape(event) {
  if (event.key === 'Escape' && props.mode === 'drawer' && props.open) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body" :disabled="mode !== 'drawer'">
    <div
      :class="mode === 'drawer' ? ['pl-filter-drawer-shell', { open }] : 'pl-filter-sidebar-shell'"
      :aria-hidden="mode === 'drawer' ? String(!open) : undefined"
      @keydown.esc="handleEscape"
    >
      <AppButton
        v-if="mode === 'drawer'"
        type="button"
        variant="unstyled"
        class="pl-filter-backdrop"
        :aria-label="$t('products.sidebar.close')"
        @click="emit('close')"
      ></AppButton>
      
      <aside
        class="pl-sidebar-filters"
        :class="mode === 'drawer' ? 'pl-sidebar-filters--drawer' : `pl-sidebar-filters--${mode}`"
        :aria-label="$t('products.sidebar.title')"
      >
        <header v-if="mode === 'drawer'" class="pl-filter-drawer-head">
          <div>
            <p>{{ $t('products.sidebar.title') }}</p>
            <strong>{{ $t('products.sidebar.categoryCount', { count: totalCategoryCount }) }}</strong>
          </div>
          <AppButton type="button" variant="unstyled" class="pl-filter-close" :aria-label="$t('products.sidebar.close')" @click="emit('close')">
            <AppIcon name="close" :size="18" />
          </AppButton>
        </header>

        <div :class="mode === 'drawer' ? 'pl-filter-drawer-content' : 'pl-filter-content-wrapper'">
          <div class="pl-filter-block">
            <div class="pl-filter-block-header" role="button" tabindex="0" @click="toggleBlock('cat')" @keydown.enter.prevent="toggleBlock('cat')">
              <div class="pl-fb-title">
                <AppIcon class="pl-fb-icon" name="category" :size="16" />
                {{ $t('products.sidebar.category') }}
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
            <div class="pl-filter-block-header" role="button" tabindex="0" @click="toggleBlock('price')" @keydown.enter.prevent="toggleBlock('price')">
              <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="banknote" :size="16" /> {{ $t('products.sidebar.priceRange') }}</div>
              <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.price }" name="chevronDown" :size="16" />
            </div>
            <div v-show="openBlocks.price" class="pl-filter-body">
              <div class="pl-price-range-display">
                <span class="pl-price-val">{{ priceMinLabel }}</span>
                <span class="pl-price-sep">-</span>
                <span class="pl-price-val pl-price-val--right">{{ priceMaxLabel }}</span>
              </div>
              <input
                v-model.number="pending.priceSliderStep"
                class="pl-range-slider"
                type="range"
                min="0"
                max="4"
                step="1"
              />
              <div class="pl-price-checks">
                <label v-for="opt in PRODUCT_PRICE_BAND_OPTIONS" :key="opt.id" class="pl-check-row">
                  <input
                    type="checkbox"
                    :value="opt.id"
                    :checked="pending.priceBands.includes(opt.id)"
                    @change="togglePriceBand(opt.id)"
                  />
                  <span>{{ $t(`products.priceBands.${opt.id}`) }}</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="displayMaterials.length" class="pl-filter-block">
            <div class="pl-filter-block-header" role="button" tabindex="0" @click="toggleBlock('mat')" @keydown.enter.prevent="toggleBlock('mat')">
              <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="box" :size="16" /> {{ $t('products.sidebar.material') }}</div>
              <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.mat }" name="chevronDown" :size="16" />
            </div>
            <div v-show="openBlocks.mat" class="pl-filter-body">
              <div class="pl-mat-list">
                <label v-for="m in displayMaterials" :key="m.id" class="pl-mat-row">
                  <input type="checkbox" :value="m.id" v-model="pending.materials" />
                  <span>{{ m.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="displayColors.length" class="pl-filter-block">
            <div class="pl-filter-block-header" role="button" tabindex="0" @click="toggleBlock('color')" @keydown.enter.prevent="toggleBlock('color')">
              <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="palette" :size="16" /> {{ $t('products.sidebar.color') }}</div>
              <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.color }" name="chevronDown" :size="16" />
            </div>
            <div v-show="openBlocks.color" class="pl-filter-body">
              <div class="pl-color-filter-row">
                <AppButton
                  v-for="c in displayColors"
                  :key="c.id"
                  type="button"
                  variant="unstyled"
                  class="pl-cf-swatch"
                  :class="{ active: pending.colors.includes(c.id) }"
                  :style="{ background: c.hex, border: c.id === 'ivory' ? '1px solid #ece2cf' : undefined }"
                  :title="c.label"
                  :aria-label="c.label"
                  @click="toggleArrayItem('colors', c.id)"
                ></AppButton>
              </div>
            </div>
          </div>

          <div class="pl-filter-block">
            <div class="pl-filter-block-header" role="button" tabindex="0" @click="toggleBlock('rating')" @keydown.enter.prevent="toggleBlock('rating')">
              <div class="pl-fb-title"><AppIcon class="pl-fb-icon" name="star" :size="16" /> {{ $t('products.sidebar.rating') }}</div>
              <AppIcon class="pl-fb-toggle" :class="{ open: openBlocks.rating }" name="chevronDown" :size="16" />
            </div>
            <div v-show="openBlocks.rating" class="pl-filter-body">
              <div class="pl-star-rows">
                <label v-for="opt in displayRatings" :key="opt.value" class="pl-star-row">
                  <input type="radio" name="pl-star-filter" :value="opt.value" v-model="pending.minStar" />
                  <span class="pl-star-icons" :aria-label="$t('products.sidebar.ratingAria')">
                    <AppIcon
                      v-for="star in 5"
                      :key="`${opt.value}-filter-star-${star}`"
                      name="star"
                      :size="14"
                      :class="{ active: star <= opt.value }"
                    />
                  </span>
                  <span class="pl-star-num">{{ opt.value === 5 ? $t('products.sidebar.stars5Hint', { count: opt.count }) : $t('products.sidebar.starsHint', { star: opt.value, count: opt.count }) }}</span>
                </label>
                <label class="pl-star-row">
                  <input type="radio" name="pl-star-filter" :value="null" v-model="pending.minStar" />
                  <span class="pl-star-num">{{ $t('products.sidebar.allStars') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <footer v-if="mode === 'drawer'" class="pl-filter-drawer-actions">
          <AppButton type="button" variant="unstyled" class="pl-filter-clear" @click="clearAll">
            <AppIcon name="close" :size="15" />
            {{ $t('products.sidebar.clearAll') }}
          </AppButton>
          <AppButton type="button" variant="unstyled" class="pl-filter-apply" @click="applyFilters">{{ $t('products.sidebar.apply') }}</AppButton>
        </footer>
        <div v-else class="pl-filter-block pl-filter-actions">
          <AppButton type="button" variant="unstyled" class="pl-filter-apply" @click="applyFilters">{{ $t('products.sidebar.apply') }}</AppButton>
          <AppButton type="button" variant="unstyled" class="pl-filter-clear" @click="clearAll">
            <AppIcon name="close" :size="15" />
            {{ $t('products.sidebar.clearAllLong') }}
          </AppButton>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
