import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAdminUiStore = defineStore('adminUi', () => {
  const simUserKey = ref('super')
  const toast = ref({ show: false, icon: 'check', title: '', subtitle: '' })
  const modal = ref({ open: false, type: '', title: '', payload: null })
  const reloadTick = ref(0)

  let toastTimer = null

  function showToast({ icon = 'check', title = '', subtitle = '' }) {
    clearTimeout(toastTimer)
    toast.value = { show: true, icon, title, subtitle }
    toastTimer = setTimeout(() => {
      toast.value = { ...toast.value, show: false }
    }, 3200)
  }

  function openModal(type, payload = null) {
    modal.value = { open: true, type, title: '', payload }
  }

  function closeModal() {
    modal.value = { ...modal.value, open: false }
  }

  function setSimUser(key) {
    simUserKey.value = key
  }

  function requestReload() {
    reloadTick.value += 1
  }

  return {
    simUserKey,
    toast,
    modal,
    reloadTick,
    showToast,
    openModal,
    closeModal,
    setSimUser,
    requestReload,
  }
})
