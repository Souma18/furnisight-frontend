import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccountStore = defineStore('account', () => {
  const settings = ref({})
  const projects = ref([])

  return {
    settings,
    projects,
  }
})
