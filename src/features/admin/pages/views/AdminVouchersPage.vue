<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppIcon from '@shared/ui/AppIcon.vue'
import { adminApi } from '@shared/lib/api/services'
import AdminPageHeader from '../../components/shared/AdminPageHeader.vue'

const tabs = [
  { id: 'voucher', label: 'Voucher', action: 'Tạo voucher' },
  { id: 'campaign', label: 'Chiến dịch Voucher', action: 'Tạo chiến dịch' },
  { id: 'combo', label: 'Combo Khuyến mãi', action: 'Tạo combo' },
  { id: 'notify', label: 'Thông báo Marketing', action: 'Tạo thông báo' },
]

const activeTab = ref('voucher')
const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const vouchers = ref([])
const campaigns = ref([])
const combos = ref([])
const notifications = ref([])
const products = ref([])
const users = ref([])
const toast = ref('')

const stats = ref({
  totalVouchers: 0,
  activeVouchers: 0,
  issuedCount: 0,
  campaignCount: 0,
  runningCampaignCount: 0,
  activeCombos: 0,
  comboUsedCount: 0,
})

const filters = reactive({
  voucher: { query: '', type: '', status: '' },
  campaign: { query: '', status: '' },
  combo: { query: '', status: '' },
  notify: { query: '', status: '' },
})

const modal = reactive({
  voucher: false,
  campaign: false,
  combo: false,
  notify: false,
  picker: false,
})

const editing = reactive({
  voucher: null,
  campaign: null,
  combo: null,
  notify: null,
})

const publish = reactive({
  voucher: null,
  segment: 'one',
  selectedUserIds: [],
  userQuery: '',
  segmentKey: 'NEW_USERS',
  channels: ['NOTIFICATION', 'EMAIL'],
  sendOption: 'NOW',
  title: '',
  body: '',
})

const voucherForm = reactive({
  code: '',
  name: '',
  voucherType: 'PUBLIC',
  discountType: 'PERCENT',
  discountValue: 0,
  maxDiscount: null,
  minOrder: 0,
  startDate: '',
  endDate: '',
  description: '',
  icon: 'badgePercent',
  active: true,
})

const campaignForm = reactive({
  name: '',
  voucherId: '',
  targetType: 'MANUAL',
  targetUserIds: [],
  segmentKey: 'NEW_USERS',
  channels: ['NOTIFICATION', 'EMAIL'],
  scheduleType: 'NOW',
  scheduledAt: '',
  notificationTitle: '',
  notificationBody: '',
  active: true,
})

const comboForm = reactive({
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 15,
  startDate: '',
  endDate: '',
  active: true,
  placements: ['PRODUCT_DETAIL', 'CART'],
  items: [],
})

const notifyForm = reactive({
  title: '',
  body: '',
  targetType: 'ALL',
  targetUserIds: [],
  segmentKey: 'VIP',
  channels: ['NOTIFICATION'],
  sendType: 'NOW',
  scheduledAt: '',
  relatedVoucherId: '',
  active: true,
})

const picker = reactive({
  query: '',
  category: '',
  status: '',
  stock: '',
  selected: {},
})

const activeAction = computed(() => tabs.find((tab) => tab.id === activeTab.value)?.action || 'Tạo mới')
const activeTabLabel = computed(() => tabs.find((tab) => tab.id === activeTab.value)?.label || '')

const filteredCampaigns = computed(() => filterLocal(campaigns.value, filters.campaign, ['name', 'voucherCode', 'targetLabel']))
const filteredCombos = computed(() => filterLocal(combos.value, filters.combo, ['name', 'status']))
const filteredNotifications = computed(() => filterLocal(notifications.value, filters.notify, ['title', 'targetLabel']))

const filteredUsers = computed(() => {
  const query = publish.userQuery.trim().toLowerCase()
  if (!query) return users.value
  return users.value.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query))
})

const filteredProducts = computed(() => {
  const query = picker.query.trim().toLowerCase()
  return products.value.filter((product) => {
    if (query && !`${product.name} ${product.sku}`.toLowerCase().includes(query)) return false
    if (picker.category && product.category !== picker.category) return false
    if (picker.status && product.status !== picker.status) return false
    if (picker.stock === 'instock' && product.stock <= 0) return false
    if (picker.stock === 'outstock' && product.stock > 0) return false
    return true
  })
})

const productCategories = computed(() => [...new Set(products.value.map((product) => product.category).filter(Boolean))])

const selectedPickerProducts = computed(() => Object.entries(picker.selected).map(([id, quantity]) => {
  const product = products.value.find((item) => item.id === id)
  return product ? { ...product, quantity } : null
}).filter(Boolean))

const comboOriginalAmount = computed(() => comboForm.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0))
const comboFinalAmount = computed(() => {
  const original = comboOriginalAmount.value
  const value = Number(comboForm.discountValue || 0)
  if (comboForm.discountType === 'PERCENTAGE') return Math.max(0, original * (1 - value / 100))
  if (comboForm.discountType === 'FIXED_AMOUNT') return Math.max(0, original - value)
  return Math.min(original, value)
})
const comboSavedAmount = computed(() => Math.max(0, comboOriginalAmount.value - comboFinalAmount.value))

const kpis = computed(() => [
  { label: 'Tổng voucher', value: stats.value.totalVouchers, sub: `${stats.value.activeVouchers} đang bật`, icon: 'badgePercent' },
  { label: 'Đã phát', value: stats.value.issuedCount, sub: 'lượt cấp phát', icon: 'send', gold: true },
  { label: 'Chiến dịch', value: stats.value.campaignCount || campaigns.value.length, sub: `${stats.value.runningCampaignCount || campaigns.value.filter((item) => item.status === 'RUNNING').length} đang chạy`, icon: 'calendar' },
  { label: 'Combo đang bật', value: stats.value.activeCombos || combos.value.filter((item) => item.status === 'ACTIVE').length, sub: `${stats.value.comboUsedCount || combos.value.reduce((sum, item) => sum + Number(item.usedCount || 0), 0)} lượt đã dùng`, icon: 'gift' },
])

