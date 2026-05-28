import { computed, ref } from 'vue'
import { useProfileStore } from '../store/profileStore'
import { usersApi } from '@shared/lib/api/services'

export function useContactManager(props, emitNotify) {
  const profileStore = useProfileStore()
  
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
      if (emitNotify) emitNotify('Vui lòng nhập thôngInfo trước khi gửi mã.', 'error')
      return
    }
    try {
      isLoading.value = true
      await usersApi.requestLinkContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        newContact: newValue.value,
      })
      if (emitNotify) emitNotify('Mã OTP đã được gửi.')
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Không thể gửi mã OTP.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function submitLink() {
    if (!newValue.value) {
      if (emitNotify) emitNotify('Vui lòng nhập thông tin liên kết.', 'error')
      return
    }
    if (!newContactCode.value || newContactCode.value.length < 4) {
      if (emitNotify) emitNotify('Vui lòng nhập mã OTP hợp lệ.', 'error')
      return
    }
    try {
      isLoading.value = true
      await usersApi.confirmLinkContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        otpCode: newContactCode.value,
      })
      const payload = contactType.value === 'email' ? { email: newValue.value } : { phone: newValue.value }
      await profileStore.saveProfile(payload)
      linkModalOpen.value = false
      if (emitNotify) emitNotify(`${linkTitles.value.trigger} thành công.`)
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Xác minh thất bại.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function sendOldContactCode() {
    try {
      isLoading.value = true
      await usersApi.requestContactChange({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
      })
      if (emitNotify) emitNotify('Mã xác minh đã được gửi đến liên hệ hiện tại.')
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Không thể gửi mã xác minh.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function verifyCurrentContact() {
    if (!verifyCode.value || verifyCode.value.length < 4) {
      if (emitNotify) emitNotify('Vui lòng nhập mã xác minh hợp lệ.', 'error')
      return
    }
    
    try {
      isLoading.value = true
      await usersApi.verifyCurrentContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        otpCode: verifyCode.value,
      })
      verifiedOldContact.value = true
      activeContactTab.value = 'new'
      if (emitNotify) emitNotify('Xác minh thành công. Bạn có thể nhập thông tin mới.')
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Mã xác minh không hợp lệ.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function sendNewContactCode() {
    if (!newValue.value) {
      if (emitNotify) emitNotify('Vui lòng nhập thông tin mới trước khi gửi mã.', 'error')
      return
    }
    try {
      isLoading.value = true
      await usersApi.requestNewContact({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        newContact: newValue.value,
      })
      if (emitNotify) emitNotify('Mã xác minh đã được gửi đến liên hệ mới.')
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Không thể gửi mã xác minh.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function submitContactChange() {
    if (!verifiedOldContact.value) {
      if (emitNotify) emitNotify('Bạn cần xác minh thông tin cũ trước.', 'error')
      return
    }
    if (!newValue.value) {
      if (emitNotify) emitNotify('Vui lòng nhập thông tin mới.', 'error')
      return
    }
    if (!newContactCode.value || newContactCode.value.length < 4) {
      if (emitNotify) emitNotify('Vui lòng nhập mã xác minh của liên hệ mới.', 'error')
      return
    }
    
    try {
      isLoading.value = true
      await usersApi.confirmContactChange({
        type: contactType.value === 'email' ? 'EMAIL' : 'PHONE',
        otpCode: newContactCode.value,
      })
      
      const payload = contactType.value === 'email' ? { email: newValue.value } : { phone: newValue.value }
      await profileStore.saveProfile(payload)
      contactModalOpen.value = false
      if (emitNotify) emitNotify(`${contactTitles.value.trigger} thành công.`)
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Xác minh liên hệ mới thất bại.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function removeOldContact(type) {
    if (!confirm('Bạn có chắc chắn muốn huỷ liên kết này?')) return
    try {
      isLoading.value = true
      await usersApi.removeContact({ type: type === 'email' ? 'EMAIL' : 'PHONE' })
      const payload = type === 'email' ? { email: null } : { phone: null }
      await profileStore.saveProfile(payload)
      if (emitNotify) emitNotify('Đã huỷ liên kết thành công.')
    } catch (error) {
      if (emitNotify) emitNotify(error.response?.data?.message || 'Có lỗi xảy ra.', 'error')
    } finally {
      isLoading.value = false
    }
  }

  return {
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
