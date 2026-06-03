import { createRouter, createWebHistory } from 'vue-router'
import { pinia } from '../plugins/pinia'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@features/home/pages/HomePage.vue'),
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@features/product/pages/ProductListPage.vue'),
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('@features/product/pages/ProductDetailPage.vue'),
    props: true,
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@features/contact/pages/ContactPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@features/auth/pages/LoginPage.vue'),
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@features/auth/pages/OAuthCallbackPage.vue'),
  },
  {
    path: '/auth/verify',
    name: 'auth-verify',
    redirect: to => ({ path: '/', query: to.query })
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@features/cart/pages/CartPage.vue'),
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@features/account/pages/AccountPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@features/checkout/pages/CheckoutPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/payment/callback',
    alias: ['/payment/callback'],
    name: 'payment-callback',
    component: () => import('@features/checkout/pages/PaymentCallbackPage.vue'),
  },
  {
    path: '/payment/success',
    name: 'payment-success',
    component: () => import('@features/checkout/pages/PaymentCallbackPage.vue'),
  },
  {
    path: '/payment/failure',
    name: 'payment-failure',
    component: () => import('@features/checkout/pages/PaymentCallbackPage.vue'),
  },
  {
    path: '/room3d',
    name: 'room3d',
    component: () => import('@features/room3d/pages/Room3DPage.vue'),
  },
  {
    path: '/admin',
    component: () => import('@features/admin/pages/AdminLayoutPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: { name: 'admin-dashboard' } },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@features/admin/pages/views/AdminDashboardPage.vue') },
      { path: 'stats', name: 'admin-stats', component: () => import('@features/admin/pages/views/AdminStatsPage.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@features/admin/pages/views/AdminUsersPage.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@features/admin/pages/views/AdminCategoriesPage.vue') },
      { path: 'products', name: 'admin-products', component: () => import('@features/admin/pages/views/AdminProductsPage.vue') },
      { path: 'orders', name: 'admin-orders', component: () => import('@features/admin/pages/views/AdminOrdersPage.vue') },
      { path: 'orders/:orderCode', name: 'admin-order-detail', component: () => import('@features/admin/pages/views/AdminOrderDetailPage.vue'), props: true },
      { path: 'vouchers', name: 'admin-vouchers', component: () => import('@features/admin/pages/views/AdminVouchersPage.vue') },
      { path: 'inventory', name: 'admin-inventory', component: () => import('@features/admin/pages/views/AdminInventoryPage.vue') },
      { path: 'revenue', name: 'admin-revenue', component: () => import('@features/admin/pages/views/AdminRevenuePage.vue') },
      { path: 'roles', name: 'admin-roles', component: () => import('@features/admin/pages/views/AdminRolesPage.vue') },
      { path: 'audit-logs', name: 'admin-audit-logs', component: () => import('@features/admin/pages/views/AdminAuditLogsPage.vue') },
      { path: 'my-account', name: 'admin-my-account', component: () => import('@features/admin/pages/views/AdminMyAccountPage.vue') },
      { path: 'conversations', name: 'admin-conversations', component: () => import('@features/admin/pages/views/AdminConversationsPage.vue') },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0, behavior: 'auto' }
  },
})


router.beforeEach(async (to, from, next) => {
  // Lazy load store to avoid circular dependency on startup
  const { useAuthStore } = await import('@features/auth/store/authStore')
  const authStore = useAuthStore(pinia)
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    next(authStore.isAdmin ? { name: 'admin-dashboard' } : { name: 'home' })
    return
  }

  next()
})

export default router
