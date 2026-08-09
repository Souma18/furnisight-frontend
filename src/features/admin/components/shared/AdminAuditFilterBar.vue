<script setup>
import AppIcon from '@shared/ui/AppIcon.vue'

const search = defineModel('search', { type: String, default: '' })
const type = defineModel('type', { type: String, default: 'all' })
const result = defineModel('result', { type: String, default: 'all' })
const period = defineModel('period', { type: String, default: 'today' })
</script>

<template>
  <div class="filter-bar">
    <div class="filter-search">
      <AppIcon name="search" :size="15" />
      <input v-model="search" type="text" placeholder="Tìm theo tên admin, IP, hành động..." />
    </div>
    <select v-model="type" class="filter-select">
      <option value="all">Tất cả loại</option>
      <option value="login">Đăng nhập</option>
      <option value="create">Tạo mới</option>
      <option value="update">Cập nhật</option>
      <option value="delete">Xóa</option>
    </select>
    <select v-model="result" class="filter-select">
      <option value="all">Tất cả kết quả</option>
      <option value="success">Thành công</option>
      <option value="error">Lỗi</option>
    </select>
    <select v-model="period" class="filter-select">
      <option value="today">Hôm nay</option>
      <option value="7d">7 ngày qua</option>
      <option value="month">Tháng này</option>
    </select>
  </div>
</template>
