<script setup>
import { computed, onMounted, ref } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useAdminConversationStore } from '../../store/adminConversationStore'

const store = useAdminConversationStore()
const uiStore = useAdminUiStore()

const noteText = ref('')

const assignedStaffId = computed(() => store.currentConv?.assignedAdminId ?? store.currentConv?.staffId ?? '')
const assignedAdmin = computed(() => {
  return store.assignableAdmins.items.find((admin) => Number(admin.staffId) === Number(assignedStaffId.value)) || null
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
          <img v-if="store.currentConv.avatarUrl" :src="store.currentConv.avatarUrl" :alt="store.currentConv.name" />
          <span v-else>{{ store.currentConv.av }}</span>
        </div>
        <div class="cdp-cust-name">{{ store.currentConv.name }}</div>
        <div class="cdp-cust-email">{{ store.currentConv.email || 'Chưa cập nhật email' }}</div>
      </div>

      <!-- Conversation Info: priority only -->
      <div class="cdp-section">
        <div class="cdp-sec-title"><AppIcon name="info" /> Thông tin hội thoại</div>

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
