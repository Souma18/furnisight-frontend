<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppImage from '@shared/ui/AppImage.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

defineProps({
  conversation: { type: Object, required: true },
  socketConnected: { type: Boolean, default: false },
  detailVisible: { type: Boolean, default: false },
})

const emit = defineEmits(['update-status', 'toggle-detail', 'resolve'])
</script>

<template>
  <div class="cw-header-shell">
    <div class="cw-header">
      <div
        class="cm-ci-av"
        :class="conversation.avClass"
        :style="{ background: conversation.avColor, color: conversation.textColor }"
      >
        <AppImage v-if="conversation.avatarUrl" :src="conversation.avatarUrl" :alt="conversation.name"  />
        <span v-else>{{ conversation.av }}</span>
      </div>
      <div class="cw-hdr-info">
        <div class="cw-hdr-name">{{ conversation.name }}</div>
        <div class="cw-hdr-meta">
          <span><AppIcon name="clock" :size="12" /> Kênh {{ conversation.channel || 'SUPPORT' }}</span>
          <span class="sep-dot"></span>
          <span v-if="socketConnected"><AppIcon name="wifi" :size="12" /> Đang kết nối</span>
        </div>
      </div>

      <div class="cw-hdr-actions">
        <select
          class="cw-status-select"
          :value="conversation.statusKey"
          @change="(e) => emit('update-status', e.target.value)"
        >
          <option value="new">Mới</option>
          <option value="assigned">Đã giao</option>
          <option value="pending">Đang xử lý</option>
          <option value="waiting">Chờ khách</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="closed">Đã đóng</option>
        </select>
        <AppButton variant="unstyled"
          class="cw-action-btn"
          :class="{ 'active-btn': detailVisible }"
          title="Ẩn/Hiện thông tin khách hàng"
          @click="emit('toggle-detail')"
        >
          <AppIcon name="panelRight" />
        </AppButton>
        <AppButton variant="unstyled" class="cw-resolve-btn" title="Đánh dấu đã giải quyết" @click="emit('resolve')">
          <AppIcon name="check" /> Xong
        </AppButton>
      </div>
    </div>
  </div>
</template>
