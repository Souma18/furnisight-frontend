export const ADMIN_SIM_USERS = {
  super: {
    id: 'ADM001',
    av: 'AD',
    name: 'Admin Chính',
    role: 'Super Administrator',
    email: 'admin@luxnest.vn',
    roleTag: 'Super Admin',
    rtClass: 'rt-super',
    roleIcon: 'crown',
  },
  manager: {
    id: 'ADM002',
    av: 'MH',
    name: 'Trần Minh Hoàng',
    role: 'Manager',
    email: 'hoang@luxnest.vn',
    roleTag: 'Manager',
    rtClass: 'rt-manager',
    roleIcon: 'shield',
  },
  staff: {
    id: 'ADM003',
    av: 'TH',
    name: 'Nguyễn Thu Hà',
    role: 'Staff',
    email: 'ha@luxnest.vn',
    roleTag: 'Staff',
    rtClass: 'rt-staff',
    roleIcon: 'user',
  },
}

export const ADMIN_NAV_BADGES = {
  users: '1.2K',
  products: '3',
  orders: '8',
}

export const ADMIN_DASHBOARD_MOCK = {
  welcome: {
    revenueLabel: '2.84 tỷ',
    ordersToday: 147,
    users: '1.2K',
  },
  kpis: [
    { key: 'revenue', label: 'Doanh thu tháng', value: '2.84', suffix: 'tỷ', change: '+18.4% so với tháng trước', tone: 'gold', up: true, icon: 'banknote' },
    { key: 'orders', label: 'Đơn hàng hôm nay', value: '147', change: '+23 so với hôm qua', tone: 'blue', up: true, icon: 'box' },
    { key: 'users', label: 'Người dùng mới', value: '312', change: '+12% tuần này', tone: 'green', up: true, icon: 'user' },
    { key: 'stock', label: 'Sắp hết hàng', value: '8', change: 'Cần bổ sung ngay', tone: 'red', up: false, icon: 'alert' },
  ],
  recentOrders: [
    { id: 'LX-0892', customer: 'Nguyễn Văn A', total: '12.5tr', status: 'shipping', statusLabel: 'Đang giao' },
    { id: 'LX-0891', customer: 'Trần Thị B', total: '8.2tr', status: 'success', statusLabel: 'Hoàn thành' },
    { id: 'LX-0890', customer: 'Lê Minh C', total: '24.1tr', status: 'pending', statusLabel: 'Chờ xác nhận' },
    { id: 'LX-0889', customer: 'Phạm Thu D', total: '6.8tr', status: 'success', statusLabel: 'Hoàn thành' },
    { id: 'LX-0888', customer: 'Hoàng Văn E', total: '3.4tr', status: 'cancel', statusLabel: 'Đã hủy' },
  ],
  lowStock: [
    { name: 'Giường Walnut 1m6', category: 'Phòng ngủ', stock: 3, level: 'low' },
    { name: 'Ghế Ergonomic Pro', category: 'Văn phòng', stock: 5, level: 'low' },
    { name: 'Sofa Nordic 3 chỗ', category: 'Phòng khách', stock: 0, level: 'empty' },
    { name: 'Đèn Nordic Brass', category: 'Đèn', stock: 7, level: 'low' },
    { name: 'Bàn Ăn Sồi 6 ghế', category: 'Phòng ăn', stock: 0, level: 'empty' },
  ],
  alerts: [
    { tone: 'warn', icon: 'box', title: '8 sản phẩm sắp hết hàng', desc: 'Cần bổ sung trong 3–5 ngày để tránh gián đoạn đơn hàng.' },
    { tone: 'danger', icon: 'clock3', title: '3 đơn hàng chờ > 24h', desc: 'Đơn #0888, #0886, #0883 chưa xử lý. Cần kiểm tra ngay.' },
    { tone: 'info', icon: 'sparkles', title: 'Báo cáo tháng 4 sẵn sàng', desc: 'Doanh thu tháng 4 đã được tổng hợp. Nhấn xem chi tiết.' },
  ],
  revenueChart: {
    labels: ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '31'],
    data: [82, 95, 88, 120, 105, 145, 138, 160, 142, 175, 190],
  },
  orderChart: {
    labels: ['Hoàn thành', 'Đang giao', 'Chờ xác nhận', 'Đã hủy'],
    data: [68, 18, 9, 5],
  },
}

