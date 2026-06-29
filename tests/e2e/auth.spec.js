import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('User can open login modal and toggle to register', async ({ page }) => {
    await page.goto('/')

    // Trigger auth modal opening, usually there's a button in header
    // But since auth triggers by auth store, let's trigger via header login button
    const loginBtn = page.getByRole('button', { name: /đăng nhập/i })
    if (await loginBtn.isVisible()) {
      await loginBtn.click()
    } else {
      // Direct navigation to trigger auth
      await page.goto('/account')
    }

    const authModal = page.locator('.mc-modal-overlay')
    await expect(authModal).toBeVisible()

    const loginSubmitBtn = authModal.locator('button[type="submit"]')
    await expect(loginSubmitBtn).toBeVisible()

    // Toggle to register
    const toggleBtn = authModal.getByRole('button', { name: 'Đăng ký', exact: true }).first()
    await toggleBtn.click()

    const registerSubmitBtn = authModal.locator('button[type="submit"]')
    await expect(registerSubmitBtn).toBeVisible()
  })
})
