<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAdminConversationStore } from '../../store/adminConversationStore'
import { useMessageTemplates } from '../../composables/conversations/useMessageTemplates'
import { useChatProducts } from '../../composables/conversations/useChatProducts'
import { useAdminUiStore } from '../../store/adminUiStore'

import ConversationListPanel from '../../components/conversations/ConversationListPanel.vue'
import ConversationWorkspace from '../../components/conversations/ConversationWorkspace.vue'
import ConversationDetailPanel from '../../components/conversations/ConversationDetailPanel.vue'
import ConversationTemplateModal from '../../components/conversations/ConversationTemplateModal.vue'
import SendProductModal from '../../components/conversations/SendProductModal.vue'
import '../../styles/admin-conversations.css'

const store = useAdminConversationStore()
const uiStore = useAdminUiStore()

// These composables will manage their own internal state (like products, templates)
const templateMgr = useMessageTemplates(uiStore)
const productMgr = useChatProducts(uiStore)

onMounted(() => {
  store.loadInbox()
  templateMgr.loadTemplates()
  productMgr.loadProducts()
})

onUnmounted(() => {
  store.disconnectSocket()
})

const templateModalOpen = ref(false)
const templateModalEditOnOpen = ref(false)
const productModalOpen = ref(false)

function openTemplateList() {
  templateModalEditOnOpen.value = false
  templateModalOpen.value = true
}

function openTemplateCreate() {
  templateModalEditOnOpen.value = true
  templateModalOpen.value = true
}

function handleUseTemplate(content) {
  templateMgr.insertSuggestion(content, null)
}

function handleSendProduct(product) {
  productMgr.sendProductToChat(product)
}

// Layout override: 
// The default admin layout has `.content` which has padding and scrolling.
// For the conversations page, we want it to be full height without padding so the 3 panels can stretch.
onMounted(() => {
  const contentEl = document.querySelector('.content')
  if (contentEl) {
    contentEl.style.padding = '0'
    contentEl.style.display = 'flex'
    contentEl.style.flexDirection = 'column'
  }
})

onUnmounted(() => {
  const contentEl = document.querySelector('.content')
  if (contentEl) {
    contentEl.style.padding = ''
    contentEl.style.display = ''
    contentEl.style.flexDirection = ''
  }
})
</script>

<template>
  <div class="cm-root">
    <ConversationListPanel
      @open-templates="openTemplateList"
      @add-template="openTemplateCreate"
    />
    <ConversationWorkspace
      :templateMgr="templateMgr"
      @open-templates="openTemplateList"
      @open-products="productModalOpen = true"
    />
    <ConversationDetailPanel />

    <ConversationTemplateModal
      :is-open="templateModalOpen"
      :manager="templateMgr"
      :default-editing="templateModalEditOnOpen"
      @close="templateModalOpen = false"
      @use-template="handleUseTemplate"
    />

    <SendProductModal
      :is-open="productModalOpen"
      :manager="productMgr"
      @close="productModalOpen = false"
      @send-product="handleSendProduct"
    />
  </div>
</template>

<style scoped>
/* Any specific tweaks for the page root */
.cm-root {
  width: 100%;
  height: 100%;
}
</style>
