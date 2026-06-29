<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useRouter } from 'vue-router'

defineProps({
  cartItems: {
    type: Array,
    default: () => [],
  },
  cartTotal: {
    type: Number,
    default: 0,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
})

defineEmits(['remove', 'checkout'])

const isOpen = ref(false)
const { t } = useI18n()
const router = useRouter()

function itemIconName(item) {
  const raw = `${item.categoryName ?? ''} ${item.category ?? ''}`.toLowerCase()
  if (raw.includes('sofa')) return 'sofa'
  if (raw.includes('chair') || raw.includes('ghế')) return 'armchair'
  if (raw.includes('bed') || raw.includes('giường')) return 'bed'
  if (raw.includes('table') || raw.includes('bàn')) return 'table'
  return 'box'
}

function goToDetail(item) {
  const identifier = item.slug || item.productId
  if (identifier) {
    router.push(`/product/${identifier}`)
  }
}
</script>

<template>
  <section class="cart">
    <AppButton type="button" variant="unstyled" class="cart-toggle" @click="isOpen = !isOpen">
      <span class="toggle-left">
        <span class="icon"><AppIcon name="cart" :size="14" /></span>
        <span class="title">{{ t('cart.title') }}</span>
        <span class="count">{{ cartItems.length }}</span>
      </span>
      <span class="toggle-right">
        <strong class="total">{{ formatCurrency(cartTotal) }}</strong>
        <span class="chevron" :class="{ open: isOpen }">
          <AppIcon name="chevronRight" :size="13" />
        </span>
      </span>
    </AppButton>

    <div v-if="isOpen" class="cart-body">
      <div v-if="cartItems.length === 0" class="empty">{{ t('room3d.cart.empty') }}</div>
      <div v-else class="list">
        <article v-for="item in cartItems" :key="item.id" class="item" role="button" tabindex="0" @click="goToDetail(item)" @keydown.enter="goToDetail(item)">
          <div class="thumb">
            <AppImage v-if="item.imageUrl || item.image" :src="item.imageUrl || item.image" :alt="item.name"  />
            <span v-else class="thumb-icon"><AppIcon :name="itemIconName(item)" :size="16" /></span>
          </div>
          <div class="meta">
            <p class="name">{{ item.name }}</p>
            <p class="price">{{ formatCurrency(item.price) }}</p>
          </div>
          <AppButton type="button" variant="unstyled" class="remove-btn" @click.stop="$emit('remove', item.id)">
            <AppIcon name="close" :size="15" />
          </AppButton>
        </article>
      </div>

      <AppButton type="button" class="checkout" :disabled="cartItems.length === 0" @click="$emit('checkout')">
        <AppIcon name="creditCard" :size="15" />
        <span>{{ t('room3d.cart.checkoutNow') }}</span>
      </AppButton>
    </div>
  </section>
</template>
