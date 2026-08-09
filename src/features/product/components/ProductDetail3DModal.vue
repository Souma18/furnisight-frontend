<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import { useI18n } from 'vue-i18n'
import AppIcon from "@shared/ui/AppIcon.vue";
import AppModal from "@shared/ui/AppModal.vue";
import { useProduct3DViewer } from '../composables/useProduct3DViewer'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelUrl: { type: String, default: "" },
  productName: { type: String, default: "" },
  supports3d: { type: Boolean, default: false },
  roomTypeHint: { type: String, default: "bedroom" },
});
const { t } = useI18n()
const emit = defineEmits(["close", "go-room3d"]);

const {
  viewportRef,
  isLoading,
  loadError,
  viewMode,
} = useProduct3DViewer(props);
</script>

<template>
  <AppModal :open="open" width="700px" no-bg :close-on-backdrop="false" @close="emit('close')">
    <div class="pd-3d-modal">
      <div class="box">
      <div class="head">
        <strong>{{ t('productDetail.modal.title', { name: productName || t('productDetail.modal.defaultProduct') }) }}</strong>
        <AppButton type="button" :aria-label="t('productDetail.modal.close')" @click="emit('close')">
          <AppIcon name="close" :size="22" :stroke-width="2.5" />
        </AppButton>
      </div>
      <div class="scene">
        <div class="scene-controls">
          <AppButton
            type="button"
            class="scene-ctrl-btn"
            :class="{ active: viewMode === 'product' }"
            @click="viewMode = 'product'"
          >
            {{ t('productDetail.modal.tabProduct') }}
          </AppButton>
          <AppButton
            type="button"
            class="scene-ctrl-btn"
            :class="{ active: viewMode === 'room' }"
            @click="viewMode = 'room'"
          >
            {{ t('productDetail.modal.tabRoom') }}
          </AppButton>
        </div>

        <div
          v-if="supports3d"
          v-show="viewMode === 'product'"
          ref="viewportRef"
          class="scene-viewport"
        ></div>
        <div v-if="!supports3d && viewMode === 'product'" class="scene-empty">
          {{ t('productDetail.modal.noModelDesc') }}
          trong Room3D.
        </div>
        <div v-if="viewMode === 'room'" class="scene-room-mode">
          <p>
            {{ t('productDetail.modal.roomDesc') }}
            
          </p>
          <AppButton
            type="button"
            class="room-cta-btn"
            @click="emit('go-room3d', { roomType: roomTypeHint })"
          >
            {{ t('productDetail.modal.openRoom') }}
          </AppButton>
        </div>
        <p v-if="isLoading" class="scene-status">{{ t('productDetail.modal.loadingModel') }}</p>
        <p v-if="loadError" class="scene-error">{{ loadError }}</p>
        <p class="scene-label">
          {{
            viewMode === "product"
              ? t('productDetail.modal.showingModel')
              : t('productDetail.modal.navigating')
          }}
        </p>
      </div>
      </div>
    </div>
  </AppModal>
</template>
