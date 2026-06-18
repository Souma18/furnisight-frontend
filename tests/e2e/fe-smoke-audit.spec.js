import { expect, test } from '@playwright/test'
import { fatalRuntimeIssues, openAndAudit } from './helpers/audit'

const PUBLIC_ROUTES = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'promotions', path: '/khuyen-mai' },
  { name: 'contact', path: '/contact' },
  { name: 'cart', path: '/cart' },
  { name: 'room3d', path: '/room3d' },
  { name: 'payment-success', path: '/payment/success' },
  { name: 'payment-failure', path: '/payment/failure' },
]

const PROTECTED_ROUTES = [
  { name: 'account', path: '/account' },
  { name: 'checkout', path: '/checkout' },
  { name: 'admin-dashboard', path: '/admin/dashboard' },
  { name: 'admin-products', path: '/admin/products' },
  { name: 'admin-orders', path: '/admin/orders' },
]

test.describe('FE public page smoke and UI/UX audit', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} renders without runtime crash`, async ({ page }, testInfo) => {
      const issues = await openAndAudit(page, testInfo, route)
      const fatalIssues = fatalRuntimeIssues(issues)
      expect(fatalIssues, JSON.stringify(fatalIssues, null, 2)).toEqual([])
    })
  }
})

test.describe('FE protected route behavior', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route.name} redirects or blocks guest cleanly`, async ({ page }, testInfo) => {
      const issues = await openAndAudit(page, testInfo, route)
      await expect(page.locator('#app')).toBeVisible()
      expect(page.url()).not.toContain(route.path)

      const fatalIssues = fatalRuntimeIssues(issues)
      expect(fatalIssues, JSON.stringify(fatalIssues, null, 2)).toEqual([])
    })
  }
})

test('product detail can be discovered from product list and audited', async ({ page }, testInfo) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1_500)

  const productLinks = page.locator('a[href^="/products/"]:not([href="/products"])')
  const linkCount = await productLinks.count()
  const firstProductHref = linkCount > 0
    ? await productLinks.first().getAttribute('href', { timeout: 1_000 })
    : null

  test.skip(!firstProductHref, 'No product detail link found on the product list page.')

  const issues = await openAndAudit(page, testInfo, {
    name: 'product-detail',
    path: firstProductHref,
  })
  const fatalIssues = fatalRuntimeIssues(issues)
  expect(fatalIssues, JSON.stringify(fatalIssues, null, 2)).toEqual([])
})
