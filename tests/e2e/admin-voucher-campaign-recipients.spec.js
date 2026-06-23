import { expect, test } from '@playwright/test'

test('admin voucher campaigns only target customers and send through selected channels', async ({ page }) => {
  const voucher = {
    id: 'voucher-1',
    code: 'WELCOME10',
    name: 'Ưu đãi khách mới',
    voucherType: 'MARKETING',
    discountType: 'PERCENT',
    discountValue: 10,
    active: true,
  }
  const users = [
    { id: 'customer-1', name: 'Nguyễn Khách Hàng', email: 'customer@example.com', role: 'CUSTOMER' },
    { id: 'admin-1', name: 'Quản Trị Viên', email: 'admin@example.com', role: 'ADMIN' },
    { id: 'staff-1', name: 'Nhân Viên', email: 'staff@example.com', roles: ['ROLE_STAFF'] },
  ]
  let usersRequestUrl = ''
  let publishPayload = null
  let campaignPayload = null

  await page.addInitScript(() => {
    localStorage.setItem(
      'access_token',
      'e30.eyJpc0FkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJWT1VDSEVSX01BTkFHRSJdfQ.signature',
    )
    localStorage.setItem('auth_profile', JSON.stringify({
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    }))
    localStorage.setItem('auth_roles', JSON.stringify(['ROLE_ADMIN']))
  })

  await page.route('https://api.furnisight.store/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const json = (body) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })

    if (path === '/admin/users') {
      usersRequestUrl = request.url()
      return json({ items: users })
    }
    if (path === '/admin/vouchers/stats') return json({})
    if (path === '/admin/vouchers' && request.method() === 'GET') return json({ items: [voucher] })
    if (path === '/admin/vouchers/voucher-1/publish') {
      publishPayload = JSON.parse(request.postData())
      return json({ success: true })
    }
    if (path === '/admin/marketing/campaigns' && request.method() === 'POST') {
      campaignPayload = JSON.parse(request.postData())
      return json({ success: true })
    }
    if (path.startsWith('/admin/marketing/')) return json({ items: [] })
    if (path === '/admin/products') return json({ items: [] })
    if (path === '/admin/orders' || path === '/admin/inventory') return json({ items: [] })
    if (path.includes('/conversation/admin/inbox')) return json({ items: [] })
    return json([])
  })

  await page.goto('/admin/vouchers')
  await expect(page.locator('.marketing-center')).toBeVisible()
  await expect.poll(() => usersRequestUrl).toContain('scope=CUSTOMER')

  await page.getByTitle('Phát hành').click()
  const drawer = page.locator('.publish-drawer')
  await expect(drawer.getByText('Nguyễn Khách Hàng')).toBeVisible()
  await expect(drawer.getByText('Quản Trị Viên')).toHaveCount(0)
  await expect(drawer.getByText('Nhân Viên')).toHaveCount(0)

  await drawer.locator('input[value="EMAIL"]').uncheck()
  await drawer.getByRole('button', { name: /Xác nhận phát hành/i }).click()
  await expect.poll(() => publishPayload).not.toBeNull()
  expect(publishPayload).toMatchObject({
    targetType: 'MANUAL',
    targetUserIds: ['customer-1'],
    segmentKey: null,
    channels: ['NOTIFICATION'],
  })
  expect(publishPayload).not.toHaveProperty('email')
  expect(publishPayload).not.toHaveProperty('emails')

  await page.getByRole('button', { name: 'Chiến dịch Voucher', exact: true }).click()
  await page.getByRole('button', { name: /Tạo chiến dịch/i }).click()
  const modal = page.locator('form.modal-backdrop')

  await modal.getByRole('button', { name: /Theo điều kiện/ }).click()
  const segmentSelect = modal.getByLabel('Nhóm người dùng')
  await expect(segmentSelect.locator('option')).toHaveText([
    'Khách mới đăng ký',
    'Giỏ hàng chưa checkout',
    'Chưa mua hàng 30 ngày',
  ])
  await modal.getByRole('button', { name: /Chọn thủ công/ }).click()
  await modal.getByLabel('Tên chiến dịch *').fill('Campaign email khách mới')

  await modal.locator('input[value="NOTIFICATION"]').uncheck()
  await modal.locator('input[value="EMAIL"]').uncheck()
  await modal.getByRole('button', { name: /Lưu chiến dịch/i }).click()
  await expect(page.locator('.mc-toast')).toContainText('Hãy chọn ít nhất một kênh gửi')
  expect(campaignPayload).toBeNull()

  await modal.locator('input[value="EMAIL"]').check()
  await modal.getByRole('button', { name: /Lưu chiến dịch/i }).click()
  await expect.poll(() => campaignPayload).not.toBeNull()
  expect(campaignPayload).toMatchObject({
    name: 'Campaign email khách mới',
    targetType: 'MANUAL',
    targetUserIds: ['customer-1'],
    segmentKey: null,
    channels: ['EMAIL'],
  })
  expect(campaignPayload).not.toHaveProperty('email')
  expect(campaignPayload).not.toHaveProperty('emails')
})
