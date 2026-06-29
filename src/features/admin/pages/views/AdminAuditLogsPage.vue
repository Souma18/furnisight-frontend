<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'
import AdminAuditFilterBar from '../../components/shared/AdminAuditFilterBar.vue'
import AdminPagination from '../../components/shared/AdminPagination.vue'
import { useAdminAuditLogs } from '../../composables/useAdminAuditLogs'
import { useAdminUiStore } from '../../store/adminUiStore'

const ui = useAdminUiStore()
const { items, search, type, result, period, pagination, page } = useAdminAuditLogs()

const dotClass = { success: 'success', danger: 'danger', warn: 'warn', info: 'info' }
</script>

<template>
  <AdminPageHeader eyebrow="Bảo mật hệ thống" title-html="Nhật ký <em>thao tác</em>" subtitle="Ghi nhận toàn bộ hành vi trong hệ thống">
    <template #actions>
      <AppButton variant="unstyled" type="button" class="btn-export" @click="ui.showToast({ icon: 'download', title: 'Xuất nhật ký', subtitle: 'Đang tạo file CSV...' })">
        <AppIcon name="download" :size="15" />Xuất CSV
      </AppButton>
    </template>
  </AdminPageHeader>

  <AdminAuditFilterBar v-model:search="search" v-model:type="type" v-model:result="result" v-model:period="period" />

  <div class="tcard">
    <div class="tcard-header">
      <div class="tcard-title"><AppIcon name="chartBar" :size="17" />Hoạt động gần đây</div>
      <span style="font-size:12px;color:var(--text3)">Cập nhật realtime · 20/05/2026</span>
    </div>
    <div class="log-list">
      <div v-for="log in items" :key="log.id" class="log-item">
        <div class="log-dot-wrap"><span class="log-dot" :class="dotClass[log.tone]" /></div>
        <div class="log-body">
          <div class="log-action">{{ log.action }}</div>
          <div class="log-detail" v-html="log.detail" />
          <div class="log-meta">
            <span><AppIcon name="clock3" :size="12" />{{ log.time }}</span>
            <span v-if="log.meta"><AppIcon name="user" :size="12" />{{ log.meta }}</span>
          </div>
        </div>
        <span class="log-status" :class="log.tone === 'danger' || log.result === 'error' ? 'ls-error' : 'ls-success'">{{ log.status }}</span>
      </div>
    </div>
    <AdminPagination :info="pagination.info" :buttons="pagination.buttons" @page="page = $event" />
  </div>
</template>

<style scoped>
.log-list {
  padding: 0 20px;
}
</style>
