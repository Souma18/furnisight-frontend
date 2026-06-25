<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'

const props = defineProps({
  templateMgr: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open-templates', 'open-products'])
const store = useAdminConversationStore()
const templateMgr = props.templateMgr

const currentAdmin = computed(() => store.currentAdmin)

const messageText = ref('')
const inputWrapClasses = ref('')

function updateInputMode() {
  inputWrapClasses.value =
    store.workspace.msgType === 'note' ? 'note-mode' : store.workspace.msgType === 'ai' ? 'ai-mode' : ''
}

watch(() => store.workspace.msgType, updateInputMode)

watch(() => store.workspace.convId, () => {
  messageText.value = ''
})

// EXPOSE method to parent to insert template explicitly without hidden mutation via watch
function insertTemplate(text) {
  messageText.value = text
  store.setMsgType('reply')
}
defineExpose({ insertTemplate })

async function sendMsg() {
  if (!messageText.value.trim()) return

  const text = messageText.value
  const type = store.workspace.msgType
  messageText.value = ''
  
  if (type === 'note') {
    await store.sendInternalNote(text)
  } else {
    await store.sendCustomerReply(text)
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMsg()
  }
}
</script>

<template>
  <div v-if="store.currentConv" class="cw-input-area">
    <div class="cw-msg-type-row">
      <button
        class="cw-msg-type-btn"
        :class="{ active: store.workspace.msgType === 'reply' }"
        @click="store.setMsgType('reply')"
      >
        <AppIcon name="messageSquare" /> Trả lời
      </button>
      <button
        class="cw-msg-type-btn note-type"
        :class="{ active: store.workspace.msgType === 'note' }"
        @click="store.setMsgType('note')"
      >
        <AppIcon name="lock" /> Ghi chú nội bộ
      </button>
    </div>

    <div class="cw-toolbar">
      <button class="cw-tool-btn" title="Đính kèm file"><AppIcon name="paperclip" /></button>
      <button class="cw-tool-btn" title="Gửi ảnh"><AppIcon name="image" /></button>
      <div class="cw-tool-sep"></div>
      <button class="cw-tool-btn" title="Gửi sản phẩm (Product Card)" @click="emit('open-products')">
        <AppIcon name="armchair" />
      </button>
      <button class="cw-tool-btn" title="Chọn template (mở danh sách)" @click="emit('open-templates')">
        <AppIcon name="fileText" />
      </button>
      <button class="cw-tool-btn" title="Chèn Emoji"><AppIcon name="smile" /></button>
    </div>

    <div class="cw-input-area-wrap">
      <div class="cw-input-row">
        <div class="cw-input-wrap" :class="inputWrapClasses">
          <textarea
            v-model="messageText"
            :placeholder="
              store.workspace.msgType === 'note'
                ? 'Nhập ghi chú nội bộ (chỉ admin xem được)...'
                : 'Nhập tin nhắn trả lời... (Nhấn / để dùng template nhanh)'
            "
            @keydown="handleKeydown"
            rows="1"
          ></textarea>
          <div class="cw-char-count">{{ messageText.length }}</div>
        </div>
        <button class="cw-send-btn" @click="sendMsg" title="Gửi (Enter)">
          <AppIcon name="send" />
        </button>
      </div>


    </div>

    <div class="cw-footer-bar">
      <div class="cw-footer-info">
        <AppIcon name="checkCheck" /> Đang trả lời với tư cách: <strong>{{ currentAdmin.name }}</strong>
      </div>
      <div class="cw-footer-hint"><strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng</div>
    </div>
  </div>
</template>
