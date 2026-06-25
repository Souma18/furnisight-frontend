<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'

const store = useAdminConversationStore()
const messages = computed(() => store.workspace.messages)
const currentAdmin = computed(() => store.currentAdmin)

const timelineRef = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (timelineRef.value) {
      timelineRef.value.scrollTop = timelineRef.value.scrollHeight
    }
  })
}

watch(() => store.workspace.convId, () => {
  scrollToBottom()
})

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div v-if="store.currentConv" class="cw-timeline" ref="timelineRef">
    <div v-if="store.workspace.loading" class="tl-date-sep">Đang tải tin nhắn...</div>
    <div v-else class="tl-date-sep">Hôm nay</div>

    <div v-for="msg in messages" :key="msg.id" class="tl-msg-row" :class="`msg-${msg.type}`">
      <template v-if="msg.type === 'customer'">
        <div
          class="tl-av"
          :class="store.currentConv.avClass"
          :style="{ background: store.currentConv.avColor, color: store.currentConv.textColor }"
        >
          {{ store.currentConv.av }}
        </div>
        <div class="tl-msg-group">
          <div class="tl-bubble customer">{{ msg.text }}</div>
          <div class="tl-msg-meta">{{ msg.time }}</div>
        </div>
      </template>

      <template v-if="msg.type === 'admin'">
        <div class="tl-msg-group">
          <div class="tl-bubble admin">{{ msg.text }}</div>
          <div class="tl-msg-meta">
            <span>{{ msg.time }}</span> <AppIcon name="checkCheck" :size="11" class="read" />
          </div>
        </div>
        <div class="tl-av" style="background: var(--navy); color: var(--gold3)">{{ msg.senderRole }}</div>
      </template>

      <template v-if="msg.type === 'system'">
        <div class="tl-system-pill"><AppIcon name="info" /> {{ msg.text }} · {{ msg.time }}</div>
      </template>

      <template v-if="msg.type === 'note'">
        <div class="tl-note-wrap">
          <div class="tl-note-header">
            <AppIcon name="lock" /> Ghi chú nội bộ - {{ msg.senderName || currentAdmin.name }}
          </div>
          {{ msg.text }}
        </div>
      </template>
    </div>
  </div>
</template>
