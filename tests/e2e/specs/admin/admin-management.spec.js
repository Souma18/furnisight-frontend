import { test, expect } from '@playwright/test';

test.describe('Advanced Flow: Admin Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');
    
    // Login as Admin
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    // Verify successful login
    await expect(page).toHaveURL(/.*admin.*/);
  });

  test('Admin can view dashboard statistics', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Check if charts/statistics are visible
    await expect(page.getByText(/tổng doanh thu/i)).toBeVisible();
    await expect(page.getByText(/đơn hàng mới/i)).toBeVisible();
  });

  test('Admin can manage products', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Check product list
    await expect(page.getByRole('table')).toBeVisible();
    
    // Click "Add Product"
    await page.getByRole('button', { name: /thêm sản phẩm/i }).click();
    
    // Fill basic product info
    await page.getByPlaceholder(/tên sản phẩm/i).fill('Sản phẩm Test E2E');
    await page.getByPlaceholder(/giá/i).fill('1000000');
    
    // Submit
    await page.getByRole('button', { name: /lưu/i }).click();
    
    // Verify success message
    await expect(page.getByText(/thành công/i)).toBeVisible();
  });

  test('Admin can manage promotions/vouchers', async ({ page }) => {
    await page.goto('/admin/promotions');
    
    // Go to Vouchers tab
    await page.getByRole('tab', { name: /voucher/i }).click();
    
    // Create new voucher
    await page.getByRole('button', { name: /tạo mới/i }).click();
    await page.getByPlaceholder(/mã voucher/i).fill('E2EVOUCHER');
    await page.getByPlaceholder(/phần trăm giảm/i).fill('15');
    
    // Save
    await page.getByRole('button', { name: /lưu/i }).click();
    
    // Verify creation
    await expect(page.getByText(/tạo thành công/i)).toBeVisible();
  });
});
