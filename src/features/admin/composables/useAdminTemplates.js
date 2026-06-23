import { computed, reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { createTemplateFormState } from '../config/adminPromotionState'
import { filterLocal } from '../lib/adminPromotionFormatters'

export function useAdminTemplates({ filters, modal, editing, notify }) {
  const templates = ref([])
  const templateForm = reactive(createTemplateFormState())

  const filteredTemplates = computed(() => {
    let list = filterLocal(templates.value, filters.template, ['name', 'code'])
    if (filters.template.type) {
      list = list.filter(t => t.type === filters.template.type)
    }
    return list
  })
  const promotionTemplates = computed(() => templates.value.filter(t => t.type === 'PROMOTION'))


  let unlayerInstance = null

  async function loadTemplates() {
    try {
      const response = await adminApi.fetchNotificationTemplates({ query: filters.template.query, size: 100 })
      templates.value = response?.data || []
    } catch (error) {
      templates.value = []
      notify(error?.response?.data?.message || error.message || 'Không tải được mẫu thông báo')
    }
  }

  function resetTemplateForm(row = null) {
    editing.template = row
    templateForm.code = row?.code || ''
    templateForm.name = row?.name || ''
    templateForm.titleTemplate = row?.titleTemplate || ''
    templateForm.bodyTemplate = row?.bodyTemplate || ''
  }

  function openTemplateModal(row = null) {
    resetTemplateForm(row)
    modal.template = true
  }

  function openPreviewModal(row) {
    editing.previewTemplate = row
    modal.previewTemplate = true
  }

  let unlayerInitialized = false
  let unlayerCallback = null
  let unlayerContent = ''

  function loadCurrentDesign() {
    if (!window.unlayer) return
    const body = unlayerContent || ''
    const match = body.match(/<!--\s*UNLAYER_DESIGN_START\s*([\s\S]*?)\s*UNLAYER_DESIGN_END\s*-->/)
    if (match && match[1]) {
      try {
        const designJSON = JSON.parse(match[1])
        window.unlayer.loadDesign(designJSON)
      } catch (e) {
        console.error('Failed to parse Unlayer design', e)
        if (typeof notify === 'function') notify('Không thể nạp lại thiết kế (Lỗi dữ liệu JSON)', 'error')
        window.unlayer.loadBlank({ backgroundColor: '#e7e7e7' })
      }
    } else {
      if (body.trim().length > 0 && typeof notify === 'function') {
        notify('Không tìm thấy dữ liệu thiết kế trong nội dung này', 'error')
      }
      window.unlayer.loadBlank({ backgroundColor: '#e7e7e7' })
    }
  }

  function initUnlayer() {
    if (!window.unlayer) {
      if (typeof notify === 'function') notify('Không thể tải công cụ kéo thả. Vui lòng kiểm tra kết nối mạng.', 'error')
      return
    }
    
    // Luôn khởi tạo lại iframe mới mỗi khi mở modal
    window.unlayer.init({
      id: 'unlayer-editor-container',
      displayMode: 'email',
    })

    if (!unlayerReadyHandlerAdded) {
      window.unlayer.addEventListener('editor:ready', () => {
        loadCurrentDesign()
      })
      unlayerReadyHandlerAdded = true
    }
  }

  function openUnlayerEditor(initialContent, onSave) {
    unlayerContent = initialContent || ''
    unlayerCallback = onSave
    modal.unlayer = true
    // Đảm bảo DOM update, tăng timeout để iframe kịp render
    setTimeout(() => {
      if (window.unlayer) {
        initUnlayer()
      } else {
        const script = document.createElement('script')
        script.src = 'https://editor.unlayer.com/embed.js'
        script.onload = initUnlayer
        document.head.appendChild(script)
      }
    }, 300)
  }

  function saveUnlayerDesign() {
    if (!window.unlayer) return
    window.unlayer.exportHtml((data) => {
      const designJson = JSON.stringify(data.design)
      const packedHtml = `<!-- UNLAYER_DESIGN_START ${designJson} UNLAYER_DESIGN_END -->\n${data.html}`
      if (unlayerCallback) unlayerCallback(packedHtml)
      modal.unlayer = false
      notify('Đã lấy mã HTML từ bảng thiết kế.')
    })
  }

  function templatePayload() {
    return {
      code: templateForm.code.trim(),
      name: templateForm.name.trim(),
      titleTemplate: templateForm.titleTemplate.trim(),
      bodyTemplate: templateForm.bodyTemplate.trim(),
    }
  }

  async function saveTemplate() {
    const payload = templatePayload()
    if (!payload.name || !payload.code) {
      notify('Tên và mã mẫu thông báo không được để trống', 'error')
      return
    }
    try {
      if (editing.template?.id) await adminApi.updateNotificationTemplate(editing.template.id, payload)
      else await adminApi.createNotificationTemplate(payload)
      await loadTemplates()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không lưu được mẫu thông báo', 'error')
      return
    }
    notify('Đã lưu mẫu thông báo thành công')
    modal.template = false
  }

  async function deleteTemplate(row) {
    if (!row?.id || !window.confirm(`Xóa mẫu thông báo "${row.name}"?`)) return
    try {
      await adminApi.deleteNotificationTemplate(row.id)
      await loadTemplates()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không xóa được.', 'error')
    }
  }

  return {
    templates,
    templateForm,
    filteredTemplates,
    loadTemplates,
    openTemplateModal,
    openPreviewModal,
    openUnlayerEditor,
    saveUnlayerDesign,
    saveTemplate,
    deleteTemplate,
    promotionTemplates,
  }
}
