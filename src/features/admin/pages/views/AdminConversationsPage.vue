<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useConversationManager } from '../../composables/useConversationManager'
import ConversationListPanel from '../../components/conversations/ConversationListPanel.vue'
import ConversationWorkspace from '../../components/conversations/ConversationWorkspace.vue'
import ConversationDetailPanel from '../../components/conversations/ConversationDetailPanel.vue'
import ConversationTemplateModal from '../../components/conversations/ConversationTemplateModal.vue'
import SendProductModal from '../../components/conversations/SendProductModal.vue'
import '../../styles/admin-conversations.css'

const mgr = useConversationManager()

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
  mgr.insertSuggestion(content, null)
}

function handleSendProduct(product) {
  mgr.sendProductToChat(product)
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
      :manager="mgr"
      @open-templates="openTemplateList"
      @add-template="openTemplateCreate"
    />
    <ConversationWorkspace
      :manager="mgr"
      @open-templates="openTemplateList"
      @open-products="productModalOpen = true"
    />
    <ConversationDetailPanel :manager="mgr" />

    <ConversationTemplateModal
      :is-open="templateModalOpen"
      :manager="mgr"
      :default-editing="templateModalEditOnOpen"
      @close="templateModalOpen = false"
      @use-template="handleUseTemplate"
    />

    <SendProductModal
      :is-open="productModalOpen"
      :manager="mgr"
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
