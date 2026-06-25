import { ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { TEMPLATE_CATEGORIES } from '../../config/adminConversationContent'

export function useMessageTemplates(uiStore) {
  const templates = ref([])
  const templatesLoading = ref(false)
  const cannedPickerOpen = ref(false)
  const pendingInsertText = ref('')

  async function loadTemplates() {
    templatesLoading.value = true
    try {
      const res = await adminApi.fetchMessageTemplates()
      templates.value = Array.isArray(res.data) ? res.data : res.data?.items ?? []
    } finally {
      templatesLoading.value = false
    }
  }

  async function saveTemplate(tpl) {
    try {
      if (tpl.id) {
        const res = await adminApi.updateMessageTemplate(tpl.id, tpl)
        const idx = templates.value.findIndex((t) => t.id === res.data.id)
        if (idx !== -1) templates.value[idx] = res.data
      } else {
        const res = await adminApi.createMessageTemplate(tpl)
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
      await adminApi.deleteMessageTemplate(id)
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

  function insertSuggestion(text, msgRef) {
    if (msgRef) {
      msgRef.value = text
    } else if (text) {
      pendingInsertText.value = text
    }
    uiStore.showToast({ icon: 'sparkles', title: 'Gợi ý đã được điền', subtitle: 'Chỉnh sửa nếu cần trước khi gửi.' })
  }

  return {
    templates,
    templatesLoading,
    cannedPickerOpen,
    pendingInsertText,
    templateCategories: TEMPLATE_CATEGORIES,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
    insertSuggestion,
  }
}
