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
    saving.value = true
    try {
      await adminApi.changeAdminPassword({ ...form })
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
