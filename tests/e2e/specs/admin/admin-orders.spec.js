import { test, expect } from '@playwright/test';

test.describe('EPIC 5: Admin - Orders & CRM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
  });

  test('Admin can update order status', async ({ page }) => {
    await page.goto('/admin/orders');
    
    // Open first order detail
    await page.locator('table tbody tr').first().click();
    await expect(page).toHaveURL(/.*admin\/orders\/.+/);

    // Change status from Pending to Shipped
    const statusSelect = page.locator('select.order-status, .n-select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.getByText(/đang giao hàng|shipped/i).click();
      
      await page.getByRole('button', { name: /cập nhật/i }).click();
      await expect(page.getByText(/cập nhật thành công/i)).toBeVisible();
    }
  });

  test('Admin can reply to customer conversations', async ({ page }) => {
    await page.goto('/admin/conversations');
    
    // Select first chat
    const firstChat = page.locator('.chat-list-item').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      
      await page.getByPlaceholder(/nhập tin nhắn/i).fill('Cảm ơn bạn, tôi sẽ hỗ trợ ngay.');
      await page.getByRole('button', { name: /gửi/i }).click();
      
      await expect(page.getByText(/tôi sẽ hỗ trợ ngay/i)).toBeVisible();
    }
  });
});
