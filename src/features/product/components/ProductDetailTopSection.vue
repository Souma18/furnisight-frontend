<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  product: { type: Object, required: true },
  selectedColor: { type: String, required: false },
  selectedSize: { type: String, required: false },
  qty: { type: Number, required: true },
  wished: { type: Boolean, default: false },
  activeImage: { type: String, required: true },
  cartAdding: { type: Boolean, default: false },
  cartAdded: { type: Boolean, default: false },
})

const emit = defineEmits([
  'pick-image',
  'pick-color',
  'pick-size',
  'change-qty',
  'add-cart',
  'buy-now',
  'toggle-wish',
  'open-3d',
  'go-room3d',
])
</script>

<template>
  <div class="pd-wrap">
    <div class="pd-gallery">
      <div class="pd-main">
        <div class="pd-img-wrap">
          <img
            v-if="activeImage || product.image"
            :src="activeImage || product.image"
            alt="Hình ảnh sản phẩm"
            class="pd-main-img"
          />
        </div>
        <button type="button" class="pd-btn-3d" @click="emit('open-3d')">
          <AppIcon name="box" :size="16" />
          Xem mô hình 3D
        </button>
      </div>
      <div class="pd-thumbs">
        <button
          v-for="imgUrl in product.gallery"
          :key="imgUrl"
          type="button"
          :class="['thumb', { active: activeImage === imgUrl }]"
          @click="emit('pick-image', imgUrl)"
        >
          <img :src="imgUrl" alt="Thumbnail" />
        </button>
      </div>
    </div>

    <div class="pd-info">
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
        <small>({{ product.ratingCount || 0 }} đánh giá)</small>
        <small>Đã bán {{ product.soldCount || 0 }}</small>
      </div>
      <div class="price-box">
        <div>
          <p class="price">{{ product.formattedPrice }}</p>
        </div>
      </div>
      <p v-if="product.colors?.length" class="opt-label">Màu sắc: <span>{{ selectedColor }}</span></p>
      <div v-if="product.colors?.length" class="colors">
        <button
          v-for="color in product.colors"
          :key="color"
          type="button"
          :class="['color-btn', { active: selectedColor === color }]"
          @click="emit('pick-color', color)"
        >
          {{ color }}
        </button>
      </div>
      
      <div v-if="product.sizes?.length">
        <p class="opt-label">Kích thước: <span>{{ selectedSize }}</span></p>
        <div class="sizes">
          <button
            v-for="size in product.sizes"
            :key="size"
            type="button"
            :class="['size-btn', { active: selectedSize === size }]"
            @click="emit('pick-size', size)"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <div class="qty-row">
        <div class="qty-ctrl">
          <button type="button" aria-label="Giảm số lượng" @click="emit('change-qty', -1)">
            <AppIcon name="minus" :size="15" />
          </button>
          <input :value="qty" readonly />
          <button type="button" aria-label="Tăng số lượng" @click="emit('change-qty', 1)">
            <AppIcon name="plus" :size="15" />
          </button>
        </div>
        <span>{{ product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Tạm hết hàng' }}</span>
      </div>
      <div class="actions">
        <button
          type="button"
          class="outline"
          :class="{ loading: cartAdding, added: cartAdded }"
          :disabled="cartAdding"
          @click="emit('add-cart')"
        >
          <AppIcon v-if="cartAdded" name="check" :size="17" />
          <AppIcon v-else name="cart" :size="17" />
          {{ cartAdding ? 'Đang thêm...' : cartAdded ? 'Đã thêm' : 'Thêm vào giỏ' }}
        </button>
        <button
          type="button"
          class="solid"
          :disabled="cartAdding"
          @click="emit('buy-now')"
        >
          <AppIcon name="sparkles" :size="17" />
          {{ cartAdding ? 'Đang xử lý...' : 'Mua ngay' }}
        </button>
        <button
          type="button"
          class="wish"
          :class="{ active: wished }"
          :aria-label="wished ? 'Bỏ yêu thích' : 'Yêu thích'"
          @click="emit('toggle-wish')"
        >
          <AppIcon name="heart" :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>
