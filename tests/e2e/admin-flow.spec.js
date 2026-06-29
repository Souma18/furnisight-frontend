import { test, expect } from '@playwright/test'

test.describe('Admin Flow E2E Tests', () => {
  test.describe.configure({ mode: 'serial' })
  let page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('A1: Admin can login', async () => {
    // Navigate to protected route to trigger auth modal
    await page.goto('/admin')

    const authModal = page.locator('.mc-modal-overlay, .auth-page')
    await expect(authModal.first()).toBeVisible()
    
    // Nhập admin từ seed data
    await authModal.locator('input[type="email"]').fill('admin@furnisight.store')
    await authModal.locator('input[type="password"]').fill('Password123!')
    
    const loginBtn = authModal.locator('button[type="submit"]')
    await loginBtn.click()

    await expect(page.locator('.mc-modal-overlay')).not.toBeVisible({ timeout: 10000 })

    await expect(page).toHaveURL(/.*\/admin.*/)
  })

  test('A2: Admin can manage orders', async () => {
    // Navigate to Admin Orders if not already there
    await page.goto('/admin/orders')
    
    // Kiểm tra danh sách đơn hàng
    const orderRow = page.locator('table tbody tr').first()
    await expect(orderRow).toBeVisible()
    
    // Nhấn xem chi tiết đơn hàng
    const viewBtn = orderRow.locator('.action-btn.view') // Hoặc element tương ứng
    if (await viewBtn.isVisible()) {
        await viewBtn.click()
        await expect(page.locator('.order-detail-modal, .order-detail-page')).toBeVisible()
        // Đổi trạng thái đơn hàng (Mô phỏng nếu có UI)
        // await page.getByRole('button', { name: /Cập nhật/i }).click()
    }
  })

  test('A3: Admin can manage products', async () => {
    await page.goto('/admin/products')
    
    // Kiểm tra danh sách sản phẩm lấy từ DB
    const productRow = page.locator('table tbody tr').first()
    await expect(productRow).toBeVisible()
  })
})
