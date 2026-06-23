export const PROMOTION_SEGMENTS = Object.freeze([
  { value: 'NEW_USERS', label: 'Khách mới đăng ký' },
  { value: 'ABANDONED_CART', label: 'Giỏ hàng chưa checkout' },
  { value: 'INACTIVE_30D', label: 'Chưa mua hàng 30 ngày' },
])

export const PROMOTION_CHANNELS = Object.freeze(['NOTIFICATION', 'EMAIL'])

const PROMOTION_SEGMENT_KEYS = new Set(PROMOTION_SEGMENTS.map((segment) => segment.value))
const PROMOTION_CHANNEL_KEYS = new Set(PROMOTION_CHANNELS)

export function normalizePromotionSegment(value) {
  return PROMOTION_SEGMENT_KEYS.has(value) ? value : PROMOTION_SEGMENTS[0].value
}

export function sanitizePromotionChannels(channels) {
  if (!Array.isArray(channels)) return []
  return [...new Set(channels.filter((channel) => PROMOTION_CHANNEL_KEYS.has(channel)))]
}

export function createAdminPromotionStats() {
  return {
    totalVouchers: 0,
    activeVouchers: 0,
    issuedCount: 0,
    campaignCount: 0,
    runningCampaignCount: 0,
    activeCombos: 0,
    comboUsedCount: 0,
  }
}

export function createAdminPromotionFilters() {
  return {
    voucher: { query: '', type: '', status: '' },
    campaign: { query: '', status: '' },
    combo: { query: '', status: '' },
    notify: { query: '', status: '' },
    template: { query: '', type: '' },
  }
}

export function createAdminPromotionModalState() {
  return {
    voucher: false,
    campaign: false,
    combo: false,
    notify: false,
    template: false,
    previewTemplate: false,
    unlayer: false,
    picker: false,
  }
}

export function createAdminPromotionEditingState() {
  return {
    voucher: null,
    campaign: null,
    combo: null,
    notify: null,
    template: null,
    previewTemplate: null,
  }
}

export function createVoucherPublishState() {
  return {
    voucher: null,
    segment: 'one',
    selectedUserIds: [],
    userQuery: '',
    segmentKey: 'NEW_USERS',
    channels: ['NOTIFICATION', 'EMAIL'],
    sendOption: 'NOW',
    title: '',
    body: '',
  }
}

export function createVoucherFormState() {
  return {
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
  }
}

export function createCampaignFormState() {
  return {
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
  }
}

export function createComboFormState() {
  return {
    name: '',
    description: '',
    imageMediaId: '',
    imageUrl: '',
    imageUpload: null,
    discountType: 'PERCENTAGE',
    discountValue: 15,
    startDate: '',
    endDate: '',
    active: true,
    items: [],
  }
}

export function createNotifyFormState() {
  return {
    title: '',
    body: '',
    targetType: 'ALL',
    targetUserIds: [],
    segmentKey: 'NEW_USERS',
    channels: ['NOTIFICATION'],
    sendType: 'NOW',
    scheduledAt: '',
    relatedVoucherId: '',
    active: true,
  }
}

export function createTemplateFormState() {
  return {
    code: '',
    name: '',
    titleTemplate: '',
    bodyTemplate: '',
  }
}

export function createProductPickerState() {
  return {
    query: '',
    category: '',
    status: '',
    stock: '',
    selected: {},
  }
}
