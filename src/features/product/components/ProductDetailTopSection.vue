<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useToast } from '@shared/composables/useToast'

const { t } = useI18n()
const props = defineProps({
  product: { type: Object, required: true },
  selectedColor: { type: String, required: false },
  selectedSize: { type: String, required: false },
  selectedStock: { type: Number, default: 0 },
  selectedOutOfStock: { type: Boolean, default: false },
  qty: { type: Number, required: true },
  wished: { type: Boolean, default: false },
  activeImage: { type: String, required: true },
  displayGallery: { type: Array, default: () => [] },
  cartAdding: { type: Boolean, default: false },
  cartAdded: { type: Boolean, default: false },
  cartError: { type: String, default: '' },
})

const emit = defineEmits([
  'pick-image',
  'pick-color',
  'pick-size',
  'change-qty',
  'set-qty',
  'add-cart',
  'buy-now',
  'toggle-wish',
  'open-3d',
  'go-room3d',
])

const { show: showToast } = useToast()

const isOutOfStock = computed(() => props.selectedOutOfStock || Number(props.selectedStock || 0) <= 0)
const cannotIncrease = computed(() => Number(props.qty || 1) >= Number(props.selectedStock || 0))
const qtyDraft = ref(String(props.qty || 1))

watch(
  () => props.qty,
  (value) => {
    qtyDraft.value = String(value || 1)
  },
)

function handleQtyInput(value) {
  qtyDraft.value = String(value ?? '').replace(/[^\d]/g, '')
  if (qtyDraft.value !== '') {
    emit('set-qty', qtyDraft.value)
  }
}

function commitQtyInput() {
  if (qtyDraft.value === '') {
    qtyDraft.value = String(props.qty || 1)
    return
  }
  emit('set-qty', qtyDraft.value)
}

const variants = computed(() => props.product?.variants || [])

function isValidColor(color) {
  return variants.value.some(v => v.color === color && (!props.selectedSize || v.dimensionText === props.selectedSize))
}

function isValidSize(size) {
  return variants.value.some(v => v.dimensionText === size && (!props.selectedColor || v.color === props.selectedColor))
}

function handlePickColor(color) {
  emit('pick-color', color)
  if (props.selectedSize && !variants.value.some(v => v.color === color && v.dimensionText === props.selectedSize)) {
    const validVariant = variants.value.find(v => v.color === color)
    if (validVariant && validVariant.dimensionText) {
      emit('pick-size', validVariant.dimensionText)
    }
  }
}

function handlePickSize(size) {
  emit('pick-size', size)
  if (props.selectedColor && !variants.value.some(v => v.dimensionText === size && v.color === props.selectedColor)) {
    const validVariant = variants.value.find(v => v.dimensionText === size)
    if (validVariant && validVariant.color) {
      emit('pick-color', validVariant.color)
    }
  }
}

function handleOpen3D() {
  const matched = variants.value.find((v) => {
    const matchesColor = !props.selectedColor || v.color === props.selectedColor
    const matchesSize = !props.selectedSize || v.dimensionText === props.selectedSize
    return matchesColor && matchesSize
  }) || variants.value.find((v) => !props.selectedColor || v.color === props.selectedColor) || variants.value[0]

  if (matched && !matched.supports3d && !matched.modelUrl) {
    showToast(t('productDetail.top.noModel3D'))
    return
  }
  emit('open-3d')
}
</script>

