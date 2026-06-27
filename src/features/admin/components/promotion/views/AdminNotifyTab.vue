<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import {
  channelText,
  dateOnly,
  numberText,
  statusLabel,
  statusTone,
} from '../../../lib/adminPromotionFormatters'

const props = defineProps({
  notifications: { type: Array, required: true },
  filters: { type: Object, required: true },
})

const emit = defineEmits(['load', 'open-modal', 'delete'])
</script>

<template>
  <section class="mc-card">
    <div class="mc-filter">
      <AppInput
        v-model="filters.query"
        class="mc-input"
        placeholder="Tìm thông báo..."
        @keyup.enter="emit('load')"
      />
      <select v-model="filters.status" class="mc-select" @change="emit('load')">
        <option value="">Tất cả trạng thái</option>
        <option value="SENT">Đã gửi</option>
        <option value="SCHEDULED">Đã hẹn lịch</option>
        <option value="DRAFT">Bản nháp</option>
      </select>
      <AppButton type="button" class="mc-outline" @click="emit('load')">
        <AppIcon name="search" :size="14" />Lọc
      </AppButton>
    </div>
    <div class="mc-table-wrap">
      <table class="mc-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Tệp nhận</th>
            <th>Kênh</th>
            <th>Đã gửi</th>
            <th>Lịch gửi</th>
            <th>Tạo lúc</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!notifications.length">
            <td colspan="8" class="mc-empty">Chưa có thông báo phù hợp.</td>
          </tr>
          <tr v-for="row in notifications" :key="row.id">
            <td class="mc-name">{{ row.title }}</td>
            <td>{{ row.targetLabel }}</td>
            <td>{{ channelText(row.channelLabels || row.channels) }}</td>
            <td>{{ numberText(row.sentCount) }}</td>
            <td>{{ dateOnly(row.scheduledAt) }}</td>
            <td>{{ dateOnly(row.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="statusTone(row.status)">
                <span />{{ statusLabel(row.status) }}
              </span>
            </td>
            <td>
              <div class="mc-actions">
                <AppButton
                  type="button"
                  @click="emit('open-modal', row)"
                  :title="row.status === 'SENT' ? 'Xem chi tiết' : 'Sửa'"
                >
                  <AppIcon :name="row.status === 'SENT' ? 'eye' : 'edit'" :size="14" />
                </AppButton>
                <AppButton
                  type="button"
                  class="danger"
                  @click="emit('delete', row)"
                  :disabled="row.status === 'SENT'"
                >
                  <AppIcon name="trash" :size="14" />
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
