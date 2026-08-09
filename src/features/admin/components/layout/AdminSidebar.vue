<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { useAdminLayout } from '../../composables/useAdminLayout'

const { navSections, simUser, navBadge, isActive, go, logout } = useAdminLayout()
</script>

<template>
  <aside class="sidebar">
    <div class="sb-logo">
      <div class="sb-logo-mark"><AppIcon name="house" :size="18" /></div>
      <div class="sb-logo-info">
        <div class="sb-logo-text">FurniSight</div>
        <div class="sb-logo-badge">Admin System</div>
      </div>
    </div>

    <AppButton variant="unstyled" size="unstyled" type="button" class="sb-profile" @click="go('admin-my-account')">
      <div class="sb-av">{{ simUser.av }}</div>
      <div>
        <div class="sb-profile-name">{{ simUser.name }}</div>
        <div class="sb-profile-role">{{ simUser.role }}</div>
      </div>
      <div class="sb-online"><span class="sb-online-dot" /></div>
    </AppButton>

    <nav class="sb-nav">
      <div v-for="section in navSections" :key="section.label" class="sb-section">
        <div class="sb-section-label">{{ section.label }}</div>
        <AppButton
          variant="unstyled"
          size="unstyled"
          v-for="item in section.items"
          :key="item.name"
          type="button"
          class="sb-item"
          :class="{ active: isActive(item.name) }"
          @click="go(item.name)"
        >
          <span class="sb-icon"><AppIcon :name="item.icon" :size="16" /></span>
          {{ item.label }}
          <span
            v-if="item.badge && navBadge(item.badge)"
            class="sb-badge"
            :class="item.badgeTone"
          >{{ navBadge(item.badge) }}</span>
        </AppButton>
      </div>
    </nav>

    <div class="sb-footer">
      <AppButton variant="unstyled" size="unstyled" type="button" class="sb-logout" @click="logout">
        <AppIcon name="logout" :size="16" />
        Đăng xuất
      </AppButton>
    </div>
  </aside>
</template>
