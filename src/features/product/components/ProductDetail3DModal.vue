<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from "@shared/ui/AppIcon.vue";
import AppModal from "@shared/ui/AppModal.vue";
import { useProduct3DViewer } from '../composables/useProduct3DViewer'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelUrl: { type: String, default: "" },
  productName: { type: String, default: "Sản phẩm" },
  supports3d: { type: Boolean, default: false },
  roomTypeHint: { type: String, default: "bedroom" },
});
const emit = defineEmits(["close", "go-room3d"]);

const {
  viewportRef,
  isLoading,
  loadError,
  viewMode,
} = useProduct3DViewer(props);
</script>

<template>
  <AppModal :open="open" width="700px" no-bg @close="emit('close')">
    <div class="pd-3d-modal">
      <div class="box">
      <div class="head">
        <strong>Trực quan 3D – {{ productName }}</strong>
        <AppButton type="button" aria-label="Đóng" @click="emit('close')">
          <AppIcon name="close" :size="16" />
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
            Sản phẩm
          </AppButton>
          <AppButton
            type="button"
            class="scene-ctrl-btn"
            :class="{ active: viewMode === 'room' }"
            @click="viewMode = 'room'"
          >
            Phòng đầy đủ
          </AppButton>
        </div>

        <div
          v-if="supports3d"
          v-show="viewMode === 'product'"
          ref="viewportRef"
          class="scene-viewport"
        ></div>
        <div v-if="!supports3d && viewMode === 'product'" class="scene-empty">
          Mẫu này chưa có mô hình 3D thật. Bạn vẫn có thể xem thông tin và đặt
          trong Room3D.
        </div>
        <div v-if="viewMode === 'room'" class="scene-room-mode">
          <p>
            Để xem sản phẩm trong không gian phòng, chuyển qua Trực quan 3D và
            đặt vào phòng mẫu.
          </p>
          <AppButton
            type="button"
            class="room-cta-btn"
            @click="emit('go-room3d', { roomType: roomTypeHint })"
          >
            Mở Trực quan 3D
          </AppButton>
        </div>
        <p v-if="isLoading" class="scene-status">Đang tải mô hình...</p>
        <p v-if="loadError" class="scene-error">{{ loadError }}</p>
        <p class="scene-label">
          {{
            viewMode === "product"
              ? "Đang hiển thị mô hình sản phẩm 3D"
              : "Chế độ phòng đầy đủ - điều hướng sang Room3D"
          }}
        </p>
      </div>
      </div>
    </div>
  </AppModal>
</template>
