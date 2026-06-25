<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'

const store = useAdminConversationStore()
</script>

<template>
  <div class="cw-header" v-if="store.currentConv">
    <div
      class="cw-hdr-av"
      :class="store.currentConv.avClass"
      :style="{ background: store.currentConv.avColor, color: store.currentConv.textColor }"
    >
      {{ store.currentConv.av }}
      <div class="cm-ci-online" :class="store.currentConv.online"></div>
    </div>
    <div class="cw-hdr-info">
      <div class="cw-hdr-name">{{ store.currentConv.name }}</div>
      <div class="cw-hdr-meta">
        <span><AppIcon name="clock" :size="12" /> Kênh {{ store.currentConv.channel || 'SUPPORT' }}</span>
        <span class="sep-dot"></span>
        <span v-if="store.socket.connected"><AppIcon name="wifi" :size="12" /> Đang kết nối</span>
      </div>
    </div>

    <div class="cw-hdr-actions">
      <select
        class="cw-status-select"
        :value="store.currentConv.statusKey"
        @change="(e) => store.updateStatus(e.target.value)"
      >
        <option value="new">Mới</option>
        <option value="pending">Đang xử lý</option>
        <option value="waiting">Chờ khách</option>
        <option value="resolved">Đã giải quyết</option>
        <option value="closed">Đã đóng</option>
      </select>
      <button class="cw-action-btn" title="Tìm kiếm trong cuộc hội thoại"><AppIcon name="search" /></button>
      <button
        class="cw-action-btn"
        :class="{ 'active-btn': store.workspace.detailVisible }"
        title="Ẩn/Hiện thông tin khách hàng"
        @click="store.toggleDetailPanel()"
      >
        <AppIcon name="panelRight" />
      </button>
      <button class="cw-resolve-btn" title="Đánh dấu đã giải quyết" @click="store.resolveConversation()">
        <AppIcon name="check" /> Xong
      </button>
    </div>
  </div>
</template>
