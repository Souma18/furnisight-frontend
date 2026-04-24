import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/cart',
    name: 'cart',
    component: () => import('@features/cart/pages/CartPage.vue'),
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@features/account/pages/AccountPage.vue'),
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

export default router
