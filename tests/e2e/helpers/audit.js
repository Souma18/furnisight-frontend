import fs from 'node:fs'
import path from 'node:path'
import { expect } from '@playwright/test'

const REPORT_DIR = path.resolve(process.cwd(), 'test-results', 'ui-ux-audit')
const IGNORED_NETWORK_PATTERNS = [
  /favicon/i,
  /sockjs-node/i,
  /\/messages\/ws\//i,
  /chrome-extension:/i,
]

export function attachIssueCollectors(page, issues) {
  page.on('console', (message) => {
    if (!['error', 'warning'].includes(message.type())) return
    const text = message.text()
    if (text.includes('Download the Vue Devtools')) return
    issues.push({
      type: `console:${message.type()}`,
      message: text,
      location: message.location(),
    })
  })

  page.on('pageerror', (error) => {
    issues.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack,
    })
  })

  page.on('requestfailed', (request) => {
    const url = request.url()
    if (IGNORED_NETWORK_PATTERNS.some((pattern) => pattern.test(url))) return
    issues.push({
      type: 'network:failed',
      method: request.method(),
      url,
      message: request.failure()?.errorText || 'Request failed',
    })
  })

  page.on('response', (response) => {
    const url = response.url()
    if (IGNORED_NETWORK_PATTERNS.some((pattern) => pattern.test(url))) return
    if (response.status() < 400) return
    issues.push({
      type: 'network:http',
      status: response.status(),
      method: response.request().method(),
      url,
    })
  })
}

export async function openAndAudit(page, testInfo, route) {
  const issues = []
  attachIssueCollectors(page, issues)

  await page.goto(route.path, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1_200)
  await expect(page.locator('#app')).toBeVisible()

  const uiIssues = await scanUiIssues(page)
  issues.push(...uiIssues.map((issue) => ({ ...issue, type: `ui:${issue.type}` })))

  await writeAuditReport(testInfo, route, issues)
  return issues
}

export function fatalRuntimeIssues(issues) {
  return issues.filter((issue) => issue.type === 'pageerror')
}

export async function scanUiIssues(page) {
  return page.evaluate(() => {
    const issues = []
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const documentWidth = Math.ceil(document.documentElement.scrollWidth)

    if (documentWidth > viewportWidth + 2) {
      issues.push({
        type: 'horizontal-overflow',
        message: `Document width ${documentWidth}px exceeds viewport ${viewportWidth}px`,
        selector: 'document',
      })
    }

    const isVisible = (element) => {
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.visibility !== 'hidden'
        && style.display !== 'none'
        && Number(style.opacity) !== 0
        && rect.width > 0
        && rect.height > 0
    }

    const selectorFor = (element) => {
      if (element.id) return `#${element.id}`
      const parts = []
      let current = element
      while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
        const tag = current.tagName.toLowerCase()
        const className = Array.from(current.classList || []).slice(0, 2).join('.')
        parts.unshift(className ? `${tag}.${className}` : tag)
        current = current.parentElement
      }
      return parts.join(' > ')
    }

    const hasHorizontalScrollAncestor = (element) => {
      let current = element.parentElement
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current)
        const allowsHorizontalScroll = ['auto', 'scroll'].includes(style.overflowX)
        if (allowsHorizontalScroll && current.scrollWidth > current.clientWidth + 2) {
          return true
        }
        current = current.parentElement
      }
      return false
    }

    document.querySelectorAll('button, a, [role="button"], [role="link"]').forEach((element) => {
      if (!isVisible(element)) return
      const name = [
        element.getAttribute('aria-label'),
        element.getAttribute('title'),
        element.innerText,
        element.textContent,
      ].filter(Boolean).join(' ').trim()

      if (!name) {
        issues.push({
          type: 'missing-accessible-name',
          message: 'Clickable element has no visible text, aria-label, or title',
          selector: selectorFor(element),
        })
      }
    })

    document.querySelectorAll('button, a, input, select, textarea, [role="button"]').forEach((element) => {
      if (!isVisible(element)) return
      const rect = element.getBoundingClientRect()
      if (hasHorizontalScrollAncestor(element)) return
      if (rect.right > viewportWidth + 1 || rect.left < -1) {
        issues.push({
          type: 'control-outside-viewport',
          message: `Control is outside viewport: left=${Math.round(rect.left)}, right=${Math.round(rect.right)}`,
          selector: selectorFor(element),
        })
      }
    })

    document.querySelectorAll('button, .btn, [class*="btn"], [class*="button"]').forEach((element) => {
      if (!isVisible(element)) return
      const scrollWidth = Math.ceil(element.scrollWidth)
      const clientWidth = Math.ceil(element.clientWidth)
      if (scrollWidth > clientWidth + 2) {
        issues.push({
          type: 'text-overflow',
          message: `Text/content width ${scrollWidth}px exceeds container ${clientWidth}px`,
          selector: selectorFor(element),
        })
      }
    })

    document.querySelectorAll('body *').forEach((element) => {
      if (!isVisible(element)) return
      const rect = element.getBoundingClientRect()
      if (rect.top > viewportHeight || rect.bottom < 0) return
      if (rect.width > viewportWidth + 2) {
        issues.push({
          type: 'oversized-element',
          message: `Element width ${Math.round(rect.width)}px exceeds viewport ${viewportWidth}px`,
          selector: selectorFor(element),
        })
      }
    })

    return issues.slice(0, 120)
  })
}

export async function writeAuditReport(testInfo, route, issues) {
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const safeName = `${testInfo.project.name}-${route.name}`.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
  const jsonPath = path.join(REPORT_DIR, `${safeName}.json`)
  const mdPath = path.join(REPORT_DIR, `${safeName}.md`)
  const payload = {
    project: testInfo.project.name,
    route,
    issueCount: issues.length,
    issues,
    createdAt: new Date().toISOString(),
  }

  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`)
  fs.writeFileSync(mdPath, toMarkdown(payload))
  await testInfo.attach(`ui-ux-audit-${route.name}`, {
    path: jsonPath,
    contentType: 'application/json',
  })
}

function toMarkdown(report) {
  const rows = report.issues.map((issue, index) => {
    const where = issue.selector || issue.url || issue.location?.url || ''
    const message = String(issue.message || issue.status || '').replace(/\|/g, '\\|')
    return `| ${index + 1} | ${issue.type} | ${where} | ${message} |`
  })

  return [
    `# UI/UX audit: ${report.route.name}`,
    '',
    `- Project: ${report.project}`,
    `- Path: ${report.route.path}`,
    `- Issues: ${report.issueCount}`,
    '',
    '| # | Type | Where | Message |',
    '| - | - | - | - |',
    ...rows,
    '',
  ].join('\n')
}
