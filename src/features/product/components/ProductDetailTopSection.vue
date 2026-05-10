<script setup>
defineProps({
  product: { type: Object, required: true },
  selectedColor: { type: String, required: true },
  selectedSize: { type: String, required: true },
  qty: { type: Number, required: true },
  wished: { type: Boolean, default: false },
  activeEmoji: { type: String, required: true },
})

const emit = defineEmits([
  'pick-emoji',
  'pick-color',
  'pick-size',
  'change-qty',
  'toggle-wish',
  'open-3d',
  'go-room3d',
])
</script>

<template>
  <div class="pd-wrap">
    <div class="pd-gallery">
      <div class="pd-main">
        <span class="pd-badge">Mới</span>
        <span class="pd-badge sale">-20%</span>
        <div class="pd-emoji">{{ activeEmoji }}</div>
        <button type="button" class="pd-btn-3d" @click="emit('open-3d')">📦 Xem mô hình 3D</button>
      </div>
      <div class="pd-thumbs">
        <button
          v-for="emoji in product.gallery"
          :key="emoji"
          type="button"
          :class="['thumb', { active: activeEmoji === emoji }]"
          @click="emit('pick-emoji', emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <div class="pd-info">
      <p class="collection">{{ product.collection }}</p>
      <h1 class="name">{{ product.name }}</h1>
      <div class="rating">
        <span>{{ product.rating.stars }}</span>
        <strong>{{ product.rating.score }}</strong>
        <small>({{ product.rating.count }} đánh giá)</small>
        <small>Đã bán {{ product.rating.sold }}</small>
      </div>
      <div class="price-box">
        <div>
          <p class="price">₫ {{ product.price.current }}</p>
          <p class="old">{{ product.price.old }} đ</p>
        </div>
        <span class="save">{{ product.price.save }}</span>
      </div>
      <p class="opt-label">Màu sắc: <span>{{ selectedColor }}</span></p>
      <div class="colors">
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
      <p class="opt-label">Kích thước:</p>
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
      <div class="qty-row">
        <div class="qty-ctrl">
          <button type="button" @click="emit('change-qty', -1)">−</button>
          <input :value="qty" readonly />
          <button type="button" @click="emit('change-qty', 1)">+</button>
        </div>
        <span>Còn hàng ({{ product.stock }} sản phẩm)</span>
      </div>
      <div class="actions">
        <button type="button" class="outline">🛒 Thêm vào giỏ</button>
        <button type="button" class="solid">✦ Mua ngay</button>
        <button type="button" class="wish" :class="{ active: wished }" @click="emit('toggle-wish')">
          {{ wished ? '♥' : '♡' }}
        </button>
      </div>
      <!-- <div class="room3d-cta">
        <button type="button" class="solid room3d-btn" @click="emit('go-room3d')">
          🏠 Đặt vào phòng 3D
        </button>
      </div> -->
    </div>
  </div>
</template>
