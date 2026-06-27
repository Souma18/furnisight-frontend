import { isPromotionRecipient, mapPromotionRecipient } from './src/features/admin/utils/adminPromotionRecipients.js'

const users = [
  { id: 'customer-1', name: 'Nguyễn Khách Hàng', email: 'customer@example.com', role: 'CUSTOMER' },
  { id: 'admin-1', name: 'Quản Trị Viên', email: 'admin@example.com', role: 'ADMIN' },
  { id: 'staff-1', name: 'Nhân Viên', email: 'staff@example.com', roles: ['ROLE_STAFF'] },
]

console.log(users.filter(isPromotionRecipient).map(mapPromotionRecipient))
