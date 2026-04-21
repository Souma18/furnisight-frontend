<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
  added: {
    type: Boolean,
    default: false,
  },
  suggested: {
    type: Boolean,
    default: false,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
  shapeStep: {
    type: Number,
    default: 0,
  },
})

defineEmits(['add'])
</script>

<template>
  <article class="card" :class="{ added }" :style="{ '--pc-step': shapeStep }">
    <div class="preview">
      <span class="new-badge">AI ✦</span>
      <div class="emoji">{{ product.emoji }}</div>
    </div>

    <div class="content">
      <h4 class="name">{{ product.name }}</h4>

      <div class="bottom">
        <div class="prices">
          <p class="price-current">{{ formatCurrency(product.price) }}</p>
        </div>

        <button type="button" class="add-btn" :disabled="added" @click="$emit('add', product)">
          {{ added ? '✓' : '+' }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  border: 2px solid #f2c36a;
  border-radius: 1rem;
  overflow: hidden;
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
  --pc-step: 0;
  --pc-content-scale: clamp(0.7, calc(1 - (var(--pc-step) * 0.1)), 1);
}

.card:hover {
  border-color: #e1ab47;
  box-shadow: 0 6px 16px rgba(15, 63, 92, 0.13);
  transform: translateY(-2px);
}

.card:active {
  transform: translateY(0);
}

.card.added {
  border-color: #5ab36f;
  background: #fbfffc;
}

.preview {
  position: relative;
  min-height: calc(5.25rem + (var(--pc-step) * 0.3rem));
  background: #ede9e2;
  display: grid;
  place-items: center;
  padding: calc(0.4rem * var(--pc-content-scale));
  transition: background-color 0.2s ease;
}

.card:hover .preview {
  background: #f2ede5;
}

.new-badge {
  position: absolute;
  left: calc(0.45rem * var(--pc-content-scale));
  top: calc(0.4rem * var(--pc-content-scale));
  background: #f6b22f;
  color: #0f3f5c;
  border-radius: calc(0.55rem * var(--pc-content-scale));
  padding: calc(0.2rem * var(--pc-content-scale)) calc(0.45rem * var(--pc-content-scale));
  font-weight: 700;
  font-size: calc(0.58rem * var(--pc-content-scale));
  letter-spacing: 0.02em;
}

.emoji {
  width: 100%;
  text-align: center;
  font-size: calc(2.2rem * var(--pc-content-scale));
  line-height: 1;
  transition: transform 0.2s ease;
}

.card:hover .emoji {
  transform: scale(1.06);
}

.content {
  background: #ffffff;
  padding: calc(0.45rem * var(--pc-content-scale)) calc(0.5rem * var(--pc-content-scale))
    calc(0.45rem * var(--pc-content-scale));
}

.name {
  margin: 0;
  color: #0f172a;
  font-size: calc(0.62rem + (0.2rem * var(--pc-content-scale)));
  line-height: 1.18;
  min-height: calc(2.25em * var(--pc-content-scale));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bottom {
  margin-top: calc(0.26rem * var(--pc-content-scale));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(0.25rem * var(--pc-content-scale));
}

.prices {
  display: flex;
  flex-direction: column;
}

.price-current {
  margin: 0;
  color: #9a744f;
  font-size: calc(0.62rem + (0.26rem * var(--pc-content-scale)));
  font-weight: 700;
  line-height: 1.1;
}

.add-btn {
  width: calc(1.7rem + (0.28rem * var(--pc-content-scale)));
  height: calc(1.7rem + (0.28rem * var(--pc-content-scale)));
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #d8aa56 0%, #c58d2f 100%);
  color: #fff;
  font-size: calc(0.95rem * var(--pc-content-scale));
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease,
    background 0.18s ease;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.06);
  box-shadow: 0 6px 12px rgba(197, 141, 47, 0.34);
  filter: saturate(1.06);
}

.add-btn:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.add-btn:disabled {
  opacity: 1;
  cursor: default;
  background: linear-gradient(180deg, #63c27a 0%, #4ca862 100%);
  box-shadow: none;
}
</style>
