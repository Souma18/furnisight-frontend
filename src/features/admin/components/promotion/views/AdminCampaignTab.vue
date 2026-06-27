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
  campaigns: { type: Array, required: true },
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
        placeholder="Tìm chiến dịch..."
        @keyup.enter="emit('load')"
      />
      <select v-model="filters.status" class="mc-select" @change="emit('load')">
        <option value="">Tất cả trạng thái</option>
        <option value="RUNNING">Đang chạy</option>
        <option value="SCHEDULED">Đã hẹn lịch</option>
        <option value="DRAFT">Bản nháp</option>
      </select>
      <AppButton variant="unstyled" type="button" class="mc-outline" @click="emit('load')">
        <AppIcon name="search" :size="14" />Lọc
      </AppButton>
    </div>
    
    <div class="mc-table-wrap">
      <table class="mc-table">
        <thead>
          <tr>
            <th>Chiến dịch</th>
            <th>Voucher</th>
            <th>Tệp nhận</th>
            <th>Kênh</th>
            <th>Đã gửi</th>
            <th>Lịch</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!campaigns.length">
            <td colspan="8" class="mc-empty">Chưa có chiến dịch phù hợp.</td>
          </tr>
          <tr v-for="row in campaigns" :key="row.id">
            <td class="mc-name">{{ row.name }}</td>
            <td><span class="code-badge">{{ row.voucherCode }}</span></td>
            <td>{{ row.targetLabel }}</td>
            <td>{{ channelText(row.channelLabels || row.channels) }}</td>
            <td>{{ numberText(row.sentCount) }}</td>
            <td>{{ dateOnly(row.scheduledAt) }}</td>
            <td>
              <span class="status-badge" :class="statusTone(row.status)">
                <span />{{ statusLabel(row.status) }}
              </span>
            </td>
            <td>
              <div class="mc-actions">
                <AppButton variant="unstyled"
                  type="button"
                  @click="emit('open-modal', row)"
                  :title="row.status === 'SENT' ? 'Xem chi tiết' : 'Sửa'"
                >
                  <AppIcon :name="row.status === 'SENT' ? 'eye' : 'edit'" :size="14" />
                </AppButton>
                <AppButton variant="unstyled"
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