export const ADMIN_USERS_MOCK = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901 234 567', role: 'Khách hàng', orders: 8, status: 'active', statusLabel: 'Hoạt động', createdAt: '01/01/2025', av: 'NA', avTone: 'gold' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912 345 678', role: 'Khách hàng', orders: 14, status: 'active', statusLabel: 'Hoạt động', createdAt: '15/01/2025', av: 'TT', avTone: 'blue' },
  { id: 3, name: 'Lê Minh C', email: 'leminhc@gmail.com', phone: '0923 456 789', role: 'Admin', orders: 2, status: 'active', statusLabel: 'Hoạt động', createdAt: '20/01/2025', av: 'LM', avTone: 'green' },
  { id: 4, name: 'Phạm Thu D', email: 'phamthud@gmail.com', phone: '0934 567 890', role: 'Khách hàng', orders: 3, status: 'locked', statusLabel: 'Đã khóa', createdAt: '05/02/2025', av: 'PT', avTone: 'purple' },
]

export const ADMIN_CATEGORIES_MOCK = [
  { id: 1, name: 'Phòng ngủ', slug: 'phong-ngu', iconId: 'house', productCount: 87, visible: true, visibleLabel: 'Hiển thị', createdAt: '01/01/2025' },
  { id: 2, name: 'Phòng khách', slug: 'phong-khach', iconId: 'house', productCount: 64, visible: true, visibleLabel: 'Hiển thị', createdAt: '01/01/2025' },
  { id: 3, name: 'Nhà bếp', slug: 'nha-bep', iconId: 'box', productCount: 42, visible: true, visibleLabel: 'Hiển thị', createdAt: '01/01/2025' },
  { id: 4, name: 'Văn phòng', slug: 'van-phong', iconId: 'store', productCount: 38, visible: false, visibleLabel: 'Ẩn', createdAt: '10/01/2025' },
  { id: 5, name: 'Đèn trang trí', slug: 'den-trang-tri', iconId: 'sparkles', productCount: 31, visible: true, visibleLabel: 'Hiển thị', createdAt: '15/01/2025' },
]

export const ADMIN_PRODUCTS_MOCK = [
  { id: 1, name: 'Giường Walnut Premium', sku: 'LX-BED-001', category: 'Phòng ngủ', price: 12500000, stock: 3, status: 'low', statusLabel: 'Sắp hết', icon: 'box' },
  { id: 2, name: 'Sofa Nordic 3 chỗ', sku: 'LX-SOF-012', category: 'Phòng khách', price: 8500000, stock: 0, status: 'cancel', statusLabel: 'Hết hàng', icon: 'box' },
  { id: 3, name: 'Ghế Ergonomic Pro', sku: 'LX-CHR-008', category: 'Văn phòng', price: 4200000, stock: 5, status: 'low', statusLabel: 'Sắp hết', icon: 'box' },
  { id: 4, name: 'Đèn Nordic Brass', sku: 'LX-LMP-021', category: 'Đèn trang trí', price: 1800000, stock: 24, status: 'success', statusLabel: 'Còn hàng', icon: 'sparkles' },
]

export const ADMIN_ORDERS_MOCK = [
  { id: 'LX-0892', customer: 'Nguyễn Văn A', items: 3, total: 12500000, status: 'shipping', statusLabel: 'Đang giao', date: '20/05/2026' },
  { id: 'LX-0891', customer: 'Trần Thị B', items: 1, total: 8200000, status: 'success', statusLabel: 'Hoàn thành', date: '19/05/2026' },
  { id: 'LX-0890', customer: 'Lê Minh C', items: 5, total: 24100000, status: 'pending', statusLabel: 'Chờ xác nhận', date: '19/05/2026' },
]

