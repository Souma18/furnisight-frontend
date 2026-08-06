import { test, expect } from '@playwright/test';

test.describe('EPIC 5: Admin - System & Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
  });

  test('Admin can view Dashboard stats and Revenue chart', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Check stat cards
    await expect(page.getByText(/tổng doanh thu/i)).toBeVisible();
    await expect(page.getByText(/đơn hàng mới/i)).toBeVisible();
    
    // Navigate to Revenue detailed page
    await page.goto('/admin/revenue');
    
    // Check if Chart canvas is rendered
    await expect(page.locator('canvas.chart, canvas').first()).toBeVisible();
  });

  test('Admin can manage Users and Roles', async ({ page }) => {
    await page.goto('/admin/users');
    
    await expect(page.getByRole('table')).toBeVisible();
    
    // Block user
    const blockBtn = page.getByRole('button', { name: /khóa/i }).first();
    if (await blockBtn.isVisible()) {
      await blockBtn.click();
      await expect(page.getByText(/đã khóa/i)).toBeVisible();
    }
  });

  test('Admin can view Audit Logs', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText(/hành động/i)).toBeVisible();
  });
});
