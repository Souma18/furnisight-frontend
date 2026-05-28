import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@shared/lib/api/services'

export function useEmailVerification() {
  const route = useRoute()
  const router = useRouter()

  const status = ref('verifying')
  const message = ref('Đang xác thực email của bạn...')

  onMounted(async () => {
    const otpCode = route.query.otpCode

    if (!otpCode) {
      status.value = 'error'
      message.value = 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
      return
    }

    try {
      const response = await authApi.verifyEmail(otpCode)
      if (response.data?.status === 'success' || response.status === 200) {
        status.value = 'success'
        message.value = 'Chúc mừng! Email của bạn đã được xác thực thành công.'
        setTimeout(() => {
          router.push({ name: 'login' })
        }, 3000)
        return
      }

      throw new Error(response.data?.message || 'Xác thực thất bại')
    } catch (error) {
      status.value = 'error'
      message.value = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại sau.'
    }
  })

  return {
    status,
    message,
  }
}
