import { test, expect } from '@playwright/test';

test.describe('Admin Flow: Promotions & Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // 1. LOGIN AS ADMIN
    await page.goto('/admin/login');
    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill('admin@furnisight.com');
    await page.getByPlaceholder(/mật khẩu|password/i).fill('Admin123!@#');
    await page.getByRole('button', { name: /đăng nhập|login/i }).click();

    // Verify successful login by checking dashboard presence
    await expect(page).toHaveURL(/.*admin\/(dashboard|overview).*/);
  });

  test('Admin can navigate to promotions, create a voucher, and verify it appears in the list', async ({ page }) => {
    // 1. NAVIGATE TO PROMOTIONS
    // Click the sidebar menu item for Promotions
    const promoMenu = page.locator('text=Khuyến mãi, text=Promotions').first();
    await promoMenu.waitFor({ state: 'visible' });
    await promoMenu.click();
    await expect(page).toHaveURL(/.*admin\/promotions.*/);

    // 2. CREATE A VOUCHER
    // Switch to Voucher tab if there is one
    const voucherTab = page.getByRole('tab', { name: /voucher/i });
    if (await voucherTab.isVisible()) {
      await voucherTab.click();
    }

    // Click "Tạo mới" or "Create"
    const createBtn = page.getByRole('button', { name: /tạo mới|thêm|create|add/i }).first();
    await createBtn.click();

    // Wait for the modal or form to appear
    const formContainer = page.locator('form, .modal, .dialog').last();
    await formContainer.waitFor({ state: 'visible' });

    // Fill in voucher details
    const uniqueCode = `E2E-TEST-${Date.now()}`;
    await formContainer.getByPlaceholder(/mã voucher|code/i).first().fill(uniqueCode);
    
    // Fill discount value (assuming it's a number input or has specific placeholder)
    const discountInput = formContainer.getByPlaceholder(/giá trị|discount/i).first();
    if (await discountInput.isVisible()) {
      await discountInput.fill('10');
    }

    // Save
    const saveBtn = formContainer.getByRole('button', { name: /lưu|save/i }).first();
    await saveBtn.click();

    // Verify success toast (API call finishes)
    await expect(page.locator('text=thành công, text=Success')).toBeVisible();

    // 3. VERIFY CREATION
    // Search for the created voucher in the table
    const searchInput = page.getByPlaceholder(/tìm kiếm|search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(uniqueCode);
      await page.keyboard.press('Enter');
      
      // Wait for table to filter (network request)
      await page.waitForTimeout(1000); 
    }

    // Assert the voucher code is visible in the list
    await expect(page.locator(`text=${uniqueCode}`).first()).toBeVisible();
  });
});
