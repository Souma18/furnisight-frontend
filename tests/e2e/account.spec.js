import { test, expect } from '@playwright/test';

test.describe('EPIC 1: Account Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login or use a valid session
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('user@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Password123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('User can update profile information', async ({ page }) => {
    await page.goto('/profile');
    
    // Update name
    await page.getByPlaceholder(/tên/i).fill('Updated Name');
    await page.getByRole('button', { name: /lưu thay đổi/i }).click();
    
    await expect(page.getByText(/cập nhật thành công/i)).toBeVisible();
  });

  test('User can manage addresses', async ({ page }) => {
    await page.goto('/profile/addresses'); // Assumed route
    
    // Add new address
    await page.getByRole('button', { name: /thêm địa chỉ/i }).click();
    await page.getByPlaceholder(/địa chỉ/i).fill('123 Street A');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    await expect(page.getByText(/123 Street A/i)).toBeVisible();
  });

  test('User can view and mark notifications as read', async ({ page }) => {
    await page.goto('/profile/notifications'); // Assumed route
    
    const unreadNotif = page.locator('.notification-unread').first();
    if (await unreadNotif.isVisible()) {
      await unreadNotif.click();
      await expect(unreadNotif).not.toHaveClass(/notification-unread/);
    }
  });
});
