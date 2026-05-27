<script setup>
import { computed } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  manager: {
    type: Object,
    required: true,
  },
})

const mgr = props.manager
const emit = defineEmits(['open-templates', 'add-template'])
const filteredConversations = mgr.filteredConversations

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return mgr.conversations.value.filter((c) => c.createdAt && new Date(c.createdAt).toDateString() === today).length
})

function selectConversation(id) {
  mgr.loadConversation(id)
}

function isActive(id) {
  return mgr.currentConvId.value === id
}

function filterChip(type) {
  mgr.activeFilter.value = type
}

function switchTab(tab) {
  mgr.activeTab.value = tab
}

function formatTime(conv) {
  const iso = conv?.updatedAt || conv?.createdAt
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function priorityClass(priority) {
  return `p-${priority}`
}

function priorityLabel(priority) {
  const map = { urgent: 'Khẩn cấp', high: 'Cao', medium: 'Vừa', low: 'Thấp' }
  return map[priority] || priority
}
</script>

<template>
  <div class="cm-list-panel">
    <div class="clp-header">
      <div class="clp-title-row">
        <div class="clp-title">
          <AppIcon name="messageSquare" /> Hội thoại
        </div>
        <div class="clp-hdr-actions">
          <button class="clp-hdr-btn" title="Quản lý template" @click="emit('open-templates')">
            <AppIcon name="fileText" />
          </button>
          <button class="clp-hdr-btn" title="Thêm template" @click="emit('add-template')">
            <AppIcon name="plus" />
          </button>
          <button class="clp-hdr-btn" title="Cài đặt"><AppIcon name="settings" /></button>
        </div>
      </div>
      <div class="clp-search">
        <AppIcon name="search" />
        <input v-model="mgr.searchQuery.value" type="text" placeholder="Tìm tên, email..." />
      </div>
      <div class="clp-filter-row">
        <button class="clf-chip" :class="{ active: mgr.activeFilter.value === 'all' }" @click="filterChip('all')">Tất cả</button>
        <button class="clf-chip" :class="{ active: mgr.activeFilter.value === 'urgent' }" @click="filterChip('urgent')">Khẩn cấp</button>
        <button class="clf-chip" :class="{ active: mgr.activeFilter.value === 'unread' }" @click="filterChip('unread')">Chưa đọc</button>
        <button class="clf-chip" :class="{ active: mgr.activeFilter.value === 'waiting' }" @click="filterChip('waiting')">Chờ khách</button>
      </div>
    </div>

    <div class="clp-tabs">
      <div class="clp-tab" :class="{ active: mgr.activeTab.value === 'all' }" @click="switchTab('all')">
        Tất cả <span class="clp-tab-badge" v-if="mgr.activeTab.value !== 'all'">{{ mgr.conversations.value.length }}</span>
      </div>
      <div class="clp-tab" :class="{ active: mgr.activeTab.value === 'new' }" @click="switchTab('new')">
        Mới <span class="clp-tab-badge">{{ todayCount }}</span>
      </div>
      <div class="clp-tab" :class="{ active: mgr.activeTab.value === 'pending' }" @click="switchTab('pending')">
        Đang xử lý
      </div>
      <div class="clp-tab" :class="{ active: mgr.activeTab.value === 'resolved' }" @click="switchTab('resolved')">
        Đã xong
      </div>
    </div>

    <div class="clp-sort-bar">
      <div class="csb-label">Danh sách</div>
      <button type="button" class="csb-sort">
        Mới nhất <AppIcon name="chevronDown" />
      </button>
    </div>

    <div class="clp-list">
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        class="cm-conv-item"
        :class="{ active: isActive(conv.id), unread: conv.unread }"
        @click="selectConversation(conv.id)"
      >
        <div class="cm-ci-av-wrap">
          <div class="cm-ci-av" :class="conv.avClass" :style="{ background: conv.avColor, color: conv.textColor }">{{ conv.av }}</div>
          <div class="cm-ci-online" :class="conv.online"></div>
          <div v-if="conv.unread" class="cm-conv-unread-dot"></div>
        </div>

        <div class="cm-ci-body">
          <div class="cm-ci-top">
            <div class="cm-ci-name">{{ conv.name }}</div>
            <div class="cm-ci-time">{{ formatTime(conv) }}</div>
          </div>
          <div class="cm-ci-preview">
            <template v-if="conv.lastSender === 'admin'">Bạn: </template>
            {{ conv.preview || 'Chưa có tin nhắn' }}
          </div>
          <div class="cm-ci-footer">
            <span v-if="conv.priority" class="cm-priority" :class="priorityClass(conv.priority)">
              <AppIcon name="flag" :size="10" /> {{ priorityLabel(conv.priority) }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="filteredConversations.length === 0" style="padding: 20px; text-align: center; color: var(--text4); font-size: 12px;">
        Không tìm thấy hội thoại nào.
      </div>
    </div>
  </div>
</template>
