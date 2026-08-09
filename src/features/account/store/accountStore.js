import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccountStore = defineStore('account', () => {
  const settings = ref({})
  const projects = ref([])

  function resetAccountState() {
    settings.value = {}
    projects.value = []
  }

  return {
    settings,
    projects,
    resetAccountState,
  }
})