function money(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function dateOnly(value) {
  if (!value) return 'Chưa đặt'
  return String(value).slice(0, 10)
}

function toDatetimeLocal(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

function numberText(value) {
  return Number(value || 0).toLocaleString('vi-VN')
}

function discountLabel(row) {
  if (row.discountType === 'PERCENT') return `${Number(row.discountValue || 0)}%`
  if (row.discountType === 'SHIPPING_CAP') return `Ship ${money(row.discountValue)}`
  return money(row.discountValue)
}

function statusLabel(status) {
  return {
    ACTIVE: 'Đang bật',
    RUNNING: 'Đang chạy',
    SCHEDULED: 'Đã hẹn lịch',
    DRAFT: 'Bản nháp',
    SENT: 'Đã gửi',
    PAUSED: 'Tạm dừng',
    EXPIRED: 'Hết hạn',
  }[status] || status || 'Đang bật'
}

function statusTone(rowOrStatus) {
  const status = typeof rowOrStatus === 'string' ? rowOrStatus : rowOrStatus?.status
  if (rowOrStatus && typeof rowOrStatus === 'object' && rowOrStatus.active === false) return 'off'
  if (['DRAFT', 'PAUSED'].includes(status)) return 'off'
  if (['EXPIRED'].includes(status)) return 'expired'
  if (['SCHEDULED'].includes(status)) return 'scheduled'
  return 'on'
}

function voucherStatusTone(row) {
  if (!row.active) return 'off'
  if (row.statusLabel === 'Hết hạn') return 'expired'
  if (row.statusLabel === 'Sắp diễn ra') return 'scheduled'
  return 'on'
}

function channelText(channels) {
  return Array.isArray(channels) ? channels.join(' + ') : channels || ''
}

function targetText(type, segmentKey, userIds) {
  if (type === 'ALL') return 'Toàn bộ người dùng'
  if (type === 'SEGMENT') return segmentLabel(segmentKey)
  return `${userIds?.length || 0} người dùng đã chọn`
}

function segmentLabel(key) {
  return {
    NEW_USERS: 'Khách mới đăng ký',
    VIP: 'Khách VIP',
    INACTIVE_30D: 'Chưa mua hàng 30 ngày',
    ABANDONED_CART: 'Giỏ hàng chưa checkout',
    HIGH_SPEND: 'Chi tiêu > 5.000.000đ',
  }[key] || 'Theo điều kiện'
}

function filterLocal(items, filter, fields) {
  const query = filter.query.trim().toLowerCase()
  const status = filter.status
  return items.filter((item) => {
    const matchesQuery = !query || fields.some((field) => String(item[field] || '').toLowerCase().includes(query))
    const matchesStatus = !status || item.status === status
    return matchesQuery && matchesStatus
  })
}

function getListPayload(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.data)) return data.data
  return []
}

function notify(message) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 2600)
}

async function loadVoucherData() {
  loading.value = true
  try {
    const [listRes, statsRes] = await Promise.all([
      adminApi.fetchVouchers({
        query: filters.voucher.query,
        type: filters.voucher.type,
        status: filters.voucher.status,
      }),
      adminApi.fetchVoucherStats().catch(() => ({ data: stats.value })),
    ])
    vouchers.value = getListPayload(listRes?.data)
    stats.value = { ...stats.value, ...(statsRes?.data || {}) }
  } finally {
    loading.value = false
  }
}

async function loadCampaigns() {
  try {
    const response = await adminApi.fetchMarketingCampaigns({ query: filters.campaign.query, status: filters.campaign.status, size: 50 })
    campaigns.value = getListPayload(response?.data)
  } catch (error) {
    campaigns.value = []
    notify(error?.response?.data?.message || error.message || 'Khong tai duoc chien dich')
  }
}

async function loadCombos() {
  try {
    const response = await adminApi.fetchMarketingCombos({ query: filters.combo.query, status: filters.combo.status, size: 50 })
    combos.value = getListPayload(response?.data)
  } catch (error) {
    combos.value = []
    notify(error?.response?.data?.message || error.message || 'Khong tai duoc combo')
  }
}

async function loadNotifications() {
  try {
    const response = await adminApi.fetchMarketingNotifications({ query: filters.notify.query, status: filters.notify.status, size: 50 })
    notifications.value = getListPayload(response?.data)
  } catch (error) {
    notifications.value = []
    notify(error?.response?.data?.message || error.message || 'Khong tai duoc thong bao')
  }
}

async function loadProductsForPicker() {
  try {
    const response = await adminApi.fetchProducts({ size: 500 })
    const items = getListPayload(response?.data)
    products.value = items.map(mapProduct)
  } catch (error) {
    products.value = []
    notify(error?.response?.data?.message || error.message || 'Khong tai duoc san pham')
  }
}

async function loadUsersForTarget() {
  try {
    const response = await adminApi.fetchAdminUsers({ size: 500 })
    users.value = getListPayload(response?.data).map(mapUser).filter((user) => user.id)
  } catch (error) {
    users.value = []
    notify(error?.response?.data?.message || error.message || 'Khong tai duoc user')
  }
}

function mapProduct(item) {
  const variant = item.variants?.[0] || item.defaultVariant || item
  return {
    id: item.id,
    variantId: variant.id || item.variantId || item.id,
    name: item.name,
    sku: variant.sku || item.sku || item.slug || item.id,
    category: item.categoryName || item.category?.name || item.category || 'Sản phẩm',
    price: Number(variant.price || item.price || item.minPrice || 0),
    stock: Number(variant.stockQuantity ?? variant.stock ?? item.stockQuantity ?? item.stock ?? 0),
    status: item.status || item.productStatus || 'Đang bán',
    image: item.image || item.thumbnailUrl || item.imageUrl || 'box',
  }
}

function mapUser(item) {
  const name = item.displayName || item.fullName || item.name || item.username || item.email || item.id || item.userId
  return {
    id: item.id || item.userId,
    name,
    email: item.email || '',
    avatar: String(name || 'U').trim().slice(0, 2).toUpperCase(),
  }
}

async function loadActiveTab() {
  if (activeTab.value === 'voucher') await loadVoucherData()
  if (activeTab.value === 'campaign') await loadCampaigns()
  if (activeTab.value === 'combo') await Promise.all([loadCombos(), loadProductsForPicker()])
  if (activeTab.value === 'notify') await loadNotifications()
}

function openPrimaryAction() {
  if (activeTab.value === 'voucher') return openVoucherModal()
  if (activeTab.value === 'campaign') return openCampaignModal()
  if (activeTab.value === 'combo') return openComboModal()
  return openNotifyModal()
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
    await adminApi.deleteVoucher(row.id)
    notify('Đã xóa voucher')
    await loadVoucherData()
  } catch (error) {
    notify(error?.response?.data?.message || error.message || 'Không xóa được voucher')
  }
}

function openPublishDrawer(row) {
  publish.voucher = row
  publish.segment = 'one'
  publish.selectedUserIds = users.value[0]?.id ? [users.value[0].id] : []
  publish.title = `Bạn vừa nhận voucher ${row.code}`
  publish.body = `Bạn vừa nhận voucher ${row.name}. Vào mục Voucher của tôi để sử dụng ngay.`
}

function resetCampaignForm(row = null) {
  editing.campaign = row
  campaignForm.name = row?.name || ''
  campaignForm.voucherId = row?.voucherId || vouchers.value[0]?.id || ''
  campaignForm.targetType = row?.targetType || 'MANUAL'
  campaignForm.targetUserIds = row?.targetUserIds ? [...row.targetUserIds] : (users.value[0]?.id ? [users.value[0].id] : [])
  campaignForm.segmentKey = row?.segmentKey || 'NEW_USERS'
  campaignForm.channels = row?.channels ? [...row.channels] : ['NOTIFICATION', 'EMAIL']
  campaignForm.scheduleType = row?.scheduleType || 'NOW'
  campaignForm.scheduledAt = toDatetimeLocal(row?.scheduledAt)
  campaignForm.notificationTitle = row?.notificationTitle || ''
  campaignForm.notificationBody = row?.notificationBody || ''
  campaignForm.active = row?.active ?? true
}

