<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmailRequest } from '../api/authApi'

const route = useRoute()
const router = useRouter()

const status = ref('verifying') // 'verifying', 'success', 'error'
const message = ref('Đang xác thực email của bạn...')

onMounted(async () => {
  const otpCode = route.query.otpCode
  
  if (!otpCode) {
    status.value = 'error'
    message.value = 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
    return
  }

  try {
    const response = await verifyEmailRequest(otpCode)
    if (response.data?.status === 'success' || response.status === 200) {
      status.value = 'success'
      message.value = 'Chúc mừng! Email của bạn đã được xác thực thành công.'
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 3000)
    } else {
      throw new Error(response.data?.message || 'Xác thực thất bại')
    }
  } catch (error) {
    status.value = 'error'
    message.value = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại sau.'
  }
})
</script>

<template>
  <div class="verify-page min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
      <div class="text-center">
        <!-- Success Icon -->
        <div v-if="status === 'success'" class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
          <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Error Icon -->
        <div v-if="status === 'error'" class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <!-- Verifying Spinner -->
        <div v-if="status === 'verifying'" class="mx-auto flex items-center justify-center h-20 w-20 mb-6">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>

        <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
          {{ status === 'success' ? 'Thành công!' : status === 'error' ? 'Thất bại' : 'Đang xử lý' }}
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          {{ message }}
        </p>

        <div class="space-y-4">
          <router-link
            v-if="status !== 'verifying'"
            :to="{ name: 'login' }"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Về trang đăng nhập
          </router-link>
          
          <router-link
            v-if="status === 'error'"
            to="/"
            class="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            Về trang chủ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
