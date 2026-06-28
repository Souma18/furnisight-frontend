<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useToast } from '@shared/composables/useToast'
import { computed } from 'vue'

const props = defineProps({
  selectedProduct: {
    type: Object,
    default: null,
  },
  selectedSceneItem: {
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

const emit = defineEmits([
  'close',
  'update-variant',
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
const { show: showToast } = useToast()

const variants = computed(() => props.selectedProduct?.variants || [])

const availableColors = computed(() => {
  const colors = new Set()
  variants.value.forEach((v) => { if (v.color) colors.add(v.color) })
  return Array.from(colors)
})

const currentVariant = computed(() => {
  return variants.value.find((v) => v.id === props.selectedSceneItem?.variantId) || variants.value[0] || null
})

function pickVariant(variant) {
  if (!variant.supports3d && !variant.modelUrl) {
    showToast('Phiên bản này chưa có mô hình 3D.', 'error')
    return
  }
  if (currentVariant.value?.id !== variant.id) {
    emit('update-variant', props.selectedSceneItem?.instanceId, variant.id)
  }
}
</script>

<template>
  <div v-if="selectedProduct">
    <!-- Fixed Panel (Top Right) -->
    <div class="item-quick-panel">
      <div class="panel-head">
        <strong>{{ selectedProduct.name }}</strong>
        <AppButton type="button" variant="unstyled" class="close-btn" @click="$emit('close')">
          <AppIcon name="close" :size="14" />
        </AppButton>
      </div>

      <div v-if="variants.length > 0" class="panel-row variants-row">
        <label>Phiên bản</label>
        <div class="variant-pills">
          <AppButton
            v-for="v in variants"
            :key="v.id"
            type="button"
            variant="unstyled"
            class="pill-btn"
            :class="{ active: currentVariant?.id === v.id, unavailable: !v.supports3d && !v.modelUrl }"
            @click="pickVariant(v)"
          >
            {{ v.color || '' }}{{ v.color && v.dimensionText ? ' - ' : '' }}{{ v.dimensionText || '' }}{{ (!v.color && !v.dimensionText) ? 'Mặc định' : '' }}
          </AppButton>
        </div>
      </div>

      <div class="panel-actions">
        <AppButton
          type="button"
          class="action-btn primary"
          variant="primary"
          :disabled="isSelectedInCart"
          @click="$emit('add-to-cart')"
        >
          {{ isSelectedInCart ? t('room3d.product.added') : t('room3d.product.addToCart') }}
        </AppButton>
        <AppButton type="button" class="action-btn danger" variant="danger" @click="$emit('remove-product')">{{ t('room3d.furniture.remove') }}</AppButton>
      </div>
    </div>

    <!-- Floating HUD -->
    <div
      v-if="screenPos?.visible"
      class="hud-container"
      :style="{ left: screenPos.left + 'px', top: screenPos.top + 'px' }"
    >
      <AppButton variant="unstyled" class="hud-nudge up" @click="$emit('nudge-selected', 0, -0.05)" title="Lên"><AppIcon name="chevronUp" :size="24"/></AppButton>
      <AppButton variant="unstyled" class="hud-nudge down" @click="$emit('nudge-selected', 0, 0.05)" title="Xuống"><AppIcon name="chevronDown" :size="24"/></AppButton>
      <AppButton variant="unstyled" class="hud-nudge left" @click="$emit('nudge-selected', -0.05, 0)" title="Trái"><AppIcon name="chevronLeft" :size="24"/></AppButton>
      <AppButton variant="unstyled" class="hud-nudge right" @click="$emit('nudge-selected', 0.05, 0)" title="Phải"><AppIcon name="chevronRight" :size="24"/></AppButton>

      <div class="hud-rotate">
        <AppButton type="button" variant="unstyled" @click="$emit('rotate-selected', -0.2618)">
          <AppIcon name="rotateCcw" :size="16" /> Xoay trái
        </AppButton>
        <AppButton type="button" variant="unstyled" @click="$emit('rotate-selected', 0.2618)">
          Xoay phải <AppIcon name="rotateCw" :size="16" />
        </AppButton>
      </div>
    </div>
  </div>
</template>