function openCampaignModal(row = null) {
  resetCampaignForm(row)
  modal.campaign = true
}

function campaignPayload() {
  return {
    name: campaignForm.name.trim(),
    voucherId: campaignForm.voucherId || null,
    targetType: campaignForm.targetType,
    targetUserIds: campaignForm.targetType === 'MANUAL' ? campaignForm.targetUserIds : [],
    segmentKey: campaignForm.targetType === 'SEGMENT' ? campaignForm.segmentKey : null,
    channels: campaignForm.channels,
    scheduleType: campaignForm.scheduleType,
    scheduledAt: campaignForm.scheduleType === 'SCHEDULED' ? campaignForm.scheduledAt : null,
    notificationTitle: campaignForm.notificationTitle,
    notificationBody: campaignForm.notificationBody,
    active: campaignForm.active,
  }
}

async function saveCampaign() {
  const payload = campaignPayload()
  try {
    if (editing.campaign?.id) await adminApi.updateMarketingCampaign(editing.campaign.id, payload)
    else await adminApi.createMarketingCampaign(payload)
    await loadCampaigns()
  } catch (error) {
    notify(error?.response?.data?.message || error.message || 'Khong luu duoc chien dich')
    return
  }
  notify('Đã lưu chiến dịch')
  modal.campaign = false
}

function resetComboForm(row = null) {
  editing.combo = row
  comboForm.name = row?.name || ''
  comboForm.description = row?.description || ''
  comboForm.discountType = row?.discountType || 'PERCENTAGE'
  comboForm.discountValue = row?.discountValue ?? 15
  comboForm.startDate = toDatetimeLocal(row?.startDate)
  comboForm.endDate = toDatetimeLocal(row?.endDate)
  comboForm.active = row?.active ?? true
  comboForm.placements = row?.placements ? [...row.placements] : ['PRODUCT_DETAIL', 'CART']
  comboForm.items = row?.items ? row.items.map((item) => ({ ...item, id: item.id || item.productId, name: item.name || item.productName, category: item.category || item.categoryName })) : []
}

async function openComboModal(row = null) {
  if (!products.value.length) await loadProductsForPicker()
  resetComboForm(row)
  modal.combo = true
}

function comboPayload() {
  return {
    name: comboForm.name.trim(),
    description: comboForm.description,
    discountType: comboForm.discountType,
    discountValue: Number(comboForm.discountValue) || 0,
    startDate: comboForm.startDate || null,
    endDate: comboForm.endDate || null,
    active: comboForm.active,
    placements: comboForm.placements,
    items: comboForm.items.map((item) => ({
      productId: item.id,
      variantId: item.variantId,
      quantity: Number(item.quantity || 1),
      productName: item.name || item.productName,
      sku: item.sku,
      categoryName: item.category || item.categoryName,
      image: item.image,
      price: Number(item.price || 0),
    })),
  }
}

async function saveCombo() {
  const payload = comboPayload()
  try {
    if (editing.combo?.id) await adminApi.updateMarketingCombo(editing.combo.id, payload)
    else await adminApi.createMarketingCombo(payload)
    await loadCombos()
  } catch (error) {
    notify(error?.response?.data?.message || error.message || 'Khong luu duoc combo')
    return
  }
  notify('Đã lưu combo')
  modal.combo = false
}

function openProductPicker() {
  picker.selected = Object.fromEntries(comboForm.items.map((item) => [item.id, item.quantity || 1]))
  picker.query = ''
  picker.category = ''
  picker.status = ''
  picker.stock = ''
  modal.picker = true
}

function togglePickerProduct(product, checked) {
  if (checked) picker.selected[product.id] = picker.selected[product.id] || 1
  else delete picker.selected[product.id]
}

function applyPickerProducts() {
  comboForm.items = selectedPickerProducts.value.map((product) => ({ ...product }))
  modal.picker = false
}

function removeComboItem(id) {
  comboForm.items = comboForm.items.filter((item) => item.id !== id)
}

function resetNotifyForm(row = null) {
  editing.notify = row
  notifyForm.title = row?.title || ''
  notifyForm.body = row?.body || ''
  notifyForm.targetType = row?.targetType || 'ALL'
  notifyForm.targetUserIds = row?.targetUserIds ? [...row.targetUserIds] : []
  notifyForm.segmentKey = row?.segmentKey || 'VIP'
  notifyForm.channels = row?.channels ? [...row.channels] : ['NOTIFICATION']
  notifyForm.sendType = row?.sendType || 'NOW'
  notifyForm.scheduledAt = toDatetimeLocal(row?.scheduledAt)
  notifyForm.relatedVoucherId = row?.relatedVoucherId || ''
  notifyForm.active = row?.active ?? true
}

function openNotifyModal(row = null) {
  resetNotifyForm(row)
  modal.notify = true
}

function notifyPayload() {
  return {
    title: notifyForm.title.trim(),
    body: notifyForm.body,
    targetType: notifyForm.targetType,
    targetUserIds: notifyForm.targetType === 'MANUAL' ? notifyForm.targetUserIds : [],
    segmentKey: notifyForm.targetType === 'SEGMENT' ? notifyForm.segmentKey : null,
    channels: notifyForm.channels,
    sendType: notifyForm.sendType,
    scheduledAt: notifyForm.sendType === 'SCHEDULED' ? notifyForm.scheduledAt : null,
    relatedVoucherId: notifyForm.relatedVoucherId || null,
    active: notifyForm.active,
  }
}

async function saveNotification() {
  const payload = notifyPayload()
  try {
    if (editing.notify?.id) await adminApi.updateMarketingNotification(editing.notify.id, payload)
    else await adminApi.createMarketingNotification(payload)
    await loadNotifications()
  } catch (error) {
    notify(error?.response?.data?.message || error.message || 'Khong luu duoc thong bao')
    return
  }
  notify('Đã lưu thông báo')
  modal.notify = false
}

async function deleteMarketing(type, row) {
  if (!row?.id || !window.confirm(`Xóa ${row.name || row.title}?`)) return
  try {
    if (type === 'campaign') await adminApi.deleteMarketingCampaign(row.id)
    if (type === 'combo') await adminApi.deleteMarketingCombo(row.id)
    if (type === 'notify') await adminApi.deleteMarketingNotification(row.id)
    await loadActiveTab()
  } catch {
    notify('Khong xoa duoc')
    notify('Khong xoa duoc')
  }
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
    notify('Hay chon user nhan voucher')
    return
  }
  publishing.value = true
  try {
    await adminApi.publishVoucher(publish.voucher.id, publishPayload())
    notify('Da phat hanh voucher')
    publish.voucher = null
    await loadVoucherData()
  } catch (error) {
    notify(error?.response?.data?.message || error.message || 'Khong phat hanh duoc voucher')
  } finally {
    publishing.value = false
  }
}

watch(activeTab, loadActiveTab)

onMounted(async () => {
  await Promise.all([loadVoucherData(), loadCampaigns(), loadCombos(), loadNotifications(), loadProductsForPicker(), loadUsersForTarget()])
})
</script>

