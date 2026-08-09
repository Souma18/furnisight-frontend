import { reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import { useAdminUiStore } from '../store/adminUiStore'

export function useAdminPassword() {
  const ui = useAdminUiStore()
  const saving = ref(false)
  const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  async function submit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      ui.showToast({ icon: 'x', title: 'Thiếu thông tin', subtitle: 'Vui lòng nhập đầy đủ các trường mật khẩu.' })
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      ui.showToast({ icon: 'x', title: 'Mật khẩu không khớp', subtitle: 'Xác nhận mật khẩu mới chưa chính xác.' })
      return
    }
    if (form.newPassword.length < 8) {
      ui.showToast({ icon: 'x', title: 'Mật khẩu quá ngắn', subtitle: 'Mật khẩu mới phải có ít nhất 8 ký tự.' })
      return
    }

    saving.value = true
    try {
      await adminApi.changeAdminPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      ui.showToast({ title: 'Đã cập nhật mật khẩu', subtitle: 'Mật khẩu mới đã được lưu.' })
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    } catch (e) {
      ui.showToast({ icon: 'x', title: 'Lỗi', subtitle: e?.response?.data?.message ?? e.message })
    } finally {
      saving.value = false
    }
  }

  return { form, saving, submit }
}
