import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'

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
      { path: 'inventory', name: 'admin-inventory', component: () => import('@features/admin/pages/views/AdminInventoryPage.vue') },
      { path: 'revenue', name: 'admin-revenue', component: () => import('@features/admin/pages/views/AdminRevenuePage.vue') },
      { path: 'roles', name: 'admin-roles', component: () => import('@features/admin/pages/views/AdminRolesPage.vue') },
      { path: 'audit-logs', name: 'admin-audit-logs', component: () => import('@features/admin/pages/views/AdminAuditLogsPage.vue') },
      { path: 'my-account', name: 'admin-my-account', component: () => import('@features/admin/pages/views/AdminMyAccountPage.vue') },
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (requiresAdmin && !authStore.isAdmin) {
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
