import { computed, reactive, ref } from 'vue'
import { changePasswordRequest } from '../api/accountApi'
import {
  requestContactChange,
  verifyCurrentContact as apiVerifyCurrentContact,
  requestNewContact,
  confirmContactChange,
  requestLinkContact,
  confirmLinkContact,
  removeContact
} from '../api/profileApi'

export function useSecurity(props, emit) {
  const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const contactModalOpen = ref(false)
  const linkModalOpen = ref(false)
  const contactType = ref('email')
  const verificationMethod = ref('EMAIL')
  const activeContactTab = ref('old')
  const verifyCode = ref('')
  const verifiedOldContact = ref(false)
  const newValue = ref('')
  const newContactCode = ref('')
  const isLoading = ref(false)

  const currentContactLabel = computed(() =>
    verificationMethod.value === 'EMAIL' ? props.profile?.email ?? '' : props.profile?.phone ?? '',
  )
  
  const maskedEmail = computed(() => {
    const raw = props.profile?.email
    if (!raw || typeof raw !== 'string') return ''
    const [name, domain] = raw.split('@')
    if (!name || !domain) return raw
    const prefix = name.slice(0, Math.min(2, name.length))
    return `${prefix}${'*'.repeat(Math.max(0, name.length - prefix.length))}@${domain}`
  })
  
  const maskedPhone = computed(() => {
    const raw = props.profile?.phone
    if (!raw) return ''
    const phone = String(raw).replace(/\s/g, '')
    if (!phone) return ''
    if (phone.length <= 5) return phone
    return `${phone.slice(0, 3)}${'*'.repeat(Math.max(0, phone.length - 6))}${phone.slice(-3)}`
  })

  const contactTitles = computed(() =>
    contactType.value === 'email'
      ? { trigger: 'Đổi email', old: 'Email hiện tại', next: 'Email mới' }
      : { trigger: 'Đổi số điện thoại', old: 'Số điện thoại hiện tại', next: 'Số điện thoại mới' },
  )

  const linkTitles = computed(() =>
    contactType.value === 'email'
      ? { trigger: 'Liên kết email', label: 'Địa chỉ email' }
      : { trigger: 'Liên kết số điện thoại', label: 'Số điện thoại' },
  )

  async function submit() {
    if (!form.newPassword || form.newPassword !== form.confirmPassword) {
      emit('notify', 'Mật khẩu xác nhận chưa khớp.', 'error')
      return
    }
    
    try {
      isLoading.value = true
      await changePasswordRequest({ newPassword: form.newPassword })
      emit('notify', 'Đã cập nhật mật khẩu thành công.')
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  function openContactModal(type) {
    contactType.value = type
    verificationMethod.value = type === 'email' ? 'EMAIL' : 'PHONE'
    contactModalOpen.value = true
    activeContactTab.value = 'old'
    verifyCode.value = ''
    verifiedOldContact.value = false
    newValue.value = ''
    newContactCode.value = ''
  }

  function openLinkModal(type) {
    contactType.value = type
    linkModalOpen.value = true
    newValue.value = ''
    newContactCode.value = ''
  }

  async function sendLinkCode() {
    if (!newValue.value) {
      emit('notify', 'Vui lòng nhập thông tin trước khi gửi mã.', 'error')
      return
    }
    try {
      isLoading.value = true
      await requestLinkContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        newContact: newValue.value,
      })
      emit('notify', 'Mã OTP đã được gửi.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể gửi mã OTP.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function submitLink() {
    if (!newValue.value) {
      emit('notify', 'Vui lòng nhập thông tin liên kết.', 'error')
      return
    }
    if (!newContactCode.value || newContactCode.value.length < 4) {
      emit('notify', 'Vui lòng nhập mã OTP hợp lệ.', 'error')
      return
    }
    try {
      isLoading.value = true
      await confirmLinkContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        otpCode: newContactCode.value,
      })
      const payload =
        contactType.value === 'email' ? { email: newValue.value } : { phone: newValue.value }
      emit('save-contact', payload)
      linkModalOpen.value = false
      emit('notify', `${linkTitles.value.trigger} thành công.`)
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Xác minh thất bại.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function sendOldContactCode() {
    try {
      isLoading.value = true
      await requestContactChange({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
      })
      emit('notify', 'Mã xác minh đã được gửi đến liên hệ hiện tại.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể gửi mã xác minh.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function verifyCurrentContact() {
    if (!verifyCode.value || verifyCode.value.length < 4) {
      emit('notify', 'Vui lòng nhập mã xác minh hợp lệ.', 'error')
      return
    }
    
    try {
      isLoading.value = true
      await apiVerifyCurrentContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        otpCode: verifyCode.value,
      })
      verifiedOldContact.value = true
      activeContactTab.value = 'new'
      emit('notify', 'Xác minh thành công. Bạn có thể nhập thông tin mới.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Mã xác minh không hợp lệ.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function sendNewContactCode() {
    if (!newValue.value) {
      emit('notify', 'Vui lòng nhập thông tin mới trước khi gửi mã.', 'error')
      return
    }
    try {
      isLoading.value = true
      await requestNewContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        newContact: newValue.value,
      })
      emit('notify', 'Mã xác minh đã được gửi đến liên hệ mới.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Không thể gửi mã xác minh.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function submitContactChange() {
    if (!verifiedOldContact.value) {
      emit('notify', 'Bạn cần xác minh thông tin cũ trước.', 'error')
      return
    }
    if (!newValue.value) {
      emit('notify', 'Vui lòng nhập thông tin mới.', 'error')
      return
    }
    if (!newContactCode.value || newContactCode.value.length < 4) {
      emit('notify', 'Vui lòng nhập mã xác minh của liên hệ mới.', 'error')
      return
    }
    
    try {
      isLoading.value = true
      await confirmContactChange({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        otpCode: newContactCode.value,
      })
      
      const payload =
        contactType.value === 'email' ? { email: newValue.value } : { phone: newValue.value }
      emit('save-contact', payload)
      contactModalOpen.value = false
      emit('notify', `${contactTitles.value.trigger} thành công.`)
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Xác minh liên hệ mới thất bại.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function removeOldContact(type) {
    if (!confirm('Bạn có chắc chắn muốn huỷ liên kết này?')) return
    try {
      isLoading.value = true
      await removeContact({ type: type === 'email' ? 'EMAIL' : 'PHONE' })
      const payload = type === 'email' ? { email: null } : { phone: null }
      emit('save-contact', payload)
      emit('notify', 'Đã huỷ liên kết thành công.')
    } catch (error) {
      emit('notify', error.response?.data?.message || 'Có lỗi xảy ra.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    contactModalOpen,
    linkModalOpen,
    contactType,
    verificationMethod,
    activeContactTab,
    verifyCode,
    verifiedOldContact,
    newValue,
    newContactCode,
    currentContactLabel,
    maskedEmail,
    maskedPhone,
    contactTitles,
    linkTitles,
    isLoading,
    submit,
    openContactModal,
    openLinkModal,
    sendOldContactCode,
    verifyCurrentContact,
    sendNewContactCode,
    submitContactChange,
    sendLinkCode,
    submitLink,
    removeOldContact,
  }
}