<template>
  <div class="pd-wrap">
    <div class="pd-gallery">
      <div class="pd-main">
        <div class="pd-img-wrap">
          <AppImage
            v-if="activeImage || product.image"
            :src="activeImage || product.image"
            :alt="product.name || 'Hình ảnh sản phẩm'"
            class="pd-main-img"
           />
        </div>
        <AppButton type="button" class="pd-btn-3d" @click="handleOpen3D">
          <AppIcon name="box" :size="16" />
          {{ t('productDetail.top.view3D') }}
        </AppButton>
      </div>
      <div class="pd-thumbs">
        <AppButton
          v-for="imgUrl in displayGallery"
          :key="imgUrl"
          type="button"
          variant="unstyled"
          size="unstyled"
          :class="['thumb', { active: activeImage === imgUrl }]"
          @click="emit('pick-image', imgUrl)"
        >
          <AppImage :src="imgUrl" :alt="`Ảnh ${product.name}`"  />
        </AppButton>
      </div>
    </div>

    <aside class="pd-buy-panel">
      <div class="pd-info">
        <p class="pd-kicker">{{ product.categoryName || product.category?.name || 'FurniSight collection' }}</p>
        <h1 class="name">{{ product.name }}</h1>
        <div class="rating">
          <span class="rating-stars" aria-label="Đánh giá sản phẩm">
            <AppIcon
              v-for="star in 5"
              :key="`detail-star-${star}`"
              name="star"
              :size="15"
              :class="{ active: star <= Math.round(product.rating || 5) }"
            />
          </span>
          <strong>{{ product.rating ? Number(product.rating).toFixed(1) : '5.0' }}</strong>
          <small>({{ t('productDetail.top.reviews', { count: product.ratingCount || 0 }) }})</small>
          <small>{{ t('products.sold', { count: product.soldCount || 0 }) }}</small>
        </div>
        <div class="price-box">
          <span>{{ t('productDetail.top.listedPrice') }}</span>
          <p class="price">{{ product.formattedPrice }}</p>
        </div>
        <p v-if="product.description" class="pd-short-desc">{{ product.description }}</p>
      </div>

      <div class="pd-purchase-options">
        <div v-if="product.colors?.length" class="pd-option-group">
          <p class="opt-label">{{ t('productDetail.top.color') }} <span>{{ selectedColor }}</span></p>
          <div class="colors">
            <AppButton
              v-for="color in product.colors"
              :key="color"
              variant="unstyled"
              size="unstyled"
              :class="['color-btn', { active: selectedColor === color, unavailable: !isValidColor(color) }]"
              @click="handlePickColor(color)"
            >
              {{ color }}
            </AppButton>
          </div>
        </div>

        <div v-if="product.sizes?.length" class="pd-option-group">
          <p class="opt-label">{{ t('productDetail.top.size') }} <span>{{ selectedSize }}</span></p>
          <div class="sizes">
            <AppButton
              v-for="size in product.sizes"
              :key="size"
              variant="unstyled"
              size="unstyled"
              :class="['size-btn', { active: selectedSize === size, unavailable: !isValidSize(size) }]"
              @click="handlePickSize(size)"
            >
              {{ size }}
            </AppButton>
          </div>
        </div>
      </div>

      <div class="pd-buy-actions">
        <div class="qty-row">
          <div class="qty-ctrl">
            <AppButton variant="unstyled" size="unstyled" aria-label="Giảm số lượng" :disabled="qty <= 1" @click="emit('change-qty', -1)">
              <AppIcon name="minus" :size="15" />
            </AppButton>
            <input
              :value="qtyDraft"
              type="number"
              inputmode="numeric"
              min="1"
              :max="selectedStock || undefined"
              :disabled="isOutOfStock"
              :aria-label="t('productDetail.top.quantity')"
              @input="handleQtyInput($event.target.value)"
              @blur="commitQtyInput"
              @keydown.enter.prevent="commitQtyInput"
            />
            <AppButton variant="unstyled" size="unstyled" aria-label="Tăng số lượng" :disabled="cannotIncrease || isOutOfStock" @click="emit('change-qty', 1)">
              <AppIcon name="plus" :size="15" />
            </AppButton>
          </div>
          <span>{{ selectedStock > 0 ? t('productDetail.top.inStock', { count: selectedStock }) : t('productDetail.top.outOfStock') }}</span>
        </div>
        <p v-if="isOutOfStock || cartError" class="pd-cart-error">
          {{ cartError || t('productDetail.top.outOfStockMessage') }}
        </p>
        <div class="actions">
          <AppButton
            type="button"
            class="outline"
            :class="{ loading: cartAdding, added: cartAdded }"
            :disabled="cartAdding || isOutOfStock"
            @click="emit('add-cart')"
          >
            <AppIcon v-if="cartAdded" name="check" :size="17" />
            <AppIcon v-else name="cart" :size="17" />
            {{ isOutOfStock ? t('productDetail.top.soldOut') : cartAdding ? t('productDetail.top.adding') : cartAdded ? t('productDetail.top.added') : t('productDetail.top.add') }}
          </AppButton>
          <AppButton
            type="button"
            class="solid"
            :disabled="cartAdding || isOutOfStock"
            @click="emit('buy-now')"
          >
            <AppIcon :name="isOutOfStock ? 'ban' : 'creditCard'" :size="17" />
            {{ isOutOfStock ? t('productDetail.top.soldOut') : cartAdding ? t('productDetail.top.processing') : t('productDetail.top.buyNow') }}
          </AppButton>
          <AppButton
            type="button"
            class="wish"
            :class="{ active: wished }"
            :aria-label="wished ? 'Bỏ yêu thích' : 'Yêu thích'"
            @click="emit('toggle-wish')"
          >
            <AppIcon name="heart" :size="18" />
          </AppButton>
        </div>
      </div>
    </aside>
  </div>
</template>