export const ADMIN_ROLES_MOCK = {
  roles: [
    { id: 'super', name: 'Super Admin', tagClass: 'rt-super', icon: 'crown', perms: ['view', 'create', 'edit', 'delete', 'config'], userCount: 1, note: 'Toàn quyền hệ thống', system: true },
    { id: 'manager', name: 'Manager', tagClass: 'rt-manager', icon: 'shield', perms: ['view', 'create', 'edit'], userCount: 3, note: 'Không có quyền xóa', system: false },
    { id: 'staff', name: 'Staff', tagClass: 'rt-staff', icon: 'user', perms: ['view'], userCount: 8, note: 'Chỉ xem', system: false },
  ],
  adminAccounts: [
    { id: 1, name: 'Admin Chính', email: 'admin@luxnest.vn', av: 'AD', avTone: 'gold', role: 'Super Admin', tagClass: 'rt-super', roleIcon: 'crown', perms: ['view', 'create', 'edit', 'delete'], createdAt: '01/01/2024', status: 'active', statusLabel: 'Hoạt động' },
    { id: 2, name: 'Trần Minh Hoàng', email: 'hoang@luxnest.vn', av: 'MH', avTone: 'blue', role: 'Manager', tagClass: 'rt-manager', roleIcon: 'shield', perms: ['view', 'create', 'edit'], createdAt: '15/03/2024', status: 'active', statusLabel: 'Hoạt động' },
    { id: 3, name: 'Nguyễn Thu Hà', email: 'ha@luxnest.vn', av: 'TH', avTone: 'green', role: 'Staff', tagClass: 'rt-staff', roleIcon: 'user', perms: ['view'], createdAt: '01/06/2024', status: 'active', statusLabel: 'Hoạt động' },
  ],
  matrix: [
    { feature: 'Dashboard', super: 'Đầy đủ', manager: 'Đầy đủ', staff: 'Xem' },
    { feature: 'Người dùng', super: 'CRUD', manager: 'CR+U', staff: 'Không' },
    { feature: 'Sản phẩm', super: 'CRUD', manager: 'CRUD', staff: 'Xem' },
    { feature: 'Đơn hàng', super: 'CRUD', manager: 'CRUD', staff: 'Xem+U' },
    { feature: 'Phân quyền', super: 'CRUD', manager: 'Không', staff: 'Không' },
  ],
}

export const ADMIN_INVENTORY_MOCK = {
  kpis: [
    { label: 'Tổng SKU', value: '248', tone: 'green', icon: 'warehouse' },
    { label: 'Còn hàng', value: '231', tone: 'gold', icon: 'check' },
    { label: 'Sắp hết', value: '8', tone: 'red', icon: 'alert' },
    { label: 'Hết hàng', value: '9', tone: 'red', icon: 'ban' },
  ],
  items: [
    { id: 1, sku: 'LX-BED-001', name: 'Giường Walnut Premium', category: 'Phòng ngủ', stock: 3, threshold: 10, lastImport: '01/04/2025', exportMonth: 28, stockPercent: 15, stockClass: 'sf-low', status: 'low', statusLabel: 'Sắp hết' },
    { id: 2, sku: 'LX-SFA-002', name: 'Sofa Nordic 3 chỗ', category: 'Phòng khách', stock: 0, threshold: 5, lastImport: '15/03/2025', exportMonth: 12, stockPercent: 0, stockClass: 'sf-empty', status: 'cancel', statusLabel: 'Hết hàng' },
    { id: 3, sku: 'LX-CHR-003', name: 'Ghế Ergonomic ProFlex', category: 'Văn phòng', stock: 47, threshold: 15, lastImport: '10/05/2025', exportMonth: 38, stockPercent: 75, stockClass: 'sf-ok', status: 'success', statusLabel: 'Đủ hàng' },
    { id: 4, sku: 'LX-LMP-004', name: 'Đèn Nordic Brass Edition', category: 'Đèn trang trí', stock: 24, threshold: 10, lastImport: '02/05/2025', exportMonth: 14, stockPercent: 60, stockClass: 'sf-ok', status: 'success', statusLabel: 'Đủ hàng' },
  ],
  total: 248,
}

