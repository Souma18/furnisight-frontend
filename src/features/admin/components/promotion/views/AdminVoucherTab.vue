<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppImage from '@shared/ui/AppImage.vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import {
  dateOnly,
  discountLabel,
  money,
  voucherStatusTone,
} from '../../../lib/adminPromotionFormatters'

const props = defineProps({
  vouchers: { type: Array, required: true },
  filters: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['load', 'open-modal', 'open-publish', 'delete'])
</script>

<template>
  <section class="mc-card">
    <div class="mc-filter">
      <AppInput
        v-model="filters.query"
        class="mc-input"
        placeholder="Tìm theo mã hoặc tên..."
        @keyup.enter="emit('load')"
      />
      <select v-model="filters.type" class="mc-select" @change="emit('load')">
        <option value="">Tất cả loại</option>
        <option value="PUBLIC">PUBLIC</option>
        <option value="PERSONAL">PERSONAL</option>
        <option value="MARKETING">MARKETING</option>
      </select>
      <select v-model="filters.discountType" class="mc-select" @change="emit('load')">
        <option value="">Tất cả loại giảm</option>
        <option value="PERCENT">Phần trăm (%)</option>
        <option value="FIXED">Số tiền cố định</option>
        <option value="SHIPPING_CAP">Giảm vận chuyển</option>
      </select>
      <select v-model="filters.status" class="mc-select" @change="emit('load')">
        <option value="">Tất cả trạng thái</option>
        <option value="active">Đang bật</option>
        <option value="inactive">Đang tắt</option>
        <option value="expired">Hết hạn</option>
      </select>
      <AppButton variant="outline" type="button" class="mc-outline" @click="emit('load')">
        <AppIcon name="search" :size="14" />Lọc
      </AppButton>
    </div>
    <div class="mc-table-wrap">
      <table class="mc-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Giảm</th>
            <th>Đã phát</th>
            <th>Đơn tối thiểu</th>
            <th>Hết hạn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="mc-empty">Đang tải voucher...</td>
          </tr>
          <tr v-else-if="!vouchers.length">
            <td colspan="9" class="mc-empty">Chưa có voucher phù hợp.</td>
          </tr>
          <tr v-for="row in vouchers" v-else :key="row.id">
            <td><span class="code-badge">{{ row.code }}</span></td>
            <td class="mc-name">
              <div class="combo-name-cell">
                <AppImage v-if="row.imageUrl" :src="row.imageUrl" alt="" />
                <span>{{ row.name }}</span>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="`type-${String(row.voucherType || 'PUBLIC').toLowerCase()}`">
                {{ row.voucherType || 'PUBLIC' }}
              </span>
            </td>
            <td><span class="discount-gold">{{ discountLabel(row) }}</span></td>
            <td><span class="sent-count">{{ row.issuedCount || 0 }} user</span></td>
            <td>{{ money(row.minOrder) }}</td>
            <td>{{ dateOnly(row.endDate) }}</td>
            <td>
              <span class="status-badge" :class="voucherStatusTone(row)">
                <span />{{ row.statusLabel || (row.active ? 'Đang bật' : 'Đang tắt') }}
              </span>
            </td>
            <td>
              <div class="mc-actions">
                <AppButton variant="unstyled" type="button" title="Sửa" @click="emit('open-modal', row)">
                  <AppIcon name="edit" :size="14" />
                </AppButton>
                <AppButton variant="unstyled" type="button" class="publish" title="Phát hành" @click="emit('open-publish', row)">
                  <AppIcon name="send" :size="14" />
                </AppButton>
                <AppButton variant="unstyled" type="button" class="danger" title="Xóa" @click="emit('delete', row)">
                  <AppIcon name="trash" :size="14" />
                </AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <span>Hiển thị {{ vouchers.length }} voucher</span>
      <div>
        <AppButton variant="unstyled">1</AppButton>
        <AppButton variant="unstyled" disabled>2</AppButton>
      </div>
    </div>
  </section>
</template>
