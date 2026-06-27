<script setup>
import AppButton from '@shared/ui/AppButton.vue'
import AppInput from '@shared/ui/AppInput.vue'
import AppIcon from '@shared/ui/AppIcon.vue'

const props = defineProps({
  templates: { type: Array, required: true },
  filters: { type: Object, required: true },
})

const emit = defineEmits(['load', 'open-preview', 'open-modal', 'delete'])
</script>

<template>
  <section class="mc-card">
    <div class="mc-filter">
      <AppInput
        v-model="filters.query"
        class="mc-input"
        placeholder="Tìm tên hoặc mã mẫu thông báo..."
        @keyup.enter="emit('load')"
      />
      <select v-model="filters.type" class="mc-select" @change="emit('load')">
        <option value="">Tất cả loại</option>
        <option value="PROMOTION">Khuyến mãi (Promotion)</option>
        <option value="SYSTEM">Hệ thống (System)</option>
        <option value="REVIEW">Đánh giá (Review)</option>
        <option value="ORDER">Đơn hàng (Order)</option>
      </select>
      <AppButton variant="unstyled" type="button" class="mc-outline" @click="emit('load')">
        <AppIcon name="search" :size="14" />Lọc
      </AppButton>
    </div>
    <div class="mc-table-wrap">
      <table class="mc-table">
        <thead>
          <tr>
            <th>Mã mẫu</th>
            <th>Tên mẫu</th>
            <th>Loại</th>
            <th>Tiêu đề (Template)</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!templates.length">
            <td colspan="5" class="mc-empty">Chưa có mẫu thông báo nào.</td>
          </tr>
          <tr v-for="row in templates" :key="row.id">
            <td><span class="code-badge">{{ row.code }}</span></td>
            <td class="mc-name">{{ row.name }}</td>
            <td>{{ row.type || 'N/A' }}</td>
            <td>{{ row.titleTemplate }}</td>
            <td>
              <div class="mc-actions">
                <AppButton variant="unstyled" title="Xem trước" type="button" @click="emit('open-preview', row)">
                  <AppIcon name="eye" :size="14" />
                </AppButton>
                <AppButton variant="unstyled" title="Chỉnh sửa" type="button" @click="emit('open-modal', row)">
                  <AppIcon name="edit" :size="14" />
                </AppButton>
                <AppButton variant="unstyled" title="Xóa" type="button" class="danger" @click="emit('delete', row)">
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
