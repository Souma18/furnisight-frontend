<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminLayout } from '../../composables/useAdminLayout'
import { useAdminUiStore } from '../../store/adminUiStore'
import { useThemeStore } from '@shared/stores/themeStore'

const { pageTitleHtml, currentAdmin } = useAdminLayout()
const ui = useAdminUiStore()
const themeStore = useThemeStore()
const { resolvedTheme } = storeToRefs(themeStore)

const themeIcon = computed(() => resolvedTheme.value === 'dark' ? 'moon' : 'sun')

function toggleTheme() {
  themeStore.setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
}

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
      <AppInput type="text" placeholder="Tìm kiếm toàn hệ thống..." />
    </div>
    <div class="topbar-right">
      <div class="tb-admin-chip" :title="currentAdmin.email">
        <div class="tb-admin-av">{{ currentAdmin.av }}</div>
        <div class="tb-admin-meta">
          <span class="tb-admin-name">{{ currentAdmin.name }}</span>
          <span class="tb-admin-role">{{ currentAdmin.roleTag }}</span>
        </div>
      </div>
      <div class="tb-date"><AppIcon name="calendar" :size="13" /> 20/05/2026</div>
      <AppButton variant="unstyled" type="button" class="tb-btn" title="Đổi giao diện" @click="toggleTheme">
        <AppIcon :name="themeIcon" :size="20" :stroke-width="2" />
      </AppButton>
      <AppButton variant="unstyled" type="button" class="tb-btn" @click="notify">
        <AppIcon name="bell" :size="20" :stroke-width="2" />
        <span class="tb-notif-dot" />
      </AppButton>
      <AppButton variant="unstyled" type="button" class="tb-btn" @click="$router.push({ name: 'admin-my-account' })">
        <AppIcon name="user" :size="20" :stroke-width="2" />
      </AppButton>
    </div>
  </div>
</template>
