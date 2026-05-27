import { ADMIN_ICON_OPTIONS } from '../mock/adminIconMock'
import {
  ADMIN_AUDIT_LOGS_MOCK,
  ADMIN_CATEGORIES_MOCK,
  ADMIN_DASHBOARD_MOCK,
  ADMIN_INVENTORY_MOCK,
  ADMIN_ORDERS_MOCK,
  ADMIN_PRODUCTS_MOCK,
  ADMIN_PROFILE_MOCK,
  ADMIN_ROLES_MOCK,
  ADMIN_USERS_MOCK,
} from '../mock/adminSeedMock'
import { TEMPLATES as MESSAGE_TEMPLATES_SEED } from '../mock/adminConversationMock'

function sleep(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ok(data) {
  return { data }
}

function fail(message) {
  const error = new Error(message)
  error.response = { data: { message } }
  throw error
}

let categories = [...ADMIN_CATEGORIES_MOCK]
let products = [...ADMIN_PRODUCTS_MOCK]
let users = [...ADMIN_USERS_MOCK]
let orders = [...ADMIN_ORDERS_MOCK]
let messageTemplates = MESSAGE_TEMPLATES_SEED.map((t) => ({ ...t }))

export async function fetchDashboardMock() {
  await sleep()
  return ok(ADMIN_DASHBOARD_MOCK)
}

export async function fetchAdminUsersMock() {
  await sleep()
  return ok({ items: users, total: 1243 })
}

export async function createAdminUserMock(payload) {
  await sleep()
  users = [{ id: Date.now(), ...payload, status: 'active', statusLabel: 'Hoạt động', orders: 0, av: 'NV', avTone: 'gold' }, ...users]
  return ok({ item: users[0] })
}

export async function fetchCategoriesMock() {
  await sleep()
  return ok({ items: categories })
}

export async function fetchCategoryIconOptionsMock() {
  await sleep(120)
  return ok({ items: ADMIN_ICON_OPTIONS })
}

export async function createCategoryMock(payload) {
  await sleep()
  const item = {
    id: Date.now(),
    productCount: 0,
    visible: payload.visible !== false,
    visibleLabel: payload.visible !== false ? 'Hiển thị' : 'Ẩn',
    createdAt: new Date().toLocaleDateString('vi-VN'),
    ...payload,
  }
  categories = [item, ...categories]
  return ok({ item })
}

export async function updateCategoryMock(id, payload) {
  await sleep()
  categories = categories.map((c) => (c.id === id ? { ...c, ...payload, visibleLabel: payload.visible !== false ? 'Hiển thị' : 'Ẩn' } : c))
  return ok({ item: categories.find((c) => c.id === id) })
}

export async function deleteCategoryMock(id) {
  await sleep()
  categories = categories.filter((c) => c.id !== id)
  return ok({ success: true })
}

export async function fetchProductsMock() {
  await sleep()
  return ok({ items: products })
}

export async function uploadProductModelMock(file) {
  await sleep(400)
  if (!file) fail('Vui lòng chọn file model 3D.')
  return ok({
    model3dUrl: `/uploads/models/${file.name}`,
    model3dFileName: file.name,
    model3dSize: file.size,
  })
}

export async function createProductMock(payload) {
  await sleep()
  const item = {
    id: Date.now(),
    status: payload.stock > 0 ? 'success' : 'cancel',
    statusLabel: payload.stock > 0 ? 'Còn hàng' : 'Hết hàng',
    icon: 'box',
    ...payload,
  }
  products = [item, ...products]
  return ok({ item })
}

export async function updateProductMock(id, payload) {
  await sleep()
  products = products.map((p) => (p.id === id ? { ...p, ...payload } : p))
  return ok({ item: products.find((p) => p.id === id) })
}

export async function fetchOrdersMock() {
  await sleep()
  return ok({ items: orders })
}

export async function updateOrderMock(id, payload) {
  await sleep()
  orders = orders.map((o) => (o.id === id ? { ...o, ...payload } : o))
  return ok({ item: orders.find((o) => o.id === id) })
}

export async function fetchInventoryMock() {
  await sleep()
  return ok(ADMIN_INVENTORY_MOCK)
}

export async function fetchRevenueMock() {
  await sleep()
  return ok({
    kpis: [
      { label: 'Doanh thu tháng 5', value: '2.84', suffix: 'tỷ', change: '+18.4% MoM', tone: 'gold', up: true, icon: 'banknote' },
      { label: 'Lợi nhuận gộp', value: '38', suffix: '%', change: '+2.1pp', tone: 'green', up: true, icon: 'chartBar' },
      { label: 'AOV trung bình', value: '19.3', suffix: 'tr', change: '+5.2%', tone: 'blue', up: true, icon: 'box' },
    ],
    monthLabels: ['T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T1', 'T2', 'T3', 'T4', 'T5'],
    monthData: [1.2, 1.4, 1.3, 1.6, 1.8, 2.1, 2.4, 1.9, 2.0, 2.2, 2.4, 2.84],
    categoryLabels: ['Phòng ngủ', 'Phòng khách', 'Văn phòng', 'Đèn', 'Khác'],
    categoryData: [38, 27, 18, 11, 6],
    monthlyRows: [
      { month: 'T5/2026', orders: '1.247', revenue: '2.840.000.000đ', mom: '▲ +18.4%', momClass: 'up', profit: '1.079.200.000đ (38%)', refund: '−42.600.000đ' },
      { month: 'T4/2026', orders: '1.089', revenue: '2.398.000.000đ', mom: '▲ +9.2%', momClass: 'up', profit: '887.260.000đ (37%)', refund: '−35.970.000đ' },
      { month: 'T3/2026', orders: '987', revenue: '2.196.000.000đ', mom: '▼ −3.1%', momClass: 'down', profit: '791.560.000đ (36%)', refund: '−29.400.000đ' },
    ],
  })
}

export async function fetchStatsMock() {
  await sleep()
  return ok({
    kpis: [
      { label: 'Tổng doanh thu YTD', value: '12.4', suffix: 'tỷ', change: '+24% so với 2025', tone: 'gold', up: true, icon: 'banknote' },
      { label: 'Tổng đơn hàng', value: '4.821', change: '+31% so với 2025', tone: 'blue', up: true, icon: 'box' },
      { label: 'Tổng người dùng', value: '1.243', change: '+18% so với 2025', tone: 'green', up: true, icon: 'user' },
      { label: 'Tỷ lệ hoàn trả', value: '1.8', suffix: '%', change: '−0.3pp cải thiện', tone: 'purple', up: true, icon: 'refresh' },
    ],
    userLabels: ['T1', 'T2', 'T3', 'T4', 'T5'],
    userData: [210, 185, 230, 276, 312],
    categoryLabels: ['Phòng ngủ', 'Phòng khách', 'Văn phòng', 'Đèn', 'Khác'],
    categoryData: [38, 27, 18, 11, 6],
  })
}

export async function fetchRolesMock() {
  await sleep()
  return ok(ADMIN_ROLES_MOCK)
}

export async function fetchAuditLogsMock(params = {}) {
  await sleep()
  const { search = '', type = '', result = '', page = 1, pageSize = 20 } = params
  let items = [...ADMIN_AUDIT_LOGS_MOCK]
  const q = search.trim().toLowerCase()
  if (q) {
    items = items.filter(
      (row) =>
        row.action.toLowerCase().includes(q) ||
        row.detail.toLowerCase().includes(q) ||
        row.user.toLowerCase().includes(q) ||
        row.meta?.toLowerCase().includes(q),
    )
  }
  if (type && type !== 'all') items = items.filter((row) => row.type === type)
  if (result && result !== 'all') items = items.filter((row) => row.result === result)
  const total = 1847
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)
  return ok({ items: paged, total, page, pageSize })
}

