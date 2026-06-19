import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localeDir = path.join(rootDir, 'src/shared/i18n/locales')

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    return flattenKeys(child, nextPrefix)
  })
}

async function readLocale(name) {
  const raw = await readFile(path.join(localeDir, `${name}.json`), 'utf8')
  return JSON.parse(raw)
}

const [vi, en] = await Promise.all([readLocale('vi'), readLocale('en')])
const viKeys = new Set(flattenKeys(vi))
const enKeys = new Set(flattenKeys(en))

const missingInEn = [...viKeys].filter((key) => !enKeys.has(key)).sort()
const extraInEn = [...enKeys].filter((key) => !viKeys.has(key)).sort()

if (missingInEn.length || extraInEn.length) {
  if (missingInEn.length) {
    console.error('Missing keys in en.json:')
    missingInEn.forEach((key) => console.error(`  - ${key}`))
  }
  if (extraInEn.length) {
    console.error('Extra keys in en.json:')
    extraInEn.forEach((key) => console.error(`  - ${key}`))
  }
  process.exit(1)
}

console.log(`i18n key check passed (${viKeys.size} keys).`)
