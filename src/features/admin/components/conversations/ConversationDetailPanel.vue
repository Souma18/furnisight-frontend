<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { downloadChatAttachment } from '@features/chat/lib/chatAttachmentDownload'

const store = useAdminConversationStore()
const uiStore = useAdminUiStore()

const noteText = ref('')
const mediaDialogOpen = ref(false)
const mediaDialogType = ref('image')
const mediaSearch = ref('')
const mediaDateFrom = ref('')
const mediaDateTo = ref('')
const galleryLimit = ref(12)
const GALLERY_PAGE_SIZE = 12

const assignedStaffId = computed(() => store.currentConv?.assignedAdminId ?? store.currentConv?.staffId ?? '')
const assignedAdmin = computed(() => {
  return store.assignableAdmins.items.find((admin) => Number(admin.staffId) === Number(assignedStaffId.value)) || null
})
const searchState = computed(() => store.workspace.search || {
  visible: false,
  query: '',
  resultIds: [],
  activeIndex: -1,
  total: 0,
  loading: false,
  error: '',
})
const searchCountLabel = computed(() => {
  const query = searchState.value.query.trim()
  const total = searchState.value.total || searchState.value.resultIds.length
  if (!query) return ''
  if (searchState.value.loading) return '...'
  if (!total) return '0/0'
  return `${searchState.value.activeIndex + 1}/${total}`
})
const attachments = computed(() => {
  return store.workspace.messages
    .flatMap((message) => {
      const messageAttachments = message.attachments?.length
        ? message.attachments
        : message.attachment ? [message.attachment] : []

      return messageAttachments.map((attachment, index) => ({
        id: `${message.id}-${attachment.mediaId || attachment.url || attachment.name || index}`,
        messageId: message.id,
        senderName: message.senderName,
        time: message.time,
        createdAt: message.createdAt,
        ...attachment,
      }))
    })
})
const imageAttachments = computed(() => attachments.value.filter((item) => item.isImage && item.url))
const fileAttachments = computed(() => attachments.value.filter((item) => !item.isImage && item.url))
const activeMediaAttachments = computed(() => (
  mediaDialogType.value === 'file' ? fileAttachments.value : imageAttachments.value
))
const filteredMediaAttachments = computed(() => {
  const query = mediaSearch.value.trim().toLowerCase()
  const fromTime = mediaDateFrom.value ? new Date(`${mediaDateFrom.value}T00:00:00`).getTime() : null
  const toTime = mediaDateTo.value ? new Date(`${mediaDateTo.value}T23:59:59.999`).getTime() : null

  return activeMediaAttachments.value.filter((item) => {
    const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : null
    const matchName = !query || String(item.name || '').toLowerCase().includes(query)
    const matchFrom = !fromTime || (itemTime && itemTime >= fromTime)
    const matchTo = !toTime || (itemTime && itemTime <= toTime)
    return matchName && matchFrom && matchTo
  })
})
const visibleImageAttachments = computed(() => imageAttachments.value.slice(0, 3))
const visibleFileAttachments = computed(() => fileAttachments.value.slice(0, 3))
const visibleGalleryItems = computed(() => filteredMediaAttachments.value.slice(0, galleryLimit.value))
const remainingGalleryCount = computed(() => Math.max(filteredMediaAttachments.value.length - visibleGalleryItems.value.length, 0))
const hiddenImageCount = computed(() => Math.max(imageAttachments.value.length - visibleImageAttachments.value.length, 0))
const hiddenFileCount = computed(() => Math.max(fileAttachments.value.length - visibleFileAttachments.value.length, 0))
const showImageTools = computed(() => imageAttachments.value.length > 3)
const showFileTools = computed(() => fileAttachments.value.length > 3)
const mediaDialogTitle = computed(() => mediaDialogType.value === 'file' ? 'tệp hội thoại' : 'ảnh hội thoại')
const mediaDialogCountLabel = computed(() => {
  const total = activeMediaAttachments.value.length
  return mediaDialogType.value === 'file' ? `${total} tệp` : `${total} ảnh`
})
const mediaSearchPlaceholder = computed(() => (
  mediaDialogType.value === 'file' ? 'Tìm theo tên tệp...' : 'Tìm theo tên ảnh...'
))
const mediaEmptyText = computed(() => (
  mediaDialogType.value === 'file' ? 'Không tìm thấy tệp phù hợp' : 'Không tìm thấy ảnh phù hợp'
))
const loadMoreLabel = computed(() => {
  const amount = Math.min(GALLERY_PAGE_SIZE, remainingGalleryCount.value)
  return mediaDialogType.value === 'file' ? `Xem thêm ${amount} tệp` : `Xem thêm ${amount} ảnh`
})

