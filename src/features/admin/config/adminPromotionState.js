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
  }
}

export function createAdminPromotionModalState() {
  return {
    voucher: false,
    campaign: false,
    combo: false,
    notify: false,
    picker: false,
  }
}

export function createAdminPromotionEditingState() {
  return {
    voucher: null,
    campaign: null,
    combo: null,
    notify: null,
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
    segmentKey: 'VIP',
    channels: ['NOTIFICATION'],
    sendType: 'NOW',
    scheduledAt: '',
    relatedVoucherId: '',
    active: true,
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
