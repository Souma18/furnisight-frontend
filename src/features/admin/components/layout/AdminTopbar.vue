<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminLayout } from '../../composables/useAdminLayout'
import { useAdminUiStore } from '../../store/adminUiStore'
import { storeToRefs } from 'pinia'

const { pageTitleHtml, switchSimUser } = useAdminLayout()
const ui = useAdminUiStore()
const { simUserKey } = storeToRefs(ui)

function notify() {
  ui.showToast({ icon: 'bell', title: '3 thông báo mới', subtitle: 'Kiểm tra mục thông báo.' })
}
</script>

<template>
  <div class="topbar">
    <div class="topbar-title" v-html="pageTitleHtml" />
    <div class="tb-divider" />
    <div class="topbar-search">
      <AppIcon name="search" :size="15" />
      <input type="text" placeholder="Tìm kiếm toàn hệ thống..." />
    </div>
    <div class="topbar-right">
      <span class="sim-label">Giả lập:</span>
      <select class="sim-select" :value="simUserKey" @change="switchSimUser($event.target.value)">
        <option value="super">Admin Chính · Super Admin</option>
        <option value="manager">Trần Minh Hoàng · Manager</option>
        <option value="staff">Nguyễn Thu Hà · Staff</option>
      </select>
      <div class="tb-date"><AppIcon name="calendar" :size="13" /> 20/05/2026</div>
      <button type="button" class="tb-btn" @click="notify">
        <AppIcon name="bell" :size="17" />
        <span class="tb-notif-dot" />
      </button>
      <button type="button" class="tb-btn" @click="$router.push({ name: 'admin-my-account' })">
        <AppIcon name="user" :size="17" />
      </button>
    </div>
  </div>
</template>
