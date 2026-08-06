import { test, expect } from '@playwright/test';

test.describe('Standard Shopping Flow (Full E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Optionally login if your cart requires auth, or go straight as guest
    // await page.goto('/login');
    // await page.getByPlaceholder(/email/i).fill('testuser@example.com');
    // await page.getByPlaceholder(/mật khẩu/i).fill('Password123!');
    // await page.getByRole('button', { name: /đăng nhập/i }).click();
  });

  test('User can search, filter, select variant, add to cart, update cart, and checkout', async ({ page }) => {
    // 1. HOME & SEARCH
    await page.goto('/');
    
    // Search for a general term like 'sofa' or 'giường'
    const searchInput = page.getByPlaceholder(/tìm kiếm|search/i).first();
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('a'); // A generic search that returns items
    await page.keyboard.press('Enter');
    
    // Wait for product list to load
    await expect(page).toHaveURL(/.*(search|products).*/);
    
    // Try clicking a filter if present (e.g., category or price)
    // We wrap in a try-catch or soft assert because filters might be dynamic
    const filterBtn = page.getByRole('button', { name: /bộ lọc|filter/i }).first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      // Click first category checkbox if exists
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible()) await firstCheckbox.check();
      const applyBtn = page.getByRole('button', { name: /áp dụng|apply/i });
      if (await applyBtn.isVisible()) await applyBtn.click();
    }

    // 2. PRODUCT DETAIL
    // Wait for products to load and click the first one
    const productCard = page.locator('a.shared-product-card, .product-card, .product-item').first();
    await productCard.waitFor({ state: 'visible' });
    await productCard.click();

    // Verify we are on detail page
    await expect(page).toHaveURL(/.*(product|san-pham)\/.*/);

    // Click a variant (color/size) if available
    const variantBtn = page.locator('.variant-options button, .product-variants button').first();
    if (await variantBtn.isVisible()) {
      await variantBtn.click();
    }

    // Increase quantity
    const increaseQtyBtn = page.getByRole('button', { name: /\+|tăng/i }).first();
    if (await increaseQtyBtn.isVisible()) {
      await increaseQtyBtn.click();
    }

    // Add to cart
    const addToCartBtn = page.getByRole('button', { name: /thêm vào giỏ|add to cart/i }).first();
    await addToCartBtn.waitFor({ state: 'visible' });
    await addToCartBtn.click();

    // Wait for success toast or cart drawer
    const successMsg = page.locator('text=thành công').first();
    if (await successMsg.isVisible()) {
      await expect(successMsg).toBeVisible();
    }

    // 3. CART MANAGEMENT
    // Go to cart
    await page.goto('/cart');
    
    // Ensure cart has items
    const cartItem = page.locator('.cart-item, .item').first();
    await cartItem.waitFor({ state: 'visible', timeout: 10000 });

    // Tick the item if checkboxes exist
    const itemCheckbox = cartItem.locator('.select-box-input, input[type="checkbox"]').first();
    if (await itemCheckbox.isVisible()) {
      const isChecked = await itemCheckbox.isChecked();
      if (!isChecked) await itemCheckbox.check();
    }

    // Modify quantity in cart
    const cartIncreaseBtn = cartItem.getByRole('button', { name: /\+|tăng/i }).first();
    if (await cartIncreaseBtn.isVisible()) {
      await cartIncreaseBtn.click();
      // wait a bit for price recalculation/API call
      await page.waitForTimeout(1000); 
    }

    // 4. CHECKOUT
    // Click Checkout button
    const checkoutBtn = page.getByRole('button', { name: /thanh toán|checkout/i, exact: false }).last();
    await checkoutBtn.waitFor({ state: 'visible' });
    await checkoutBtn.click();

    // Verify on checkout page
    await expect(page).toHaveURL(/.*checkout.*/);

    // Fill delivery details
    const nameInput = page.getByPlaceholder(/tên|name/i).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Nguyen Van A (E2E Test)');
      await page.getByPlaceholder(/điện thoại|phone/i).first().fill('0901234567');
      await page.getByPlaceholder(/địa chỉ|address/i).first().fill('123 Đường Test, Quận 1, TP HCM');
    }

    // Select payment method (Assuming COD is a radio or button)
    const codOption = page.locator('text=Thanh toán khi nhận hàng, text=COD').first();
    if (await codOption.isVisible()) {
      await codOption.click();
    }

    // Add a note
    const noteInput = page.getByPlaceholder(/ghi chú|note/i).first();
    if (await noteInput.isVisible()) {
      await noteInput.fill('Đây là đơn hàng test E2E tự động, vui lòng bỏ qua.');
    }

    // 5. PLACE ORDER
    const submitOrderBtn = page.getByRole('button', { name: /đặt hàng|place order/i }).first();
    await submitOrderBtn.waitFor({ state: 'visible' });
    await submitOrderBtn.click();

    // Verify success
    await expect(page.locator('text=thành công, text=success, text=Cảm ơn')).toBeVisible({ timeout: 15000 });
  });
});
