import { expect, test } from '@playwright/test'

test('promotion use-now starts a fresh voucher session and revalidates after cart change', async ({ page }) => {
  const voucher = (code, discountType, discountValue) => ({
    id: code,
    code,
    name: code,
    voucherType: 'PUBLIC',
    discountType,
    discountValue,
    active: true,
    saved: true,
    used: false,
    endDate: '2026-06-29T00:00:00',
  })
  const target = voucher('TARGET', 'FIXED', 10000)
  const best = voucher('BEST', 'FIXED', 20000)
  const shipping = voucher('SHIP', 'SHIPPING_CAP', 30000)
  let cartQty = 1
  const recommendationBodies = []
  let orderPayload = null

  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'e30.eyJpc0FkbWluIjpmYWxzZX0.signature')
    localStorage.setItem('auth_profile', JSON.stringify({ id: 'user-1', email: 'buyer@example.com' }))
    localStorage.setItem('auth_roles', JSON.stringify(['ROLE_CUSTOMER']))
  })

  await page.route('https://api.furnisight.store/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (path.endsWith('/promotions/vouchers/public')) return json({ items: [target], totalPages: 1, totalElements: 1, currentPage: 0, pageSize: 6 })
    if (path.endsWith('/promotions/vouchers/user')) return json([target, best, shipping])
    if (path.endsWith('/promotions/combos')) return json({ items: [], totalPages: 0, totalElements: 0, currentPage: 0, pageSize: 24 })
    if (path.endsWith('/cart/carts') && request.method() === 'GET') return json({ items: [{
      productId: 'product-1', variantId: 'variant-1', name: 'Ghế thử nghiệm', price: 100000,
      quantity: cartQty, stockQuantity: 5,
    }] })
    if (path.includes('/cart/carts/items/') && request.method() === 'PUT') {
      cartQty = JSON.parse(request.postData()).quantity
      return json({ items: [{ productId: 'product-1', variantId: 'variant-1', name: 'Ghế thử nghiệm', price: 100000, quantity: cartQty, stockQuantity: 5 }] })
    }
    if (path.endsWith('/users/profile/addresses')) return json([{ id: 'address-1', fullName: 'Test Buyer', phone: '0900000000', street: '1 Test Street', ward: 'Test Ward', city: 'Test City', isDefault: true }])
    if (path.endsWith('/promotions/vouchers/recommend')) {
      const body = JSON.parse(request.postData())
      recommendationBodies.push(body)
      const chosenShop = body.preferredVoucherCode === 'TARGET' ? target : best
      return json({ shopVoucher: chosenShop, shopDiscount: chosenShop.code === 'TARGET' ? 10000 : 20000, shippingVoucher: shipping, shippingDiscount: 30000 })
    }
    if (path.endsWith('/promotions/vouchers/validate')) {
      const body = JSON.parse(request.postData())
      if (body.code === 'TARGET' && cartQty > 1) return json({ valid: false, discount: 0, message: 'Target invalid after cart change' })
      const selected = body.code === 'SHIP' ? shipping : best
      return json({ valid: true, voucher: selected, discount: body.code === 'SHIP' ? 30000 : 20000 })
    }
    if (path.endsWith('/orders/initiate')) {
      orderPayload = JSON.parse(request.postData())
      return json({ orderCode: 'ORD-TEST-001' })
    }
    return json([])
  })

  await page.goto('/khuyen-mai')
  await page.locator('.voucher-card .claim-btn.outline').first().click()
  await expect(page).toHaveURL(/\/checkout(\?|$)/)
  await expect(page.locator('.co-voucher-code').filter({ hasText: 'TARGET' })).toBeVisible()
  expect(recommendationBodies[0].preferredVoucherCode).toBe('TARGET')

  await page.getByRole('button', { name: 'Tăng' }).click()
  await expect(page.locator('.co-voucher-code').filter({ hasText: 'BEST' })).toBeVisible()
  expect(recommendationBodies.some((body) => !body.preferredVoucherCode)).toBeTruthy()

  await page.getByText('Thanh toán khi nhận hàng (COD)').click()
  await page.getByRole('button', { name: /đặt hàng/i }).click()
  await expect.poll(() => orderPayload).not.toBeNull()
  expect(orderPayload.shopVoucherCode).toBe('BEST')
  expect(orderPayload.shippingVoucherCode).toBe('SHIP')
})
