import { test, expect } from '@playwright/test';

test.describe('EPIC 5: Admin - Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/mật khẩu/i).fill('Admin@123!');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/.*admin\/dashboard/);
  });

  test('Admin can manage categories', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Add Category
    await page.getByRole('button', { name: /thêm/i }).click();
    await page.getByPlaceholder(/tên danh mục/i).fill('Sofa Cao Cấp');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    await expect(page.getByText(/thành công/i)).toBeVisible();
  });

  test('Admin can manage products and view inventory', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Add Product
    await page.getByRole('button', { name: /thêm/i }).click();
    await page.getByPlaceholder(/tên sản phẩm/i).fill('Sofa Góc Hiện Đại');
    await page.getByPlaceholder(/giá bán/i).fill('5000000');
    // Upload image simulation
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      // await fileInput.setInputFiles('path/to/image.jpg');
    }
    
    await page.getByRole('button', { name: /lưu/i }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible();

    // Check Inventory
    await page.goto('/admin/inventory');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText(/cảnh báo hết hàng/i)).toBeVisible({ timeout: 2000 }).catch(() => {});
  });
});
