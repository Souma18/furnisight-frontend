<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  selectedRoom: {
    type: Object,
    default: null,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['open-checkout'])

function goHome() {
  router.push('/')
}
</script>

<template>
  <header class="header">
    <div class="brand">
      <span class="brand-icon">🪙</span>
      <span class="brand-text">LUXNEST</span>
    </div>

    <div class="center-title">
      <span class="title">Truc quan hoa 3D</span>
      <span class="ai-pill">✨ AI Powered</span>
    </div>

    <div class="actions">
      <button type="button" class="action-btn ghost" @click="goHome">← Trang chu</button>
      <button type="button" class="action-btn ghost">⛶ Toan man hinh</button>
      <button type="button" class="action-btn gold" @click="$emit('open-checkout')">
        Thanh toan
        <span class="cart-badge">{{ cartCount }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.7rem 1rem;
  background: linear-gradient(180deg, #133f5c 0%, #0c3148 100%);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
}

.brand-icon {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 178, 60, 0.2);
}

.brand-text {
  color: #efe6d7;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.center-title {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
}

.title {
  color: #e7f0f8;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.ai-pill {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #1f3f53;
  border-radius: 999px;
  padding: 0.24rem 0.72rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  justify-content: flex-end;
}

.action-btn {
  border: none;
  cursor: pointer;
  border-radius: 0.55rem;
  min-height: 1.9rem;
  padding: 0.28rem 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 600;
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.16);
  color: #eef4f9;
}

.action-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.24);
}

.action-btn.gold {
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #ffffff;
}

.action-btn.gold:hover {
  filter: brightness(1.06);
}

.cart-badge {
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  background: #f7b94c;
  color: #233f53;
  font-size: 0.62rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 980px) {
  .header {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
