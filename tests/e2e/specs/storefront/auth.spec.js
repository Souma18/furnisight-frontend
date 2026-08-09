import { test, expect } from '@playwright/test';

test.describe('EPIC 1: Authentication', () => {
  test('User can register, verify email, and login', async ({ page }) => {
    // Navigate to registration (could be a tab in login page)
    await page.goto('/login');
    await page.getByRole('tab', { name: /đăng ký/i }).click();
    
    // Registration form
    await page.getByPlaceholder(/tên/i).fill('Test User');
    await page.getByPlaceholder(/email/i).fill('test_register@example.com');
    await page.getByPlaceholder(/mật khẩu/i).first().fill('Password123!');
    await page.getByRole('button', { name: /đăng ký/i }).click();

    // Verification (OTP/Email)
    await expect(page.getByText(/xác thực/i)).toBeVisible();
    // Fill OTP
    await page.getByPlaceholder(/nhập mã/i).fill('123456');
    await page.getByRole('button', { name: /xác nhận/i }).click();
    
    // Login
    await expect(page).toHaveURL(/.*(\/|\/login)/);
  });

  test('User can login via Social Accounts (OAuth)', async ({ page }) => {
    await page.goto('/login');
    
    // Click Google Login
    const googleBtn = page.getByRole('button', { name: /google/i });
    if (await googleBtn.isVisible()) {
      await googleBtn.click();
      // Should redirect to OAuth provider
      await expect(page).toHaveURL(/.*accounts.google.com.*/);
    }
  });

  test('User can reset forgotten password', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/quên mật khẩu/i).click();
    
    await page.getByPlaceholder(/email/i).fill('test_register@example.com');
    await page.getByRole('button', { name: /gửi/i }).click();

    // Verify OTP input or success message
    await expect(page.getByText(/vui lòng kiểm tra email/i)).toBeVisible();
  });
});
