import { ref, computed, onMounted } from 'vue'
import { useAdminUiStore } from '../store/adminUiStore'
import { useAdminLayout } from './useAdminLayout'
import { CONV_DATA, PRODUCTS_DATA, TEMPLATE_CATEGORIES } from '../mock/adminConversationMock'
import {
  fetchMessageTemplatesMock,
  createMessageTemplateMock,
  updateMessageTemplateMock,
  deleteMessageTemplateMock,
} from '../api/adminMockApi'

export function useConversationManager() {
  const uiStore = useAdminUiStore()
  const { currentAdmin } = useAdminLayout()

  const currentConvId = ref(1)
  const detailPanelVisible = ref(true)
  const currentMsgType = ref('reply')
  const searchQuery = ref('')
  const activeFilter = ref('all')
  const activeTab = ref('all')

  const cannedPickerOpen = ref(false)
  const selectedProdId = ref(null)
  const pendingInsertText = ref('')

  const conversations = ref(Object.keys(CONV_DATA).map((id) => ({ id: Number(id), ...CONV_DATA[id] })))
  const templates = ref([])
  const templatesLoading = ref(false)
  const products = ref([...PRODUCTS_DATA])

  const currentConv = computed(
    () => conversations.value.find((c) => c.id === currentConvId.value) || conversations.value[0],
  )

  const filteredConversations = computed(() => {
    let filtered = conversations.value
    if (activeTab.value === 'new') {
      const today = new Date().toDateString()
      filtered = filtered.filter((c) => c.createdAt && new Date(c.createdAt).toDateString() === today)
    } else if (activeTab.value === 'pending') {
      filtered = filtered.filter((c) => c.statusKey === 'pending')
    } else if (activeTab.value === 'resolved') {
      filtered = filtered.filter((c) => ['resolved', 'closed'].includes(c.statusKey))
    }

    if (activeFilter.value === 'urgent') {
      filtered = filtered.filter((c) => c.priority === 'urgent')
    } else if (activeFilter.value === 'ai') {
      filtered = filtered.filter((c) => c.isAi)
    } else if (activeFilter.value === 'unread') {
      filtered = filtered.filter((c) => c.unread)
    } else if (activeFilter.value === 'waiting') {
      filtered = filtered.filter((c) => c.statusKey === 'waiting')
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)),
      )
    }

    return filtered
  })

  async function loadTemplates() {
    templatesLoading.value = true
    try {
      const res = await fetchMessageTemplatesMock()
      templates.value = res.data.items || []
    } finally {
      templatesLoading.value = false
    }
  }

  function loadConversation(id) {
    currentConvId.value = id
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) {
      conv.unread = false
    }
    uiStore.showToast({ icon: 'messages', title: 'Hội thoại: ' + (conv?.name || ''), subtitle: 'Đang tải lịch sử...' })
  }

  function setMsgType(type) {
    currentMsgType.value = type
  }

  function toggleDetailPanel() {
    detailPanelVisible.value = !detailPanelVisible.value
  }

  function updateStatus(status) {
    uiStore.showToast({ icon: 'info', title: 'Cập nhật trạng thái', subtitle: '→ ' + status })
  }

  function resolveConversation() {
    updateStatus('resolved')
    uiStore.showToast({ icon: 'check', title: 'Hội thoại đã giải quyết', subtitle: 'Đã lưu và đóng hội thoại này.' })
  }

  function sendMessage(text, type) {
    if (!text) return
    uiStore.showToast({
      icon: type === 'note' ? 'lock' : 'send',
      title: type === 'note' ? 'Ghi chú đã lưu' : 'Tin nhắn đã gửi',
      subtitle: `Người trả lời: ${currentAdmin.value.name}`,
    })
  }

  function insertSuggestion(text, msgRef) {
    if (msgRef) {
      msgRef.value = text
    } else if (text) {
      pendingInsertText.value = text
    }
    uiStore.showToast({ icon: 'sparkles', title: 'Gợi ý đã được điền', subtitle: 'Chỉnh sửa nếu cần trước khi gửi.' })
  }

  async function saveTemplate(tpl) {
    try {
      if (tpl.id) {
        const res = await updateMessageTemplateMock(tpl.id, tpl)
        const idx = templates.value.findIndex((t) => t.id === res.data.id)
        if (idx !== -1) templates.value[idx] = res.data
      } else {
        const res = await createMessageTemplateMock(tpl)
        templates.value = [res.data, ...templates.value]
      }
      uiStore.showToast({ icon: 'check', title: 'Template đã lưu', subtitle: 'Sẵn sàng sử dụng trong các hội thoại.' })
      return true
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Lưu template thất bại',
        subtitle: error.response?.data?.message || error.message || '',
      })
      return false
    }
  }

  async function deleteTemplate(id) {
    try {
      await deleteMessageTemplateMock(id)
      templates.value = templates.value.filter((t) => t.id !== id)
      uiStore.showToast({ icon: 'trash', title: 'Đã xóa template', subtitle: '' })
    } catch (error) {
      uiStore.showToast({
        icon: 'alert',
        title: 'Xóa template thất bại',
        subtitle: error.response?.data?.message || error.message || '',
      })
    }
  }

  function selectProduct(id) {
    selectedProdId.value = id
  }

  function sendProductToChat(product) {
    uiStore.showToast({ icon: 'armchair', title: 'Đã gửi sản phẩm', subtitle: product.name })
    selectedProdId.value = null
  }

  onMounted(() => {
    loadTemplates()
  })

  return {
    currentAdmin,
    currentConvId,
    detailPanelVisible,
    currentMsgType,
    searchQuery,
    activeFilter,
    activeTab,
    cannedPickerOpen,
    selectedProdId,
    pendingInsertText,
    conversations,
    filteredConversations,
    currentConv,
    templates,
    templatesLoading,
    templateCategories: TEMPLATE_CATEGORIES,
    products,
    loadTemplates,
    loadConversation,
    setMsgType,
    toggleDetailPanel,
    updateStatus,
    resolveConversation,
    sendMessage,
    insertSuggestion,
    saveTemplate,
    deleteTemplate,
    selectProduct,
    sendProductToChat,
  }
}
