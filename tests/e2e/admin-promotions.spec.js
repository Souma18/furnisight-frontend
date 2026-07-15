import { test, expect } from '@playwright/test';

test.describe('EPIC 5: Admin - Advanced Promotions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
  });

  test('Admin can create Campaign, Combo and Voucher', async ({ page }) => {
    await page.goto('/admin/promotions');
    
    // Tab Campaign
    await page.getByRole('tab', { name: /chiến dịch/i }).click();
    await page.getByRole('button', { name: /tạo mới/i }).click();
    await page.getByPlaceholder(/tên chiến dịch/i).fill('Tết 2026');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    // Tab Voucher
    await page.getByRole('tab', { name: /voucher/i }).click();
    await page.getByRole('button', { name: /tạo mới/i }).click();
    await page.getByPlaceholder(/mã voucher/i).fill('TET2026');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    await expect(page.getByText(/thành công/i)).toBeVisible();
  });

  test('Admin can configure email notify templates', async ({ page }) => {
    await page.goto('/admin/promotions');
    await page.getByRole('tab', { name: /template/i }).click();
    
    // Edit template
    await page.getByRole('button', { name: /sửa/i }).first().click();
    await page.locator('textarea').first().fill('Chúc mừng bạn nhận được Voucher');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    await expect(page.getByText(/cập nhật thành công/i)).toBeVisible();
  });
});