export const ADMIN_PERMISSION_OPTIONS = [
  { id: 'dashboard', label: 'Xem Dashboard' },
  { id: 'product_create', label: 'Tạo sản phẩm' },
  { id: 'product_edit', label: 'Sửa sản phẩm' },
  { id: 'product_delete', label: 'Xóa sản phẩm' },
  { id: 'order_view', label: 'Xem đơn hàng' },
  { id: 'order_update', label: 'Cập nhật đơn' },
  { id: 'user_view', label: 'Xem người dùng' },
  { id: 'inventory', label: 'Quản lý kho' },
  { id: 'reports', label: 'Xem báo cáo' },
]

export const ADMIN_AUDIT_LOGS_MOCK = [
  { id: 1, type: 'login', result: 'success', action: 'Đăng nhập hệ thống thành công', detail: 'Tài khoản Admin Chính (ADM001) đăng nhập từ Chrome · Windows 11', user: 'Admin Chính', time: '09:22:14 · 20/05/2026', meta: 'IP: 118.70.xx.xx · TP. Hồ Chí Minh', tone: 'success', status: 'Thành công' },
  { id: 2, type: 'update', result: 'success', action: 'Cập nhật quyền tài khoản Manager', detail: 'Admin Chính đã thêm quyền Tạo sản phẩm cho Trần Minh Hoàng (ADM002)', user: 'Admin Chính', time: '09:15:02 · 20/05/2026', meta: 'ADM001 · Module: Phân quyền', tone: 'warn', status: 'Thành công' },
  { id: 3, type: 'delete', result: 'error', action: 'Xóa sản phẩm thất bại — không đủ quyền', detail: 'Nguyễn Thu Hà (ADM003) cố xóa Giường Walnut Premium nhưng Staff không có DELETE', user: 'Nguyễn Thu Hà', time: '08:54:33 · 20/05/2026', meta: 'ADM003 · Module: Sản phẩm', tone: 'danger', status: 'Bị từ chối' },
  { id: 4, type: 'create', result: 'success', action: 'Tạo đơn hàng mới #LX-2026-0948', detail: 'Trần Minh Hoàng tạo đơn mới tổng 21.400.000đ cho khách Nguyễn Văn A', user: 'Trần Minh Hoàng', time: '08:31:05 · 20/05/2026', meta: 'ADM002 · Module: Đơn hàng', tone: 'success', status: 'Thành công' },
  { id: 5, type: 'login', result: 'error', action: 'Đăng nhập thất bại liên tiếp 3 lần', detail: 'IP 14.161.xx.xx thử đăng nhập sai vào admin@luxnest.vn. Tài khoản khóa tạm 15 phút.', user: 'Hệ thống', time: '07:12:48 · 20/05/2026', meta: 'Cảnh báo bảo mật · Hà Nội', tone: 'danger', status: 'Nguy hiểm' },
  { id: 6, type: 'update', result: 'success', action: 'Cập nhật tồn kho sản phẩm', detail: 'Trần Minh Hoàng nhập thêm 50 đơn vị Ghế Ergonomic ProFlex vào kho HCM', user: 'Trần Minh Hoàng', time: '06:58:22 · 20/05/2026', meta: 'ADM002 · Module: Kho hàng', tone: 'success', status: 'Thành công' },
]

export const ADMIN_PROFILE_MOCK = {
  id: 'ADM001',
  name: 'Admin Chính',
  email: 'admin@luxnest.vn',
  phone: '0901 000 001',
  birthDate: '1990-01-01',
  role: 'Super Administrator',
  status: 'Đang hoạt động',
  createdAt: '01/01/2024',
  lastLogin: '20/05/2026 09:22',
  lastIp: '118.70.xx.xx',
  device: 'Chrome · Windows',
  twoFa: true,
}
