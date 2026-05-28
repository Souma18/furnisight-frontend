<script setup>
import { onMounted, onUnmounted } from 'vue'
import AdminSidebar from '../components/layout/AdminSidebar.vue'
import AdminTopbar from '../components/layout/AdminTopbar.vue'
import AdminToast from '../components/shared/AdminToast.vue'
import AdminModalHost from '../components/shared/AdminModalHost.vue'
import '../styles/admin.css'

onMounted(() => {
  document.documentElement.classList.add('admin-route-active')
})
onUnmounted(() => {
  document.documentElement.classList.remove('admin-route-active')
})
</script>

<template>
  <div class="admin-shell">
    <AdminSidebar />
    <div class="main">
      <AdminTopbar />
      <div class="content">
        <RouterView />
      </div>
    </div>
    <AdminModalHost />
    <AdminToast />
  </div>
</template>

<style>
html.admin-route-active,
html.admin-route-active body {
  height: 100%;
  overflow: hidden;
}
</style>
