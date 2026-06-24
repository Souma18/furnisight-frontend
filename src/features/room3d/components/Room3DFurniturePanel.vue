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
  screenPos: {
    type: Object,
    default: () => ({ left: 0, top: 0, visible: false })
  }
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
  'nudge-selected',
])

const PRESET_COLORS = ['#ffffff', '#333333', '#888888', '#8b5a2b', '#0f3f5c', '#d8aa56']
const { t } = useI18n()
</script>

<template>
  <div v-if="selectedProduct">
    <!-- Fixed Panel (Top Right) -->
    <div class="item-quick-panel">
      <div class="panel-head">
        <strong>{{ selectedProduct.name }}</strong>
        <button type="button" class="close-btn" @click="$emit('close')">
          <AppIcon name="close" :size="14" />
        </button>
      </div>

      <div class="panel-row">
        <label>{{ t('room3d.furniture.color') }}</label>
        <div class="color-swatches">
          <button
            v-for="c in PRESET_COLORS"
            :key="c"
            type="button"
            class="swatch-btn"
            :class="{ active: selectedColor === c }"
            :style="{ backgroundColor: c }"
            @click="$emit('update-color', c)"
          ></button>
        </div>
      </div>

      <div class="panel-actions">
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

    <!-- Floating HUD -->
    <div
      v-if="screenPos?.visible"
      class="hud-container"
      :style="{ left: screenPos.left + 'px', top: screenPos.top + 'px' }"
    >
      <button class="hud-nudge up" @click="$emit('nudge-selected', 0, -0.05)" title="Lên"><AppIcon name="chevronUp" :size="24"/></button>
      <button class="hud-nudge down" @click="$emit('nudge-selected', 0, 0.05)" title="Xuống"><AppIcon name="chevronDown" :size="24"/></button>
      <button class="hud-nudge left" @click="$emit('nudge-selected', -0.05, 0)" title="Trái"><AppIcon name="chevronLeft" :size="24"/></button>
      <button class="hud-nudge right" @click="$emit('nudge-selected', 0.05, 0)" title="Phải"><AppIcon name="chevronRight" :size="24"/></button>

      <div class="hud-rotate">
        <button type="button" @click="$emit('rotate-selected', -0.2618)">
          <AppIcon name="rotateCcw" :size="16" /> Xoay trái
        </button>
        <button type="button" @click="$emit('rotate-selected', 0.2618)">
          Xoay phải <AppIcon name="rotateCw" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* FIXED PANEL STYLES */
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

.panel-actions {
  margin-top: 0.65rem;
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

.color-swatches {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.swatch-btn {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.swatch-btn:hover {
  transform: scale(1.1);
}

.swatch-btn.active {
  border-color: #c9922a;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #c9922a;
}

/* FLOATING HUD STYLES */
.hud-container {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.hud-container > * {
  pointer-events: auto;
}

.hud-nudge {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  color: #1a496b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

.hud-nudge:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: scale(1.15);
  color: #c9922a;
}

.hud-nudge.up { top: -70px; left: -16px; }
.hud-nudge.down { bottom: -70px; left: -16px; }
.hud-nudge.left { left: -70px; top: -16px; }
.hud-nudge.right { right: -70px; top: -16px; }

.hud-rotate {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  padding: 6px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.hud-rotate button {
  border: none;
  background: transparent;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a496b;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.hud-rotate button:hover {
  background: rgba(15, 63, 92, 0.1);
  color: #c9922a;
}
</style>
