export const ADMIN_NAV_SECTIONS = [
  {
    label: 'Tổng quan',
    items: [
      { name: 'admin-dashboard', label: 'Dashboard', icon: 'layoutDashboard' },
      { name: 'admin-stats', label: 'Thống kê', icon: 'chartBar' },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { name: 'admin-users', label: 'Người dùng', icon: 'users', permission: 'ACCOUNT_MANAGE' },
      { name: 'admin-categories', label: 'Danh mục', icon: 'category', permission: 'PRODUCT_MANAGE' },
      { name: 'admin-products', label: 'Sản phẩm', icon: 'armchair', permission: 'PRODUCT_MANAGE' },
      { name: 'admin-orders', label: 'Đơn hàng', icon: 'box', badge: 'orders', badgeTone: 'red', permission: 'ORDER_MANAGE' },
      { name: 'admin-vouchers', label: 'Marketing Center', icon: 'badgePercent', permission: 'VOUCHER_MANAGE' },
      { name: 'admin-inventory', label: 'Kho hàng', icon: 'warehouse', badge: 'inventory', badgeTone: 'red', permission: 'PRODUCT_MANAGE' },
      { name: 'admin-revenue', label: 'Doanh thu', icon: 'banknote', permission: 'ORDER_MANAGE' },
      { name: 'admin-conversations', label: 'Hỗ trợ Chat', icon: 'messageSquare', badge: 'conversations', badgeTone: 'red', permission: 'CUSTOMER_SUPPORT' },
    ],
  },
  {
    label: 'Bảo mật & Hệ thống',
    items: [
      { name: 'admin-roles', label: 'Vai trò & Quyền hạn', icon: 'lock', permission: 'ACCOUNT_MANAGE' },
      { name: 'admin-audit-logs', label: 'Nhật ký thao tác', icon: 'clipboardList' },
      { name: 'admin-my-account', label: 'Trang của tôi', icon: 'userCircle' },
    ],
  },
]

export const ADMIN_PAGE_TITLES = {
  'admin-dashboard': 'Tổng quan <em>Dashboard</em>',
  'admin-stats': 'Thống kê',
  'admin-users': 'Quản lý <em>Người dùng</em>',
  'admin-categories': 'Quản lý <em>Danh mục</em>',
  'admin-products': 'Quản lý <em>Sản phẩm</em>',
  'admin-orders': 'Quản lý <em>Đơn hàng</em>',
  'admin-vouchers': 'Marketing <em>Center</em>',
  'admin-inventory': 'Quản lý <em>Kho hàng</em>',
  'admin-revenue': 'Quản lý <em>Doanh thu</em>',
  'admin-roles': 'Vai trò <em>& Quyền hạn</em>',
  'admin-audit-logs': 'Nhật ký <em>thao tác</em>',
  'admin-my-account': 'Trang <em>của tôi</em>',
  'admin-conversations': 'Hỗ trợ <em>Hội thoại</em>',
}
