<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import AppIcon from '@shared/ui/AppIcon.vue'
import { formatTime as globalFormatTime } from '@shared/lib/formatters/DateFormatter'

const store = useAdminConversationStore()
const emit = defineEmits(['open-templates', 'add-template'])

const searchOpen = ref(false)

function selectConversation(id) {
  store.loadConversation(id)
}

function isActive(id) {
  return store.workspace.convId === id
}

function filterStatus(status) {
  store.filters.tab = 'all'
  store.filters.status = status
  store.loadInbox(true)
}

function filterPriority(priority) {
  store.filters.priority = priority
  store.loadInbox(true)
}

function filterAssignment(assignment) {
  store.filters.assignment = assignment
}

function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (!searchOpen.value) {
    store.filters.query = ''
  }
}

function formatTime(conv) {
  const iso = conv?.updatedAt || conv?.createdAt
  return globalFormatTime(iso)
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
          <AppButton variant="unstyled"
            class="clp-hdr-btn"
            :class="{ active: searchOpen }"
            title="Tìm kiếm hội thoại"
            @click="toggleSearch"
          >
            <AppIcon name="search" />
          </AppButton>
          <AppButton variant="unstyled" class="clp-hdr-btn" title="Quản lý template" @click="emit('open-templates')">
            <AppIcon name="fileText" />
          </AppButton>
          <AppButton variant="unstyled" class="clp-hdr-btn" title="Thêm template" @click="emit('add-template')">
            <AppIcon name="plus" />
          </AppButton>
        </div>
      </div>
      <div v-if="searchOpen" class="clp-search">
        <AppIcon name="search" />
        <input v-model="store.filters.query" type="text" placeholder="Tìm tên, email..." />
      </div>
      <div class="clp-filter-row">
        <select
          class="clf-status-select"
          :value="store.filters.status"
          title="Lọc theo trạng thái"
          @change="(e) => filterStatus(e.target.value)"
        >
          <option value="all">Mọi trạng thái</option>
          <option value="unread">Chưa đọc</option>
          <option value="new">Mới</option>
          <option value="assigned">Đã giao</option>
          <option value="pending">Đang xử lý</option>
          <option value="waiting">Chờ khách</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="closed">Đã đóng</option>
        </select>
        <select
          class="clf-priority-select"
          :value="store.filters.priority"
          title="Lọc theo độ ưu tiên"
          @change="(e) => filterPriority(e.target.value)"
        >
          <option value="all">Mọi ưu tiên</option>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
          <option value="urgent">Khẩn cấp</option>
        </select>
        <select
          class="clf-assignment-select"
          :value="store.filters.assignment"
          title="Lọc theo phân công"
          @change="(e) => filterAssignment(e.target.value)"
        >
          <option value="all">Mọi phân công</option>
          <option value="unassigned">Chưa giao</option>
          <option value="mine">Giao cho tôi</option>
          <option value="assigned">Đã giao</option>
        </select>
      </div>
    </div>

    <div class="clp-sort-bar">
      <div class="csb-label">Danh sách</div>
      <AppButton variant="unstyled" type="button" class="csb-sort">
        Mới nhất <AppIcon name="chevronDown" />
      </AppButton>
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
          <div class="cm-ci-av" :class="conv.avClass" :style="{ background: conv.avColor, color: conv.textColor }">
            <AppImage v-if="conv.avatarUrl" :src="conv.avatarUrl" :alt="conv.name"  />
            <span v-else>{{ conv.av }}</span>
          </div>
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