export async function fetchAdminProfileMock() {
  await sleep()
  return ok(ADMIN_PROFILE_MOCK)
}

export async function updateAdminProfileMock(payload) {
  await sleep()
  return ok({ ...ADMIN_PROFILE_MOCK, ...payload })
}

export async function changeAdminPasswordMock({ currentPassword, newPassword, confirmPassword }) {
  await sleep()
  if (!currentPassword || !newPassword) fail('Vui lòng nhập đầy đủ mật khẩu.')
  if (newPassword.length < 8) fail('Mật khẩu mới tối thiểu 8 ký tự.')
  if (newPassword !== confirmPassword) fail('Xác nhận mật khẩu không khớp.')
  if (currentPassword !== 'Admin@123') fail('Mật khẩu hiện tại không đúng.')
  return ok({ success: true })
}

// ==== Message Templates (mock /api/message-templates) ====
// TODO(BE): Replace these with real /api/message-templates endpoints when backend ready.
export async function fetchMessageTemplatesMock() {
  await sleep(150)
  return ok({ items: messageTemplates.map((t) => ({ ...t })) })
}

export async function createMessageTemplateMock(payload) {
  await sleep(150)
  const title = String(payload?.title || '').trim()
  const content = String(payload?.content || '').trim()
  if (!title) fail('Tiêu đề template không được trống.')
  if (!content) fail('Nội dung template không được trống.')

  const created = {
    id: Date.now(),
    title,
    content,
    category: payload?.category || 'GREETING',
    active: payload?.active !== false,
  }
  messageTemplates = [created, ...messageTemplates]
  return ok({ ...created })
}

export async function updateMessageTemplateMock(id, payload) {
  await sleep(150)
  const idx = messageTemplates.findIndex((t) => t.id === id)
  if (idx === -1) fail('Không tìm thấy template.')
  const merged = { ...messageTemplates[idx], ...payload, id }
  messageTemplates[idx] = merged
  return ok({ ...merged })
}

export async function deleteMessageTemplateMock(id) {
  await sleep(150)
  const before = messageTemplates.length
  messageTemplates = messageTemplates.filter((t) => t.id !== id)
  if (messageTemplates.length === before) fail('Không tìm thấy template để xóa.')
  return ok({ success: true })
}
