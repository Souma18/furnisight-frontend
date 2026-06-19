<script setup>
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  selectedProduct: {
    type: Object,
    default: null,
  },
  selectedScale: {
    type: Object,
    default: () => ({ x: 1, y: 1, z: 1 }),
  },
  selectedColor: {
    type: String,
    default: '#ffffff',
  },
  selectedRotationY: {
    type: Number,
    default: 0,
  },
  isSelectedInCart: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'close',
  'update-scale',
  'update-color',
  'update-rotation',
  'rotate-selected',
  'reset-color',
  'add-to-cart',
  'remove-product',
])

const { t } = useI18n()
</script>

<template>
  <div v-if="selectedProduct" class="item-quick-panel">
    <div class="panel-head">
      <strong>{{ selectedProduct.name }}</strong>
      <button type="button" class="close-btn" @click="$emit('close')">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="panel-row">
      <label>{{ t('room3d.furniture.width') }}</label>
      <input
        type="range"
        min="0.5"
        max="1.8"
        step="0.05"
        :value="selectedScale.x"
        @input="$emit('update-scale', 'x', Number($event.target.value))"
      />
    </div>
    <div class="panel-row">
      <label>{{ t('room3d.furniture.height') }}</label>
      <input
        type="range"
        min="0.5"
        max="1.8"
        step="0.05"
        :value="selectedScale.y"
        @input="$emit('update-scale', 'y', Number($event.target.value))"
      />
    </div>
    <div class="panel-row">
      <label>{{ t('room3d.furniture.depth') }}</label>
      <input
        type="range"
        min="0.5"
        max="1.8"
        step="0.05"
        :value="selectedScale.z"
        @input="$emit('update-scale', 'z', Number($event.target.value))"
      />
    </div>
    <div class="panel-row">
      <label>{{ t('room3d.furniture.color') }}</label>
      <input type="color" :value="selectedColor" @input="$emit('update-color', $event.target.value)" />
    </div>
    <div class="panel-row">
      <label>{{ t('room3d.furniture.rotate') }}</label>
      <input
        type="range"
        min="-3.1416"
        max="3.1416"
        step="0.02"
        :value="selectedRotationY"
        @input="$emit('update-rotation', Number($event.target.value))"
      />
    </div>
    <div class="rotate-actions">
      <button type="button" class="action-btn ghost" @click="$emit('rotate-selected', -0.2618)">
        <AppIcon name="rotateCcw" :size="14" />
        <span>-15°</span>
      </button>
      <button type="button" class="action-btn ghost" @click="$emit('rotate-selected', 0.2618)">
        <AppIcon name="rotateCw" :size="14" />
        <span>+15°</span>
      </button>
    </div>
    <p class="drag-hint">{{ t('room3d.furniture.dragHint') }}</p>

    <div class="panel-actions">
      <button type="button" class="action-btn ghost" @click="$emit('reset-color')">{{ t('room3d.furniture.defaultColor') }}</button>
      <button
        type="button"
        class="action-btn primary"
        :disabled="isSelectedInCart"
        @click="$emit('add-to-cart')"
      >
        {{ isSelectedInCart ? t('room3d.product.added') : t('room3d.product.addToCart') }}
      </button>
      <button type="button" class="action-btn danger" @click="$emit('remove-product')">{{ t('room3d.furniture.remove') }}</button>
    </div>
  </div>
</template>

<style scoped>
.item-quick-panel {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 16.4rem;
  border: 1px solid #e4dccf;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  box-shadow: 0 10px 24px rgba(16, 57, 82, 0.14);
  padding: 0.62rem;
  z-index: 9;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.panel-head strong {
  font-size: 0.84rem;
  color: #1e3342;
}

.close-btn {
  border: none;
  background: #f3efe8;
  color: #5a6772;
  border-radius: 0.4rem;
  width: 1.4rem;
  height: 1.4rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.panel-row {
  display: grid;
  grid-template-columns: 2.1rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.panel-row label {
  font-size: 0.74rem;
  color: #596572;
}

.panel-row input[type='range'] {
  width: 100%;
}

.panel-row input[type='color'] {
  width: 100%;
  height: 1.5rem;
  border: 1px solid #d8cec1;
  border-radius: 0.35rem;
  background: #fff;
  padding: 0.1rem;
  cursor: pointer;
}

.rotate-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  margin-top: 0.2rem;
}

.drag-hint {
  margin: 0.35rem 0 0;
  color: #65727e;
  font-size: 0.72rem;
  line-height: 1.3;
}

.panel-actions {
  margin-top: 0.45rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.35rem;
}

.action-btn {
  width: 100%;
  border: none;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.42rem 0.6rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: filter 0.16s ease, opacity 0.16s ease;
}

.action-btn.primary {
  background: #0f3f5c;
}

.action-btn.primary:not(:disabled):hover {
  filter: brightness(1.15);
}

.action-btn.primary:disabled {
  background: #ccd5dc;
  cursor: not-allowed;
  color: #7b8f9e;
}

.action-btn.danger {
  background: transparent;
  color: #d13c3c;
  border: 1px solid rgba(209, 60, 60, 0.25);
}

.action-btn.danger:hover {
  background: #fff5f5;
  border-color: #d13c3c;
}

.action-btn.ghost {
  background: transparent;
  color: #1a496b;
  border: 1px solid rgba(26, 73, 107, 0.25);
}

.action-btn.ghost:hover {
  background: #f0f4f8;
}
</style>
