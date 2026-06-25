<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import AppIcon from '@shared/ui/AppIcon.vue'

const store = useAdminConversationStore()
const emit = defineEmits(['open-templates', 'add-template'])

const newCount = computed(() => {
  return store.inbox.items.filter((c) => c.statusKey === 'new').length
})

function selectConversation(id) {
  store.loadConversation(id)
}

function isActive(id) {
  return store.workspace.convId === id
}

function filterChip(type) {
  store.filters.status = type
  store.loadInbox(true)
}

function switchTab(tab) {
  store.filters.tab = tab
  store.loadInbox(true)
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

function handleScroll(e) {
  const el = e.target
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
    if (store.inbox.hasMore && !store.inbox.loadingMore) {
      store.loadInbox(false)
    }
  }
}

onMounted(() => {
  store.startPollingInbox()
})

onUnmounted(() => {
  store.stopPollingInbox()
})
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
        <input v-model="store.filters.query" type="text" placeholder="Tìm tên, email..." />
      </div>
      <div class="clp-filter-row">
        <button class="clf-chip" :class="{ active: store.filters.status === 'all' }" @click="filterChip('all')">Tất cả</button>
        <button class="clf-chip" :class="{ active: store.filters.status === 'urgent' }" @click="filterChip('urgent')">Khẩn cấp</button>
        <button class="clf-chip" :class="{ active: store.filters.status === 'unread' }" @click="filterChip('unread')">Chưa đọc</button>
        <button class="clf-chip" :class="{ active: store.filters.status === 'waiting' }" @click="filterChip('waiting')">Chờ khách</button>
      </div>
    </div>

    <div class="clp-tabs">
      <div class="clp-tab" :class="{ active: store.filters.tab === 'all' }" @click="switchTab('all')">
        Tất cả <span class="clp-tab-badge" v-if="store.filters.tab !== 'all'">{{ store.inbox.items.length }}</span>
      </div>
      <div class="clp-tab" :class="{ active: store.filters.tab === 'new' }" @click="switchTab('new')">
        Mới <span class="clp-tab-badge" v-if="newCount > 0">{{ newCount }}</span>
      </div>
      <div class="clp-tab" :class="{ active: store.filters.tab === 'pending' }" @click="switchTab('pending')">
        Đang xử lý
      </div>
      <div class="clp-tab" :class="{ active: store.filters.tab === 'resolved' }" @click="switchTab('resolved')">
        Đã xong
      </div>
    </div>

    <div class="clp-sort-bar">
      <div class="csb-label">Danh sách</div>
      <button type="button" class="csb-sort">
        Mới nhất <AppIcon name="chevronDown" />
      </button>
    </div>

    <div class="clp-list" @scroll="handleScroll">
      <div
        v-for="conv in store.filteredConversations"
        :key="conv.id"
        class="cm-conv-item"
        :class="{ active: isActive(conv.id), unread: conv.unread }"
        @click="selectConversation(conv.id)"
      >
        <div class="cm-ci-av-wrap">
          <div class="cm-ci-av" :class="conv.avClass" :style="{ background: conv.avColor, color: conv.textColor }">{{ conv.av }}</div>
          <div class="cm-ci-online" :class="conv.online"></div>
          <div v-if="conv.unreadCount > 0" class="cm-conv-unread-badge">{{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}</div>
          <div v-else-if="conv.unread" class="cm-conv-unread-dot"></div>
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
      <div v-if="store.filteredConversations.length === 0 && !store.inbox.loading" style="padding: 20px; text-align: center; color: var(--text4); font-size: 12px;">
        Không tìm thấy hội thoại nào.
      </div>
      <div v-if="store.inbox.loadingMore" style="padding: 10px; text-align: center; color: var(--text4); font-size: 12px;">
        Đang tải thêm...
      </div>
    </div>
  </div>
</template>
