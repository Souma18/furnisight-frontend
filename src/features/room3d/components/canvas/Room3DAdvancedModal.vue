<script setup>
import { ref, reactive } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AppButton from '@shared/ui/AppButton.vue'
import AppModal from '@shared/ui/AppModal.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  open: { type: Boolean, default: false },
  hasRoom: { type: Boolean, default: false },
  roomScaleLabel: { type: String, default: '0' },
  canDecreaseRoomScale: { type: Boolean, default: false },
  canIncreaseRoomScale: { type: Boolean, default: false },
  useRealDimensions: { type: Boolean, default: false },
  realDimensions: {
    type: Object,
    default: () => ({ length: 0, width: 0, height: 0 }),
  },
})

const emit = defineEmits([
  'close',
  'toggle-fullscreen',
  'decrease-room-scale',
  'increase-room-scale',
  'reset-room-scale',
  'apply-real-dimensions',
  'toggle-real-dimensions',
])

const { t } = useI18n()

// Local form state for real dimensions
const dimForm = reactive({
  length: props.realDimensions?.length || '',
  width: props.realDimensions?.width || '',
  height: props.realDimensions?.height || '',
})

const dimError = ref('')

function handleApplyDimensions() {
  const len = Number(dimForm.length)
  const wid = Number(dimForm.width)
  const hgt = Number(dimForm.height)

  if (!len || !wid || !hgt || len <= 0 || wid <= 0 || hgt <= 0) {
    dimError.value = t('room3d.advanced.dimError', 'Vui lòng nhập đầy đủ và hợp lệ chiều dài, rộng, cao (> 0 cm).')
    return
  }
  if (len > 5000 || wid > 5000 || hgt > 2000) {
    dimError.value = t('room3d.advanced.dimRangeError', 'Kích thước vượt quá giới hạn cho phép (dài/rộng ≤ 5000 cm, cao ≤ 2000 cm).')
    return
  }
  dimError.value = ''
  emit('apply-real-dimensions', { length: len, width: wid, height: hgt })
}

function handleResetDimensions() {
  dimForm.length = ''
  dimForm.width = ''
  dimForm.height = ''
  dimError.value = ''
  emit('reset-room-scale')
}
</script>