watch([mediaSearch, mediaDateFrom, mediaDateTo], () => {
  galleryLimit.value = GALLERY_PAGE_SIZE
})

onMounted(() => {
  store.loadAssignableAdmins()
})

function saveNote() {
  if (noteText.value.trim()) {
    uiStore.showToast({ icon: 'note', title: 'Ghi chú đã lưu', subtitle: 'Chỉ admin thấy ghi chú này.' })
    noteText.value = ''
  }
}

function openMediaDialog(type = 'image') {
  mediaDialogType.value = type
  mediaDialogOpen.value = true
  galleryLimit.value = GALLERY_PAGE_SIZE
}

function closeMediaDialog() {
  mediaDialogOpen.value = false
  mediaSearch.value = ''
  mediaDateFrom.value = ''
  mediaDateTo.value = ''
}

function clearMediaFilters() {
  mediaSearch.value = ''
  mediaDateFrom.value = ''
  mediaDateTo.value = ''
}

function loadMoreGalleryImages() {
  galleryLimit.value += GALLERY_PAGE_SIZE
}

function formatBytes(value) {
  const bytes = Number(value) || 0
  if (!bytes) return 'Không rõ dung lượng'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`
}

function downloadAttachment(file) {
  downloadChatAttachment(file)
}
</script>

<template>
  <div class="cm-detail-panel" :class="{ collapsed: !store.workspace.detailVisible }">
    <div class="cdp-scroll" v-if="store.currentConv">
      <!-- Customer Card: avatar + name + email only -->
      <div class="cdp-cust-card">
        <div
          class="cdp-cust-av"
          :class="store.currentConv.avClass"
          :style="{ background: store.currentConv.avColor, color: store.currentConv.textColor }"
        >
          <AppImage v-if="store.currentConv.avatarUrl" :src="store.currentConv.avatarUrl" :alt="store.currentConv.name"  />
          <span v-else>{{ store.currentConv.av }}</span>
        </div>
        <div class="cdp-cust-name">{{ store.currentConv.name }}</div>
        <div class="cdp-cust-email">{{ store.currentConv.email || 'Chưa cập nhật email' }}</div>
      </div>

      <!-- Conversation Info: priority only -->
      <div class="cdp-section">
        <div class="cdp-sec-title"><AppIcon name="info" /> Thông tin hội thoại</div>

        <div class="cdp-message-search">
          <label class="cdp-message-search-field">
            <AppIcon name="search" :size="14" />
            <AppInput
              :value="searchState.query"
              type="search"
              placeholder="Tìm tin nhắn..."
              @input="(event) => store.setConversationSearchQuery(event.target.value)"
              @keydown.enter.prevent="store.goToNextConversationSearchResult()"
            />
          </label>
          <div v-if="searchState.query.trim()" class="cdp-message-search-actions">
            <small v-if="searchState.error">{{ searchState.error }}</small>
            <span v-else>{{ searchCountLabel }}</span>
            <AppButton
              type="button"
              :disabled="!searchState.resultIds.length"
              title="Kết quả trước"
              @click="store.goToPrevConversationSearchResult()"
            >
              <AppIcon name="chevronUp" :size="14" />
            </AppButton>
            <AppButton
              type="button"
              :disabled="!searchState.resultIds.length"
              title="Kết quả tiếp"
              @click="store.goToNextConversationSearchResult()"
            >
              <AppIcon name="chevronDown" :size="14" />
            </AppButton>
            <AppButton type="button" title="Xóa tìm kiếm" @click="store.setConversationSearchQuery('')">
              <AppIcon name="x" :size="14" />
            </AppButton>
          </div>
        </div>

        <div>
          <div class="cdp-info-label" style="margin-bottom: 4px">Giao cho</div>
          <select
            class="cdp-priority-select"
            :value="assignedStaffId"
            :disabled="store.assignableAdmins.loading"
            @focus="store.loadAssignableAdmins()"
            @change="(e) => store.assignConversation(e.target.value)"
          >
            <option value="">Chưa giao</option>
            <option
              v-for="admin in store.assignableAdmins.items"
              :key="admin.staffId"
              :value="admin.staffId"
            >
              {{ admin.name }} - {{ admin.role || 'Admin' }}
            </option>
          </select>
          <div v-if="assignedAdmin" class="cdp-assigned-row" style="margin: 8px 0 12px">
            <div class="cdp-assigned-av">{{ assignedAdmin.av }}</div>
            <div>
              <div class="cdp-assigned-name">{{ assignedAdmin.name }}</div>
              <div class="cdp-assigned-role">{{ assignedAdmin.role || 'Admin' }} · CUSTOMER_SUPPORT</div>
            </div>
          </div>
          <div v-else-if="store.assignableAdmins.error" class="cdp-assigned-role" style="margin: 6px 0 12px">
            {{ store.assignableAdmins.error }}
          </div>

          <div class="cdp-info-label" style="margin-bottom: 4px">Độ ưu tiên</div>
          <select
            class="cdp-priority-select"
            :value="store.currentConv.priority"
            @change="(e) => store.updatePriority(e.target.value)"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <!-- Shared attachments -->
      <div class="cdp-section">
        <div class="cdp-sec-title"><AppIcon name="paperclip" /> Ảnh & tệp</div>

        <div v-if="imageAttachments.length" class="cdp-media-block">
          <div class="cdp-media-head">
            <div class="cdp-media-subtitle"><AppIcon name="image" /> Ảnh</div>
            <AppButton
              v-if="showImageTools"
              type="button"
              class="cdp-media-toggle"
              @click="openMediaDialog('image')"
            >
              ...
            </AppButton>
          </div>

          <div class="cdp-image-grid">
            <a
              v-for="image in visibleImageAttachments"
              :key="image.id"
              class="cdp-image-tile"
              :href="image.url"
              target="_blank"
              rel="noreferrer"
              :title="image.name"
            >
              <AppImage :src="image.url" :alt="image.name"  />
            </a>
            <AppButton
              v-if="hiddenImageCount > 0"
              type="button"
              class="cdp-image-tile cdp-image-more"
              @click="openMediaDialog('image')"
            >
              <span>...</span>
              <small>+{{ hiddenImageCount }}</small>
            </AppButton>
          </div>
        </div>

        <div v-if="fileAttachments.length" class="cdp-media-block">
          <div class="cdp-media-head">
            <div class="cdp-media-subtitle"><AppIcon name="fileText" /> Tệp</div>
            <AppButton
              v-if="showFileTools"
              type="button"
              class="cdp-media-toggle"
              @click="openMediaDialog('file')"
            >
              ...
            </AppButton>
          </div>

          <div class="cdp-file-list">
            <AppButton
              v-for="file in visibleFileAttachments"
              :key="file.id"
              type="button"
              class="cdp-file-row"
              :title="file.name"
              @click="downloadAttachment(file)"
            >
              <AppIcon name="fileText" :size="16" />
              <span>{{ file.name || 'Tệp đính kèm' }}</span>
              <small>{{ formatBytes(file.size) }}</small>
            </AppButton>
            <AppButton
              v-if="hiddenFileCount > 0"
              type="button"
              class="cdp-file-row cdp-file-more"
              @click="openMediaDialog('file')"
            >
              <AppIcon name="moreHorizontal" :size="16" />
              <span>Xem thêm</span>
              <small>+{{ hiddenFileCount }}</small>
            </AppButton>
          </div>
        </div>

        <div v-if="!imageAttachments.length && !fileAttachments.length" class="cdp-media-empty">Chưa có ảnh hoặc tệp</div>
      </div>

      <!-- Internal note -->
      <div class="cdp-section" style="border-bottom: none">
        <div class="cdp-sec-title"><AppIcon name="lock" /> Ghi chú nội bộ khách hàng</div>
        <textarea
          class="cdp-note-box"
          v-model="noteText"
          placeholder="Thêm ghi chú riêng tư về khách hàng này... (Chỉ admin xem được)"
        ></textarea>
        <AppButton class="cdp-note-save-btn" @click="saveNote">
          <AppIcon name="save" /> Lưu ghi chú
        </AppButton>
      </div>
    </div>

    <div
      class="cm-modal-overlay cm-feature-vars"
      :class="{ open: mediaDialogOpen }"
      @click.self="closeMediaDialog"
    >
      <div class="cm-modal size-lg cdp-gallery-dialog" role="dialog" aria-modal="true" @click.stop>
        <div class="cm-modal-head">
          <div class="cm-modal-title">Thư viện <em>{{ mediaDialogTitle }}</em></div>
          <span class="cm-modal-head-meta">{{ mediaDialogCountLabel }}</span>
          <AppButton type="button" class="cm-modal-close" aria-label="Đóng" @click="closeMediaDialog">
            <AppIcon name="x" />
          </AppButton>
        </div>
        <div class="cm-modal-body">
          <div class="cdp-gallery-search">
            <AppIcon name="search" :size="15" />
            <AppInput v-model="mediaSearch" type="search" :placeholder="mediaSearchPlaceholder" />
          </div>

          <div class="cdp-gallery-date-row">
            <label>
              <span>Từ ngày</span>
              <input v-model="mediaDateFrom" type="date" />
            </label>
            <label>
              <span>Đến ngày</span>
              <input v-model="mediaDateTo" type="date" />
            </label>
            <AppButton type="button" class="cdp-gallery-clear" @click="clearMediaFilters">Xóa lọc</AppButton>
          </div>

          <div class="cdp-gallery-results">
            <div v-if="filteredMediaAttachments.length && mediaDialogType === 'image'" class="cdp-gallery-grid">
              <a
                v-for="image in visibleGalleryItems"
                :key="image.id"
                class="cdp-gallery-item"
                :href="image.url"
                target="_blank"
                rel="noreferrer"
                :title="image.name"
              >
                <AppImage :src="image.url" :alt="image.name"  />
                <span>{{ image.name || image.time || 'Ảnh đính kèm' }}</span>
              </a>
            </div>
            <div v-if="filteredMediaAttachments.length && mediaDialogType === 'file'" class="cdp-gallery-file-list">
              <AppButton
                v-for="file in visibleGalleryItems"
                :key="file.id"
                type="button"
                class="cdp-gallery-file"
                :title="file.name"
                @click="downloadAttachment(file)"
              >
                <div class="cdp-gallery-file-icon"><AppIcon name="fileText" :size="18" /></div>
                <div>
                  <strong>{{ file.name || 'Tệp đính kèm' }}</strong>
                  <span>{{ formatBytes(file.size) }} · {{ file.time || 'Không rõ thời gian' }}</span>
                </div>
                <AppIcon name="download" :size="16" />
              </AppButton>
            </div>
            <AppButton
              v-if="remainingGalleryCount > 0"
              type="button"
              class="cdp-gallery-more"
              @click="loadMoreGalleryImages"
            >
              <AppIcon name="plus" :size="15" />
              {{ loadMoreLabel }}
            </AppButton>
            <div v-if="!filteredMediaAttachments.length" class="cdp-gallery-empty">{{ mediaEmptyText }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
