import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAdminUiStore } from './adminUiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { ADMIN_SIM_USERS } from '../config/adminLayoutContent'

import { useAdminInbox } from './conversations/useAdminInbox'
import { useAdminWorkspace } from './conversations/useAdminWorkspace'
import { useAdminSocket } from './conversations/useAdminSocket'
import { useAdminAssignees } from './conversations/useAdminAssignees'

function buildInitials(fullName) {
  const words = (fullName || '').trim().split(/\s+/)
  if (!words[0]) return 'AD'
  const a = words[0][0]
  const b = words.length > 1 ? words[words.length - 1][0] : ''
  return (a + b).toUpperCase() || 'AD'
}

export const useAdminConversationStore = defineStore('adminConversation', () => {
  const uiStore = useAdminUiStore()
  const authStore = useAuthStore()

  // --- Shared Context ---
  const currentAdmin = computed(() => {
    const profile = authStore.user || {}
    const fallback = ADMIN_SIM_USERS.super
    const fullName = profile.displayName || profile.fullName || ''
    return {
      id: profile.id || fallback.id,
      av: buildInitials(profile.fullName || profile.displayName),
      name: fullName || fallback.name,
      email: profile.email || fallback.email,
    }
  })

  const ctx = {
    uiStore,
    authStore,
    currentAdmin,
  }

  // --- Modules ---
  const inboxModule = useAdminInbox(ctx)
  ctx.inboxModule = inboxModule

  const workspaceModule = useAdminWorkspace(ctx)
  ctx.workspaceModule = workspaceModule

  const socketModule = useAdminSocket(ctx)
  ctx.socketModule = socketModule

  const assigneeModule = useAdminAssignees(ctx)
  ctx.assigneeModule = assigneeModule

  // --- Export properties directly to maintain backward compatibility ---
  return {
    // Current Admin
    currentAdmin,

    // Inbox Module
    inbox: inboxModule.inbox,
    filters: inboxModule.filters,
    filteredConversations: inboxModule.filteredConversations,
    loadInbox: inboxModule.loadInbox,
    startPollingInbox: inboxModule.startPollingInbox,
    stopPollingInbox: inboxModule.stopPollingInbox,

    // Workspace Module
    workspace: workspaceModule.workspace,
    currentConv: workspaceModule.currentConv,
    loadMessages: workspaceModule.loadMessages,
    loadConversation: workspaceModule.loadConversation,
    toggleDetailPanel: workspaceModule.toggleDetailPanel,
    setMsgType: workspaceModule.setMsgType,
    toggleConversationSearch: workspaceModule.toggleConversationSearch,
    closeConversationSearch: workspaceModule.closeConversationSearch,
    setConversationSearchQuery: workspaceModule.setConversationSearchQuery,
    goToNextConversationSearchResult: workspaceModule.goToNextConversationSearchResult,
    goToPrevConversationSearchResult: workspaceModule.goToPrevConversationSearchResult,
    sendCustomerReply: workspaceModule.sendCustomerReply,
    sendInternalNote: workspaceModule.sendInternalNote,
    updateStatus: workspaceModule.updateStatus,
    updatePriority: workspaceModule.updatePriority,
    resolveConversation: workspaceModule.resolveConversation,

    // Socket Module
    socket: socketModule.socket,
    disconnectSocket: socketModule.disconnectSocket,

    // Assignees Module
    assignableAdmins: assigneeModule.assignableAdmins,
    loadAssignableAdmins: assigneeModule.loadAssignableAdmins,
    assignConversation: assigneeModule.assignConversation,
  }
})
