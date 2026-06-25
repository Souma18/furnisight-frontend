<script setup>
import { ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAdminConversationStore } from '../../store/adminConversationStore'

const store = useAdminConversationStore()
const uiStore = useAdminUiStore()

const noteText = ref('')

function saveNote() {
  if (noteText.value.trim()) {
    uiStore.showToast({ icon: 'note', title: 'Ghi chú đã lưu', subtitle: 'Chỉ admin thấy ghi chú này.' })
    noteText.value = ''
  }
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
          {{ store.currentConv.av }}
        </div>
        <div class="cdp-cust-name">{{ store.currentConv.name }}</div>
        <div class="cdp-cust-email">{{ store.currentConv.email || 'Chưa cập nhật email' }}</div>
      </div>

      <!-- Conversation Info: priority only -->
      <div class="cdp-section">
        <div class="cdp-sec-title"><AppIcon name="info" /> Thông tin hội thoại</div>

        <div>
          <div class="cdp-info-label" style="margin-bottom: 4px">Độ ưu tiên</div>
          <select class="cdp-priority-select" :value="store.currentConv.priority">
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <!-- Internal note -->
      <div class="cdp-section" style="border-bottom: none">
        <div class="cdp-sec-title"><AppIcon name="lock" /> Ghi chú nội bộ khách hàng</div>
        <textarea
          class="cdp-note-box"
          v-model="noteText"
          placeholder="Thêm ghi chú riêng tư về khách hàng này... (Chỉ admin xem được)"
        ></textarea>
        <button class="cdp-note-save-btn" @click="saveNote">
          <AppIcon name="save" /> Lưu ghi chú
        </button>
      </div>
    </div>
  </div>
</template>
