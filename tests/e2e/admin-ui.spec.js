import { test, expect } from '@playwright/test'

test.describe('Admin UI Flow', () => {
  // Use a simulated admin login
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc0FkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJWT1VDSEVSX01BTkFHRSJdfQ.signature')
      localStorage.setItem('auth_profile', JSON.stringify({
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      }))
      localStorage.setItem('auth_roles', JSON.stringify(['ROLE_ADMIN']))
    })
  })

  test('Admin can access admin dashboard and view KPIs', async ({ page }) => {
    await page.route('**/admin/dashboard', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          welcome: { revenueLabel: '10M', ordersToday: 5, users: 100 },
          kpis: [],
          recentOrders: [],
          lowStock: [],
          alerts: []
        })
      })
    })

    await page.goto('/admin')

    // Expect the admin layout wrapper to be present
    const layout = page.locator('.admin-shell')
    await expect(layout).toBeVisible()

    // Dashboard content should be visible
    const dashboard = page.locator('.welcome-banner')
    await expect(dashboard).toBeVisible()

    // Check sidebar navigation
    const nav = page.locator('.sidebar')
    await expect(nav.getByRole('button', { name: /Dashboard/i })).toBeVisible()
    await expect(nav.getByRole('button', { name: /Trang của tôi/i })).toBeVisible()

    // Check if user is displayed
    const userMenu = page.locator('.topbar .tb-admin-chip')
    if (await userMenu.count() > 0) {
       await expect(userMenu).toBeVisible()
    }
  })
})
