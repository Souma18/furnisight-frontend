import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@features/auth/store/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@features/product/pages/ProductListPage.vue'),
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
    component: () => import('@features/auth/pages/VerifyEmailPage.vue'),
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
    path: '/room3d',
    name: 'room3d',
    component: () => import('@features/room3d/pages/Room3DPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
