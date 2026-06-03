export const CHECKOUT_BREADCRUMB = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giỏ hàng', to: '/account?view=cart' },
  { label: 'Thanh toán' },
]

export const CHECKOUT_STEPS = [
  { id: 'cart', label: 'Giỏ hàng', status: 'done', to: '/account?view=cart' },
  { id: 'checkout', label: 'Thanh toán', status: 'active' },
  { id: 'done', label: 'Hoàn tất', status: 'pending' },
]

export const CHECKOUT_SHOP = {
  name: 'LUXNEST Official Store',
  icon: 'store',
}