<template>
  <div class="marketing-center">
    <AdminPageHeader
      eyebrow="Quản lý hệ thống"
      title-html="Marketing <em>Center</em>"
      subtitle="Quản lý voucher, chiến dịch, combo khuyến mãi và thông báo"
    >
      <template #actions>
        <button type="button" class="mc-primary" @click="openPrimaryAction">
          <AppIcon name="plus" :size="15" />{{ activeAction }}
        </button>
      </template>
    </AdminPageHeader>

    <div class="mc-stats">
      <article v-for="item in kpis" :key="item.label" class="mc-stat">
        <div class="stat-icon"><AppIcon :name="item.icon" :size="17" /></div>
        <span>{{ item.label }}</span>
        <strong :class="{ gold: item.gold }">{{ numberText(item.value) }}</strong>
        <small>{{ item.sub }}</small>
      </article>
    </div>

    <nav class="mc-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="activeTab === 'voucher'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.voucher.query" class="mc-input" placeholder="Tìm theo mã hoặc tên..." @keyup.enter="loadVoucherData">
        <select v-model="filters.voucher.type" class="mc-select" @change="loadVoucherData">
          <option value="">Tất cả loại</option>
          <option value="PUBLIC">PUBLIC</option>
          <option value="PERSONAL">PERSONAL</option>
          <option value="MARKETING">MARKETING</option>
        </select>
        <select v-model="filters.voucher.status" class="mc-select" @change="loadVoucherData">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bật</option>
          <option value="inactive">Đang tắt</option>
          <option value="expired">Hết hạn</option>
        </select>
        <button type="button" class="mc-outline" @click="loadVoucherData"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Giảm</th>
              <th>Đã phát</th>
              <th>Đơn tối thiểu</th>
              <th>Hết hạn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="9" class="mc-empty">Đang tải voucher...</td></tr>
            <tr v-else-if="!vouchers.length"><td colspan="9" class="mc-empty">Chưa có voucher phù hợp.</td></tr>
            <tr v-for="row in vouchers" v-else :key="row.id">
              <td><span class="code-badge">{{ row.code }}</span></td>
              <td class="mc-name">{{ row.name }}</td>
              <td><span class="type-badge" :class="`type-${String(row.voucherType || 'PUBLIC').toLowerCase()}`">{{ row.voucherType || 'PUBLIC' }}</span></td>
              <td><span class="discount-gold">{{ discountLabel(row) }}</span></td>
              <td><span class="sent-count">{{ row.issuedCount || 0 }} user</span></td>
              <td>{{ money(row.minOrder) }}</td>
              <td>{{ dateOnly(row.endDate) }}</td>
              <td><span class="status-badge" :class="voucherStatusTone(row)"><span />{{ row.statusLabel || (row.active ? 'Đang bật' : 'Đang tắt') }}</span></td>
              <td>
                <div class="mc-actions">
                  <button type="button" title="Xem/Sửa" @click="openVoucherModal(row)"><AppIcon name="eye" :size="14" /></button>
                  <button type="button" title="Sửa" @click="openVoucherModal(row)"><AppIcon name="edit" :size="14" /></button>
                  <button type="button" class="publish" title="Phát hành" @click="openPublishDrawer(row)"><AppIcon name="send" :size="14" /></button>
                  <button type="button" class="danger" title="Xóa" @click="deleteVoucher(row)"><AppIcon name="trash" :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination"><span>Hiển thị {{ vouchers.length }} voucher</span><div><button>1</button><button disabled>2</button></div></div>
    </section>

    <section v-if="activeTab === 'campaign'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.campaign.query" class="mc-input" placeholder="Tìm chiến dịch..." @keyup.enter="loadCampaigns">
        <select v-model="filters.campaign.status" class="mc-select">
          <option value="">Tất cả trạng thái</option>
          <option value="RUNNING">Đang chạy</option>
          <option value="SCHEDULED">Đã hẹn lịch</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
        <button type="button" class="mc-outline" @click="loadCampaigns"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Chiến dịch</th><th>Voucher</th><th>Tệp nhận</th><th>Kênh</th><th>Đã gửi</th><th>Lịch</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredCampaigns.length"><td colspan="8" class="mc-empty">Chưa có chiến dịch phù hợp.</td></tr>
            <tr v-for="row in filteredCampaigns" :key="row.id">
              <td class="mc-name">{{ row.name }}</td>
              <td><span class="code-badge">{{ row.voucherCode }}</span></td>
              <td>{{ row.targetLabel }}</td>
              <td>{{ channelText(row.channelLabels || row.channels) }}</td>
              <td>{{ numberText(row.sentCount) }}</td>
              <td>{{ dateOnly(row.scheduledAt) }}</td>
              <td><span class="status-badge" :class="statusTone(row.status)"><span />{{ statusLabel(row.status) }}</span></td>
              <td><div class="mc-actions"><button @click="openCampaignModal(row)"><AppIcon name="edit" :size="14" /></button><button class="danger" @click="deleteMarketing('campaign', row)"><AppIcon name="trash" :size="14" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'combo'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.combo.query" class="mc-input" placeholder="Tìm combo..." @keyup.enter="loadCombos">
        <select v-model="filters.combo.status" class="mc-select">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bật</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
        <button type="button" class="mc-outline" @click="loadCombos"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Combo</th><th>Số SP</th><th>Giá gốc</th><th>Giá combo</th><th>Tiết kiệm</th><th>Đã dùng</th><th>Hết hạn</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredCombos.length"><td colspan="9" class="mc-empty">Chưa có combo phù hợp.</td></tr>
            <tr v-for="row in filteredCombos" :key="row.id">
              <td class="mc-name">{{ row.name }}</td>
              <td>{{ row.itemCount }}</td>
              <td>{{ money(row.originalAmount) }}</td>
              <td><span class="discount-gold">{{ money(row.finalAmount) }}</span></td>
              <td>{{ money(row.savedAmount) }}</td>
              <td>{{ numberText(row.usedCount) }}</td>
              <td>{{ dateOnly(row.endDate) }}</td>
              <td><span class="status-badge" :class="statusTone(row.status)"><span />{{ statusLabel(row.status) }}</span></td>
              <td><div class="mc-actions"><button @click="openComboModal(row)"><AppIcon name="edit" :size="14" /></button><button class="danger" @click="deleteMarketing('combo', row)"><AppIcon name="trash" :size="14" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'notify'" class="mc-card">
      <div class="mc-filter">
        <input v-model="filters.notify.query" class="mc-input" placeholder="Tìm thông báo..." @keyup.enter="loadNotifications">
        <select v-model="filters.notify.status" class="mc-select">
          <option value="">Tất cả trạng thái</option>
          <option value="SENT">Đã gửi</option>
          <option value="SCHEDULED">Đã hẹn lịch</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
        <button type="button" class="mc-outline" @click="loadNotifications"><AppIcon name="search" :size="14" />Lọc</button>
      </div>
      <div class="mc-table-wrap">
        <table class="mc-table">
          <thead><tr><th>Tiêu đề</th><th>Tệp nhận</th><th>Kênh</th><th>Đã gửi</th><th>Lịch gửi</th><th>Tạo lúc</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
          <tbody>
            <tr v-if="!filteredNotifications.length"><td colspan="8" class="mc-empty">Chưa có thông báo phù hợp.</td></tr>
            <tr v-for="row in filteredNotifications" :key="row.id">
              <td class="mc-name">{{ row.title }}</td>
              <td>{{ row.targetLabel }}</td>
              <td>{{ channelText(row.channelLabels || row.channels) }}</td>
              <td>{{ numberText(row.sentCount) }}</td>
              <td>{{ dateOnly(row.scheduledAt) }}</td>
              <td>{{ dateOnly(row.createdAt) }}</td>
              <td><span class="status-badge" :class="statusTone(row.status)"><span />{{ statusLabel(row.status) }}</span></td>
              <td><div class="mc-actions"><button @click="openNotifyModal(row)"><AppIcon name="edit" :size="14" /></button><button class="danger" @click="deleteMarketing('notify', row)"><AppIcon name="trash" :size="14" /></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <form v-if="modal.voucher" class="modal-backdrop" @click.self="modal.voucher = false" @submit.prevent="saveVoucher">
      <div class="modal-card">
        <header><h2>{{ editing.voucher ? 'Sửa' : 'Tạo' }} <em>voucher</em></h2><button type="button" @click="modal.voucher = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="form-row"><label>Mã voucher *<input v-model="voucherForm.code" required placeholder="SALE10"></label><label>Tên *<input v-model="voucherForm.name" required placeholder="Giảm 10%"></label></div>
          <label>Loại voucher<select v-model="voucherForm.voucherType"><option value="PUBLIC">PUBLIC</option><option value="PERSONAL">PERSONAL</option><option value="MARKETING">MARKETING</option></select></label>
          <div class="form-row"><label>Loại giảm<select v-model="voucherForm.discountType"><option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền cố định</option><option value="SHIPPING_CAP">Giảm vận chuyển</option></select></label><label>Giá trị<input v-model.number="voucherForm.discountValue" type="number" min="0"></label></div>
          <div class="form-row"><label>Giảm tối đa<input v-model="voucherForm.maxDiscount" type="number" min="0"></label><label>Đơn tối thiểu<input v-model="voucherForm.minOrder" type="number" min="0"></label></div>
          <div class="form-row"><label>Bắt đầu<input v-model="voucherForm.startDate" type="datetime-local"></label><label>Kết thúc<input v-model="voucherForm.endDate" type="datetime-local"></label></div>
          <label>Mô tả<textarea v-model="voucherForm.description" rows="3" /></label>
          <label class="check-line"><input v-model="voucherForm.active" type="checkbox">Đang bật</label>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.voucher = false">Hủy</button><button class="mc-primary" :disabled="saving"><AppIcon name="check" />Lưu thay đổi</button></footer>
      </div>
    </form>

    <form v-if="modal.campaign" class="modal-backdrop" @click.self="modal.campaign = false" @submit.prevent="saveCampaign">
      <div class="modal-card modal-lg">
        <header><h2>{{ editing.campaign ? 'Sửa' : 'Tạo' }} <em>chiến dịch</em></h2><button type="button" @click="modal.campaign = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="section-title"><AppIcon name="calendar" />Thông tin chiến dịch</div>
          <div class="form-row"><label>Tên chiến dịch *<input v-model="campaignForm.name" required placeholder="Phát SALE8/8 cho khách VIP"></label><label>Voucher<select v-model="campaignForm.voucherId"><option value="">Chọn voucher</option><option v-for="voucher in vouchers" :key="voucher.id" :value="voucher.id">{{ voucher.code }} - {{ voucher.name }}</option></select></label></div>
          <div class="section-title"><AppIcon name="users" />Tệp người nhận</div>
          <div class="choice-grid">
            <button type="button" :class="{ selected: campaignForm.targetType === 'MANUAL' }" @click="campaignForm.targetType = 'MANUAL'">Chọn thủ công<small>{{ campaignForm.targetUserIds.length }} user</small></button>
            <button type="button" :class="{ selected: campaignForm.targetType === 'ALL' }" @click="campaignForm.targetType = 'ALL'">Toàn bộ<small>1.243 user</small></button>
            <button type="button" :class="{ selected: campaignForm.targetType === 'SEGMENT' }" @click="campaignForm.targetType = 'SEGMENT'">Theo điều kiện<small>VIP, giỏ bỏ quên</small></button>
          </div>
          <div v-if="campaignForm.targetType === 'MANUAL'" class="user-pick-list">
            <label v-for="user in users" :key="user.id" class="user-pick-item"><input v-model="campaignForm.targetUserIds" type="checkbox" :value="user.id"><span>{{ user.avatar }}</span><b>{{ user.name }}</b><small>{{ user.email }}</small></label>
          </div>
          <label v-if="campaignForm.targetType === 'SEGMENT'">Nhóm người dùng<select v-model="campaignForm.segmentKey"><option value="NEW_USERS">Khách mới đăng ký</option><option value="VIP">Khách VIP</option><option value="INACTIVE_30D">Chưa mua hàng 30 ngày</option><option value="ABANDONED_CART">Giỏ hàng chưa checkout</option><option value="HIGH_SPEND">Chi tiêu &gt; 5.000.000đ</option></select></label>
          <div class="section-title"><AppIcon name="send" />Kênh gửi và lịch</div>
          <div class="checkbox-grid"><label class="check-line"><input v-model="campaignForm.channels" type="checkbox" value="NOTIFICATION">Notification</label><label class="check-line"><input v-model="campaignForm.channels" type="checkbox" value="EMAIL">Email</label></div>
          <div class="choice-grid"><button type="button" :class="{ selected: campaignForm.scheduleType === 'NOW' }" @click="campaignForm.scheduleType = 'NOW'">Gửi ngay</button><button type="button" :class="{ selected: campaignForm.scheduleType === 'SCHEDULED' }" @click="campaignForm.scheduleType = 'SCHEDULED'">Hẹn lịch</button></div>
          <label v-if="campaignForm.scheduleType === 'SCHEDULED'">Thời gian gửi<input v-model="campaignForm.scheduledAt" type="datetime-local"></label>
          <div class="form-row"><label>Tiêu đề thông báo<input v-model="campaignForm.notificationTitle" placeholder="Bạn vừa nhận voucher mới"></label><label>Trạng thái<select v-model="campaignForm.active"><option :value="true">Đang bật</option><option :value="false">Bản nháp</option></select></label></div>
          <label>Nội dung<textarea v-model="campaignForm.notificationBody" rows="3" /></label>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.campaign = false">Hủy</button><button class="mc-primary"><AppIcon name="save" />Lưu chiến dịch</button></footer>
      </div>
    </form>

    <form v-if="modal.combo" class="modal-backdrop" @click.self="modal.combo = false" @submit.prevent="saveCombo">
      <div class="modal-card modal-lg">
        <header><h2>{{ editing.combo ? 'Sửa' : 'Tạo' }} <em>combo</em></h2><button type="button" @click="modal.combo = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="section-title"><AppIcon name="gift" />Thông tin combo</div>
          <div class="form-row"><label>Tên combo *<input v-model="comboForm.name" required placeholder="Combo phòng ngủ LuxNest"></label><label>Loại ưu đãi<select v-model="comboForm.discountType"><option value="PERCENTAGE">Giảm theo %</option><option value="FIXED_AMOUNT">Giảm số tiền</option><option value="FIXED_COMBO_PRICE">Giá combo cố định</option></select></label></div>
          <div class="form-row"><label>Giá trị ưu đãi<input v-model.number="comboForm.discountValue" type="number" min="0"></label><label>Trạng thái<select v-model="comboForm.active"><option :value="true">Đang bật</option><option :value="false">Bản nháp</option></select></label></div>
          <div class="form-row"><label>Bắt đầu<input v-model="comboForm.startDate" type="datetime-local"></label><label>Kết thúc<input v-model="comboForm.endDate" type="datetime-local"></label></div>
          <label>Mô tả<textarea v-model="comboForm.description" rows="2" /></label>
          <div class="section-title"><AppIcon name="box" />Sản phẩm trong combo</div>
          <button type="button" class="add-product" @click="openProductPicker"><AppIcon name="plus" />Chọn sản phẩm</button>
          <div v-if="!comboForm.items.length" class="empty-box">Chưa có sản phẩm nào trong combo.</div>
          <div v-for="item in comboForm.items" :key="item.id" class="combo-item-card">
            <div class="prod-thumb"><AppIcon :name="item.image || 'box'" /></div>
            <div><b>{{ item.name }}</b><small>SKU: {{ item.sku }} · {{ money(item.price) }} · {{ item.category }}</small></div>
            <label><span>SL</span><input v-model.number="item.quantity" type="number" min="1"></label>
            <button type="button" @click="removeComboItem(item.id)"><AppIcon name="trash" /></button>
          </div>
          <div class="checkbox-grid"><label class="check-line"><input v-model="comboForm.placements" type="checkbox" value="PRODUCT_DETAIL">Trang sản phẩm</label><label class="check-line"><input v-model="comboForm.placements" type="checkbox" value="CART">Giỏ hàng</label><label class="check-line"><input v-model="comboForm.placements" type="checkbox" value="CHECKOUT">Checkout</label><label class="check-line"><input v-model="comboForm.placements" type="checkbox" value="HOME">Trang chủ</label></div>
          <div class="combo-summary"><div><span>Giá gốc</span><b>{{ money(comboOriginalAmount) }}</b></div><div><span>Giá combo</span><b>{{ money(comboFinalAmount) }}</b></div><div class="save"><span>Khách tiết kiệm</span><b>{{ money(comboSavedAmount) }}</b></div></div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.combo = false">Hủy</button><button class="mc-primary"><AppIcon name="save" />Lưu combo</button></footer>
      </div>
    </form>

    <div v-if="modal.picker" class="modal-backdrop picker-layer" @click.self="modal.picker = false">
      <div class="modal-card modal-lg">
        <header><h2>Chọn <em>sản phẩm</em></h2><button type="button" @click="modal.picker = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <div class="mc-filter compact"><input v-model="picker.query" class="mc-input" placeholder="Tìm sản phẩm hoặc SKU..."><select v-model="picker.category" class="mc-select"><option value="">Tất cả danh mục</option><option v-for="category in productCategories" :key="category" :value="category">{{ category }}</option></select><select v-model="picker.stock" class="mc-select"><option value="">Tất cả tồn kho</option><option value="instock">Còn hàng</option><option value="outstock">Hết hàng</option></select></div>
          <div class="picker-table">
            <table class="mc-table">
              <thead><tr><th></th><th>Sản phẩm</th><th>SKU</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr v-for="product in filteredProducts" :key="product.id" :class="{ disabled: product.stock <= 0 }">
                  <td><input :checked="picker.selected[product.id] !== undefined" :disabled="product.stock <= 0" type="checkbox" @change="togglePickerProduct(product, $event.target.checked)"></td>
                  <td class="product-cell"><span class="prod-thumb"><AppIcon :name="product.image || 'box'" /></span><b>{{ product.name }}</b></td>
                  <td><span class="code-badge">{{ product.sku }}</span></td>
                  <td>{{ product.category }}</td>
                  <td>{{ money(product.price) }}</td>
                  <td>{{ product.stock }}</td>
                  <td>{{ product.stock > 0 ? 'Đang bán' : 'Hết hàng' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="selected-box"><b>Đã chọn {{ selectedPickerProducts.length }} sản phẩm</b><div v-for="product in selectedPickerProducts" :key="product.id"><span>{{ product.name }}</span><input v-model.number="picker.selected[product.id]" type="number" min="1"></div></div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.picker = false">Hủy</button><button type="button" class="mc-primary" @click="applyPickerProducts"><AppIcon name="check" />Thêm vào combo</button></footer>
      </div>
    </div>

    <form v-if="modal.notify" class="modal-backdrop" @click.self="modal.notify = false" @submit.prevent="saveNotification">
      <div class="modal-card">
        <header><h2>{{ editing.notify ? 'Sửa' : 'Tạo' }} <em>thông báo</em></h2><button type="button" @click="modal.notify = false"><AppIcon name="x" /></button></header>
        <div class="modal-body">
          <label>Tiêu đề *<input v-model="notifyForm.title" required placeholder="Bạn vừa nhận voucher mới"></label>
          <label>Nội dung<textarea v-model="notifyForm.body" required rows="4" /></label>
          <div class="form-row"><label>Voucher liên quan<select v-model="notifyForm.relatedVoucherId"><option value="">Không gắn voucher</option><option v-for="voucher in vouchers" :key="voucher.id" :value="voucher.id">{{ voucher.code }} - {{ voucher.name }}</option></select></label><label>Kiểu gửi<select v-model="notifyForm.sendType"><option value="NOW">Gửi ngay</option><option value="SCHEDULED">Hẹn lịch</option><option value="DRAFT">Lưu nháp</option></select></label></div>
          <label v-if="notifyForm.sendType === 'SCHEDULED'">Thời gian gửi<input v-model="notifyForm.scheduledAt" type="datetime-local"></label>
          <div class="choice-grid"><button type="button" :class="{ selected: notifyForm.targetType === 'MANUAL' }" @click="notifyForm.targetType = 'MANUAL'">Chọn user</button><button type="button" :class="{ selected: notifyForm.targetType === 'ALL' }" @click="notifyForm.targetType = 'ALL'">Toàn bộ</button><button type="button" :class="{ selected: notifyForm.targetType === 'SEGMENT' }" @click="notifyForm.targetType = 'SEGMENT'">Theo điều kiện</button></div>
          <div v-if="notifyForm.targetType === 'MANUAL'" class="user-pick-list"><label v-for="user in users" :key="user.id" class="user-pick-item"><input v-model="notifyForm.targetUserIds" type="checkbox" :value="user.id"><span>{{ user.avatar }}</span><b>{{ user.name }}</b><small>{{ user.email }}</small></label></div>
          <label v-if="notifyForm.targetType === 'SEGMENT'">Nhóm người dùng<select v-model="notifyForm.segmentKey"><option value="VIP">Khách VIP</option><option value="NEW_USERS">Khách mới đăng ký</option><option value="ABANDONED_CART">Giỏ hàng chưa checkout</option></select></label>
          <div class="checkbox-grid"><label class="check-line"><input v-model="notifyForm.channels" type="checkbox" value="NOTIFICATION">Notification</label><label class="check-line"><input v-model="notifyForm.channels" type="checkbox" value="EMAIL">Email</label></div>
        </div>
        <footer><button type="button" class="mc-cancel" @click="modal.notify = false">Hủy</button><button class="mc-primary"><AppIcon name="send" />Lưu thông báo</button></footer>
      </div>
    </form>

    <aside v-if="publish.voucher" class="drawer-backdrop" @click.self="publish.voucher = null">
      <div class="publish-drawer">
        <header><strong>Phát hành voucher <em>{{ publish.voucher.code }}</em></strong><button type="button" @click="publish.voucher = null"><AppIcon name="x" /></button></header>
        <div class="drawer-body">
          <div class="segment-choice">
            <button :class="{ selected: publish.segment === 'one' }" @click="publish.segment = 'one'"><AppIcon name="user" /><span>Một người<small>Tìm và cấp cho 1 user cụ thể</small></span></button>
            <button :class="{ selected: publish.segment === 'many' }" @click="publish.segment = 'many'"><AppIcon name="users" /><span>Nhiều người<small>Chọn danh sách user</small></span></button>
            <button :class="{ selected: publish.segment === 'all' }" @click="publish.segment = 'all'"><AppIcon name="globe" /><span>Toàn bộ người dùng<small>Phát hàng loạt</small></span></button>
            <button :class="{ selected: publish.segment === 'cond' }" @click="publish.segment = 'cond'"><AppIcon name="filter" /><span>Theo điều kiện<small>Khách VIP, giỏ hàng bỏ quên</small></span></button>
          </div>
          <label v-if="publish.segment === 'one' || publish.segment === 'many'">Tìm người dùng<input v-model="publish.userQuery" placeholder="Email hoặc tên..."></label>
          <div v-if="publish.segment === 'one' || publish.segment === 'many'" class="user-pick-list compact-users">
            <label v-for="user in filteredUsers" :key="user.id" class="user-pick-item">
              <input
                v-if="publish.segment === 'one'"
                type="radio"
                name="publish-user"
                :checked="publish.selectedUserIds[0] === user.id"
                @change="publish.selectedUserIds = [user.id]"
              >
              <input v-else v-model="publish.selectedUserIds" type="checkbox" :value="user.id">
              <span>{{ user.avatar }}</span><b>{{ user.name }}</b><small>{{ user.email }}</small>
            </label>
          </div>
          <div v-if="publish.segment === 'all'" class="warn-box">Bạn sắp phát voucher cho toàn bộ người dùng đủ điều kiện nhận.</div>
          <label v-if="publish.segment === 'cond'">Nhóm người dùng<select v-model="publish.segmentKey"><option value="NEW_USERS">Khách mới đăng ký</option><option value="VIP">Khách VIP</option><option value="ABANDONED_CART">Giỏ hàng chưa checkout</option></select></label>
          <div class="checkbox-grid"><label class="check-line"><input v-model="publish.channels" type="checkbox" value="NOTIFICATION">Notification</label><label class="check-line"><input v-model="publish.channels" type="checkbox" value="EMAIL">Email</label></div>
          <label>Tiêu đề<input v-model="publish.title"></label>
          <label>Nội dung<textarea v-model="publish.body" rows="3" /></label>
          <button type="button" class="mc-primary" :disabled="publishing" @click="confirmPublishVoucher"><AppIcon name="send" />Xác nhận phát hành</button>
        </div>
      </div>
    </aside>

    <div v-if="toast" class="mc-toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.marketing-center { display: flex; flex-direction: column; gap: 16px; color: #1a2332; }
.mc-primary, .mc-outline, .mc-cancel { border-radius: 8px; border: 1px solid #c9953a; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 34px; }
.mc-primary { background: #c9953a; color: #fff; }
.mc-primary.disabled, .mc-primary:disabled { opacity: .55; cursor: not-allowed; }
.mc-outline, .mc-cancel { background: #fff; color: #c9953a; }
.mc-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.mc-stat { position: relative; background: #fff; border: 1px solid #e8e0d0; border-radius: 8px; padding: 14px 16px; min-height: 96px; }
.stat-icon { position: absolute; right: 14px; top: 14px; color: #c9953a; opacity: .9; }
.mc-stat span { display: block; font-size: 11px; color: #8a7a68; text-transform: uppercase; letter-spacing: .04em; }
.mc-stat strong { display: block; color: #1a2332; font-size: 21px; margin-top: 4px; }
.mc-stat strong.gold, .discount-gold { color: #c9953a; font-weight: 800; }
.mc-stat small { color: #8a7a68; }
.mc-tabs { display: flex; gap: 0; border-bottom: 2px solid #e8e0d0; overflow-x: auto; }
.mc-tabs button { background: transparent; border: 0; border-bottom: 2px solid transparent; margin-bottom: -2px; padding: 10px 18px; color: #8a7a68; font-weight: 700; cursor: pointer; white-space: nowrap; }
.mc-tabs button.active { color: #c9953a; border-bottom-color: #c9953a; }
.mc-card { background: #fff; border: 1px solid #e8e0d0; border-radius: 8px; overflow: hidden; }
.mc-filter { display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-bottom: 1px solid #e8e0d0; flex-wrap: wrap; }
.mc-filter.compact { padding: 0 0 12px; border-bottom: 0; }
.mc-input, .mc-select, .modal-card input, .modal-card select, .modal-card textarea, .publish-drawer input, .publish-drawer select, .publish-drawer textarea { background: #f5f0e8; border: 1px solid #e0d8cc; border-radius: 8px; padding: 8px 11px; font-size: 12px; color: #1a2332; width: 100%; }
.mc-filter > .mc-input { width: 240px; flex: 0 0 240px; }
.mc-filter > .mc-select { width: auto; min-width: 150px; flex: 0 0 auto; }
.mc-filter > .mc-outline { flex: 0 0 auto; }
.modal-card .mc-filter > .mc-input { width: 220px; flex-basis: 220px; }
.mc-table-wrap { overflow: auto; }
.mc-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 860px; }
.mc-table th { background: #1a2332; color: #d8d3cc; text-align: left; padding: 11px 14px; white-space: nowrap; }
.mc-table td { padding: 11px 14px; border-bottom: 1px solid #f0e8dc; color: #2a3a4a; vertical-align: middle; }
.mc-table tr:hover td { background: #faf6f0; }
.mc-table tr.disabled { opacity: .55; }
.mc-name { font-weight: 700; color: #1a2332; }
.code-badge { background: #f5f0e8; border: 1px solid #e0d5c0; border-radius: 6px; padding: 3px 9px; font: 700 11px/1.4 monospace; color: #1a2332; }
.type-badge { border-radius: 999px; padding: 3px 10px; font-size: 10px; font-weight: 800; }
.type-public { background: #fef3c7; color: #92400e; }
.type-personal { background: #e0e7ff; color: #3730a3; }
.type-marketing { background: #d1fae5; color: #065f46; }
.sent-count { color: #6b7280; }
.status-badge { border-radius: 999px; padding: 3px 10px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.status-badge span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-badge.on { background: #d1fae5; color: #065f46; }
.status-badge.off { background: #f1f0ee; color: #6b7280; }
.status-badge.expired { background: #fee2e2; color: #991b1b; }
.status-badge.scheduled { background: #e0e7ff; color: #3730a3; }
.mc-actions { display: flex; gap: 6px; }
.mc-actions button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e0d8cc; background: #fff; color: #666; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.mc-actions button.publish { background: #c9953a; border-color: #c9953a; color: #fff; }
.mc-actions button.danger:hover { border-color: #ef4444; color: #ef4444; }
.mc-empty { text-align: center; color: #8a7a68; padding: 28px; }
.pagination { border-top: 1px solid #f0e8dc; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; color: #8a7a68; font-size: 11px; }
.pagination button { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e0d8cc; background: #fff; margin-left: 5px; }
.modal-backdrop, .drawer-backdrop { position: fixed; inset: 0; background: rgba(20,30,45,.5); z-index: 80; display: flex; align-items: center; justify-content: center; padding: 18px; }
.picker-layer { z-index: 110; }
.modal-card { width: min(560px, calc(100vw - 24px)); max-height: calc(100vh - 36px); overflow: auto; background: #fff; border-radius: 12px; box-shadow: 0 14px 45px rgba(0,0,0,.18); }
.modal-lg { width: min(820px, calc(100vw - 24px)); }
.modal-card header, .modal-card footer, .publish-drawer header { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0e8dc; gap: 10px; }
.modal-card footer { border-top: 1px solid #f0e8dc; border-bottom: 0; justify-content: flex-end; }
.modal-card h2 { font-size: 18px; color: #1a2332; }
.modal-card em, .publish-drawer em { color: #c9953a; }
.modal-card header button, .publish-drawer header button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #e0d8cc; background: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.modal-body, .drawer-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.modal-card label, .publish-drawer label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-weight: 800; color: #5a4a3a; text-transform: uppercase; letter-spacing: .04em; }
.check-line { flex-direction: row !important; align-items: center; text-transform: none !important; font-size: 13px !important; letter-spacing: 0 !important; }
.check-line input { width: auto; accent-color: #c9953a; }
.section-title { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 800; color: #1a2332; text-transform: uppercase; letter-spacing: .04em; margin-top: 4px; }
.choice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.choice-grid button, .segment-choice button { border: 1.5px solid #e0d8cc; border-radius: 8px; background: #fff; padding: 10px 12px; color: #444; font-weight: 800; cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; }
.choice-grid button.selected, .segment-choice button.selected { border-color: #c9953a; background: #fefaf3; color: #c9953a; }
.choice-grid small, .segment-choice small { color: #8a7a68; font-weight: 500; }
.checkbox-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; }
.user-pick-list { max-height: 230px; overflow: auto; border: 1px solid #e0d8cc; border-radius: 8px; }
.user-pick-list.compact-users { max-height: 180px; }
.user-pick-item { display: grid !important; grid-template-columns: auto 28px 1fr; align-items: center; gap: 8px !important; padding: 9px 12px; border-bottom: 1px solid #f0e8dc; text-transform: none !important; letter-spacing: 0 !important; font-size: 12px !important; }
.user-pick-item:last-child { border-bottom: 0; }
.user-pick-item input { width: auto; }
.user-pick-item span, .prod-thumb { width: 30px; height: 30px; border-radius: 7px; background: #f5f0e8; border: 1px solid #e8e0d0; display: inline-flex; align-items: center; justify-content: center; color: #c9953a; font-weight: 800; }
.user-pick-item small { grid-column: 3; color: #8a7a68; }
.add-product { background: #fff; border: 1.5px dashed #c9953a; color: #c9953a; border-radius: 8px; padding: 10px 14px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
.empty-box { border: 1.5px dashed #e0d8cc; border-radius: 8px; padding: 20px; color: #8a7a68; text-align: center; background: #faf7f2; }
.combo-item-card { display: grid; grid-template-columns: 38px 1fr 64px 32px; gap: 12px; align-items: center; background: #f5f0e8; border: 1px solid #e8e0d0; border-radius: 8px; padding: 9px 12px; }
.combo-item-card small { display: block; color: #8a7a68; margin-top: 2px; }
.combo-item-card label { text-transform: none; letter-spacing: 0; gap: 3px; }
.combo-item-card button { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e0d8cc; background: #fff; cursor: pointer; }
.combo-summary { background: #fefaf3; border: 1px solid #f0dfb8; border-radius: 8px; padding: 11px 14px; display: grid; gap: 6px; }
.combo-summary div { display: flex; justify-content: space-between; }
.combo-summary .save { color: #16a34a; font-weight: 800; border-top: 1px dashed #e0cfa8; padding-top: 8px; }
.picker-table { max-height: 300px; overflow: auto; border: 1px solid #e8e0d0; border-radius: 8px; }
.product-cell { display: flex; align-items: center; gap: 8px; }
.selected-box { border: 1px solid #e8e0d0; border-radius: 8px; background: #faf7f2; padding: 10px; display: grid; gap: 8px; }
.selected-box div { display: grid; grid-template-columns: 1fr 70px; align-items: center; gap: 8px; font-size: 12px; }
.drawer-backdrop { justify-content: flex-end; align-items: stretch; padding: 0; }
.publish-drawer { width: min(400px, 100vw); background: #fff; box-shadow: -8px 0 30px rgba(0,0,0,.13); overflow: auto; }
.segment-choice { display: flex; flex-direction: column; gap: 8px; }
.segment-choice button { flex-direction: row; align-items: center; }
.segment-choice span { display: flex; flex-direction: column; }
.warn-box { background: #fef9ee; border: 1px solid #f5d38a; border-radius: 8px; padding: 11px 13px; color: #92400e; font-size: 12px; }
.mc-toast { position: fixed; right: 22px; bottom: 22px; z-index: 120; background: #1a2332; color: #fff; border-radius: 8px; padding: 10px 14px; box-shadow: 0 10px 28px rgba(0,0,0,.18); }
@media (max-width: 900px) {
  .mc-stats { grid-template-columns: repeat(2, 1fr); }
  .choice-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .mc-stats, .form-row, .checkbox-grid { grid-template-columns: 1fr; }
  .mc-filter > .mc-input, .mc-filter > .mc-select, .mc-filter > .mc-outline { width: 100%; flex: 1 1 100%; }
  .modal-backdrop { align-items: flex-start; padding: 12px; }
  .combo-item-card { grid-template-columns: 34px 1fr; }
  .combo-item-card label, .combo-item-card button { grid-column: 2; }
}
</style>