<template>
  <AppModal :open="open" width="440px" @close="$emit('close')">
    <div class="adv-modal">
      <!-- Header -->
      <div class="adv-modal__header">
        <div class="adv-modal__title-row">
          <span class="adv-modal__icon-wrap">
            <AppIcon name="layoutGrid" :size="18" />
          </span>
          <h2 class="adv-modal__title">{{ t('room3d.advanced.title', 'Công cụ nâng cao') }}</h2>
        </div>
        <button class="adv-modal__close" type="button" :aria-label="t('common.close', 'Đóng')" @click="$emit('close')">
          <AppIcon name="close" :size="16" />
        </button>
      </div>

      <!-- Body -->
      <div v-if="hasRoom" class="adv-modal__body">

        <!-- Section: View scale -->
        <section class="adv-section">
          <p class="adv-section__label">{{ t('room3d.controls.scale', 'KÍCH THƯỚC PHÒNG') }}</p>
          <div class="adv-scale-row">
            <AppButton
              type="button"
              variant="unstyled"
              class="adv-icon-btn"
              :disabled="!canDecreaseRoomScale"
              :aria-label="t('room3d.controls.scaleDown', 'Thu nhỏ')"
              @click="$emit('decrease-room-scale')"
            >
              <AppIcon name="minus" :size="14" />
            </AppButton>
            <AppButton
              type="button"
              variant="unstyled"
              class="adv-scale-value"
              :aria-label="t('room3d.controls.scaleReset', 'Đặt lại')"
              @click="$emit('reset-room-scale')"
            >
              {{ roomScaleLabel }}
            </AppButton>
            <AppButton
              type="button"
              variant="unstyled"
              class="adv-icon-btn"
              :disabled="!canIncreaseRoomScale"
              :aria-label="t('room3d.controls.scaleUp', 'Phóng to')"
              @click="$emit('increase-room-scale')"
            >
              <AppIcon name="plus" :size="14" />
            </AppButton>
            <span class="adv-scale-hint">{{ t('room3d.advanced.scaleHint', 'Nhấn vào số để đặt lại') }}</span>
          </div>
        </section>

        <div class="adv-divider" />

        <!-- Section: Panorama -->
        <section class="adv-section">
          <p class="adv-section__label">{{ t('room3d.advanced.panorama', 'XEM TOÀN CẢNH') }}</p>
          <AppButton
            type="button"
            variant="unstyled"
            class="adv-action-btn adv-action-btn--navy"
            @click="$emit('toggle-fullscreen'); $emit('close')"
          >
            <AppIcon name="fullscreen" :size="15" />
            <span>{{ t('room3d.controls.panorama', 'Xem toàn cảnh 3D') }}</span>
          </AppButton>
        </section>

        <div class="adv-divider" />

        <!-- Section: Real room dimensions -->
        <section class="adv-section">
          <div class="adv-section__head">
            <p class="adv-section__label">{{ t('room3d.advanced.realDims', 'NHẬP KÍCH THƯỚC THỰC TẾ') }}</p>
            <label class="adv-toggle" :title="t('room3d.advanced.toggleTitle', 'Bật/Tắt hiệu chỉnh kích thước')">
              <input
                type="checkbox"
                :checked="useRealDimensions"
                class="adv-toggle__input"
                @change="$emit('toggle-real-dimensions', $event.target.checked)"
              />
              <span class="adv-toggle__track" />
            </label>
          </div>
          <p class="adv-section__desc">
            {{ t('room3d.advanced.realDimsDesc', 'Hiệu chỉnh mô hình khi kích thước AI dự đoán không khớp thực tế. Sản phẩm sẽ được scale theo kích thước variant.') }}
          </p>

          <div class="adv-dim-grid">
            <label class="adv-dim-field">
              <span class="adv-dim-field__label">{{ t('room3d.advanced.dimLength', 'Chiều dài') }}</span>
              <div class="adv-dim-field__input-wrap">
                <input
                  v-model="dimForm.length"
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  class="adv-dim-input"
                  :placeholder="t('room3d.advanced.dimPlaceholder', 'vd: 400')"
                />
                <span class="adv-dim-unit">cm</span>
              </div>
            </label>
            <label class="adv-dim-field">
              <span class="adv-dim-field__label">{{ t('room3d.advanced.dimWidth', 'Chiều rộng') }}</span>
              <div class="adv-dim-field__input-wrap">
                <input
                  v-model="dimForm.width"
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  class="adv-dim-input"
                  :placeholder="t('room3d.advanced.dimPlaceholder', 'vd: 300')"
                />
                <span class="adv-dim-unit">cm</span>
              </div>
            </label>
            <label class="adv-dim-field">
              <span class="adv-dim-field__label">{{ t('room3d.advanced.dimHeight', 'Chiều cao') }}</span>
              <div class="adv-dim-field__input-wrap">
                <input
                  v-model="dimForm.height"
                  type="number"
                  min="1"
                  max="2000"
                  step="1"
                  class="adv-dim-input"
                  :placeholder="t('room3d.advanced.dimPlaceholder', 'vd: 280')"
                />
                <span class="adv-dim-unit">cm</span>
              </div>
            </label>
          </div>

          <p v-if="dimError" class="adv-dim-error" role="alert">{{ dimError }}</p>

          <div class="adv-dim-actions">
            <AppButton
              type="button"
              variant="unstyled"
              class="adv-action-btn adv-action-btn--gold"
              @click="handleApplyDimensions"
            >
              <AppIcon name="check" :size="14" />
              <span>{{ t('room3d.advanced.apply', 'Áp dụng kích thước') }}</span>
            </AppButton>
            <AppButton
              type="button"
              variant="unstyled"
              class="adv-action-btn adv-action-btn--ghost"
              @click="handleResetDimensions"
            >
              <AppIcon name="refresh" :size="14" />
              <span>{{ t('room3d.advanced.reset', 'Đặt lại') }}</span>
            </AppButton>
          </div>
        </section>
      </div>

      <!-- No room state -->
      <div v-else class="adv-modal__no-room">
        <AppIcon name="boxes" :size="32" />
        <p>{{ t('room3d.advanced.noRoom', 'Chọn hoặc tải ảnh phòng để dùng các công cụ nâng cao.') }}</p>
      </div>
    </div>
  </AppModal>
</template>
