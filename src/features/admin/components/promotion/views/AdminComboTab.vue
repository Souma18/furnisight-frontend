<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import {
  dateOnly,
  money,
  numberText,
  statusLabel,
  statusTone,
} from '../../../lib/adminPromotionFormatters'

const props = defineProps({
  combos: { type: Array, required: true },
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
        placeholder="Tìm combo..."
        @keyup.enter="emit('load')"
      />
      <select v-model="filters.status" class="mc-select" @change="emit('load')">
        <option value="">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang bật</option>
        <option value="DRAFT">Bản nháp</option>
      </select>
      <AppButton variant="outline" type="button" class="mc-outline" @click="emit('load')">
        <AppIcon name="search" :size="14" />Lọc
      </AppButton>
    </div>
    <div class="mc-table-wrap">
      <table class="mc-table">
        <thead>
          <tr>
            <th>Combo</th>
            <th>Số SP</th>
            <th>Giá gốc</th>
            <th>Giá combo</th>
            <th>Tiết kiệm</th>
            <th>Đã dùng</th>
            <th>Hết hạn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!combos.length">
            <td colspan="9" class="mc-empty">Chưa có combo phù hợp.</td>
          </tr>
          <tr v-for="row in combos" :key="row.id">
            <td class="mc-name">{{ row.name }}</td>
            <td>{{ row.itemCount }}</td>
            <td>{{ money(row.originalAmount) }}</td>
            <td><span class="discount-gold">{{ money(row.finalAmount) }}</span></td>
            <td>{{ money(row.savedAmount) }}</td>
            <td>{{ numberText(row.usedCount) }}</td>
            <td>{{ dateOnly(row.endDate) }}</td>
            <td>
              <span class="status-badge" :class="statusTone(row.status)">
                <span />{{ statusLabel(row.status) }}
              </span>
            </td>
            <td>
              <div class="mc-actions">
                <AppButton variant="unstyled" type="button" @click="emit('open-modal', row)">
                  <AppIcon name="edit" :size="14" />
                </AppButton>
                <AppButton variant="unstyled" type="button" class="danger" @click="emit('delete', row)">
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
