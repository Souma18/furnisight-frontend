import { computed, reactive, ref } from 'vue'
import { adminApi } from '@shared/lib/api/services'
import {
  createAdminPromotionStats,
  createVoucherFormState,
  createVoucherPublishState,
} from '../config/adminPromotionState'
import {
  getListPayload,
  sortByCreatedAtDesc,
  toDatetimeLocal,
} from '../lib/adminPromotionFormatters'

export function useAdminVouchers({
  filters,
  modal,
  editing,
  users,
  loading,
  saving,
  notify,
}) {
  const stats = ref(createAdminPromotionStats())
  const vouchers = ref([])
  const publish = reactive(createVoucherPublishState())
  const voucherForm = reactive(createVoucherFormState())
  const publishing = ref(false)

  const filteredUsers = computed(() => {
    const query = publish.userQuery.trim().toLowerCase()
    if (!query) return users.value
    return users.value.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query))
  })

  async function loadVoucherData() {
    loading.value = true
    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.fetchVouchers({
          query: filters.voucher.query,
          type: filters.voucher.type,
          status: filters.voucher.status,
          sort: 'createdAt,desc',
        }),
        adminApi.fetchVoucherStats().catch(() => ({ data: stats.value })),
      ])
      vouchers.value = sortByCreatedAtDesc(getListPayload(listRes?.data))
      stats.value = { ...stats.value, ...(statsRes?.data || {}) }
    } finally {
      loading.value = false
    }
  }

  function resetVoucherForm(row = null) {
    editing.voucher = row
    voucherForm.code = row?.code || ''
    voucherForm.name = row?.name || ''
    voucherForm.voucherType = row?.voucherType || 'PUBLIC'
    voucherForm.discountType = row?.discountType || 'PERCENT'
    voucherForm.discountValue = row?.discountValue ?? 0
    voucherForm.maxDiscount = row?.maxDiscount ?? null
    voucherForm.minOrder = row?.minOrder ?? 0
    voucherForm.startDate = toDatetimeLocal(row?.startDate)
    voucherForm.endDate = toDatetimeLocal(row?.endDate)
    voucherForm.description = row?.description || ''
    voucherForm.icon = row?.icon || 'badgePercent'
    voucherForm.active = row?.active ?? true
    voucherForm.placements = Array.isArray(row?.placements) && row.placements.length
      ? [...row.placements]
      : ['PROMOTION_PAGE', 'CHECKOUT']
  }

  function openVoucherModal(row = null) {
    resetVoucherForm(row)
    modal.voucher = true
  }

  function voucherPayload() {
    return {
      code: voucherForm.code.trim(),
      name: voucherForm.name.trim(),
      description: voucherForm.description,
      icon: voucherForm.icon || 'badgePercent',
      voucherType: voucherForm.voucherType,
      discountType: voucherForm.discountType,
      discountValue: Number(voucherForm.discountValue) || 0,
      maxDiscount: voucherForm.maxDiscount === '' || voucherForm.maxDiscount == null ? null : Number(voucherForm.maxDiscount),
      minOrder: voucherForm.minOrder === '' || voucherForm.minOrder == null ? null : Number(voucherForm.minOrder),
      startDate: voucherForm.startDate || null,
      endDate: voucherForm.endDate || null,
      active: voucherForm.active,
      placements: voucherForm.placements,
    }
  }

  async function saveVoucher() {
    saving.value = true
    try {
      const payload = voucherPayload()
      if (editing.voucher?.id) await adminApi.updateVoucher(editing.voucher.id, payload)
      else await adminApi.createVoucher(payload)
      modal.voucher = false
      notify(editing.voucher ? 'Đã cập nhật voucher' : 'Đã tạo voucher')
      await loadVoucherData()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không lưu được voucher')
    } finally {
      saving.value = false
    }
  }

  async function deleteVoucher(row) {
    if (!row?.id || !window.confirm(`Xóa voucher ${row.code}?`)) return
    try {
      const response = await adminApi.deleteVoucher(row.id)
      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Không xóa được voucher')
      }
      notify(`Đã xóa voucher ${row.code}.`, 'success')
      await loadVoucherData()
    } catch (error) {
      notify(
        error?.response?.data?.message || error.message || `Không thể xóa voucher ${row.code}.`,
        'error',
      )
    }
  }

  function openPublishDrawer(row) {
    publish.voucher = row
    publish.segment = 'one'
    publish.selectedUserIds = users.value[0]?.id ? [users.value[0].id] : []
    publish.title = `Bạn vừa nhận voucher ${row.code}`
    publish.body = `Bạn vừa nhận voucher ${row.name}. Vào mục Voucher của tôi để sử dụng ngay.`
  }

  function publishPayload() {
    const targetType = publish.segment === 'all' ? 'ALL' : publish.segment === 'cond' ? 'SEGMENT' : 'MANUAL'
    return {
      targetType,
      targetUserIds: targetType === 'MANUAL' ? publish.selectedUserIds : [],
      segmentKey: targetType === 'SEGMENT' ? publish.segmentKey : null,
      channels: publish.channels,
      title: publish.title,
      body: publish.body,
    }
  }

  async function confirmPublishVoucher() {
    if (!publish.voucher?.id) return
    if ((publish.segment === 'one' || publish.segment === 'many') && !publish.selectedUserIds.length) {
      notify('Hãy chọn user nhận voucher')
      return
    }
    publishing.value = true
    try {
      await adminApi.publishVoucher(publish.voucher.id, publishPayload())
      notify('Đã phát hành voucher')
      publish.voucher = null
      await loadVoucherData()
    } catch (error) {
      notify(error?.response?.data?.message || error.message || 'Không phát hành được voucher')
    } finally {
      publishing.value = false
    }
  }

  return {
    stats,
    vouchers,
    publish,
    voucherForm,
    publishing,
    filteredUsers,
    loadVoucherData,
    openVoucherModal,
    saveVoucher,
    deleteVoucher,
    openPublishDrawer,
    confirmPublishVoucher,
  }
}
