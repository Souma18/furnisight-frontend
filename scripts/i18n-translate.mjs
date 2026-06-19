import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

if (!apiKey) {
  console.error('Missing GOOGLE_TRANSLATE_API_KEY. This key is only used by this local dev script and must not use VITE_.')
  process.exit(1)
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localeDir = path.join(rootDir, 'src/shared/i18n/locales')
const viPath = path.join(localeDir, 'vi.json')
const enPath = path.join(localeDir, 'en.json')

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function collectMissing(source, target, prefix = []) {
  return Object.entries(source).flatMap(([key, value]) => {
    const nextPath = [...prefix, key]
    if (isObject(value)) return collectMissing(value, target?.[key], nextPath)
    return target?.[key] == null || target?.[key] === '' ? [{ path: nextPath, text: String(value) }] : []
  })
}

function setByPath(target, pathParts, value) {
  let cursor = target
  pathParts.slice(0, -1).forEach((part) => {
    if (!isObject(cursor[part])) cursor[part] = {}
    cursor = cursor[part]
  })
  cursor[pathParts.at(-1)] = value
}

async function translateBatch(texts) {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      source: 'vi',
      target: 'en',
      format: 'text',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google Translate failed: ${response.status} ${body}`)
  }

  const data = await response.json()
  return data.data.translations.map((item) => item.translatedText)
}

const vi = JSON.parse(await readFile(viPath, 'utf8'))
const en = JSON.parse(await readFile(enPath, 'utf8'))
const missing = collectMissing(vi, en)

if (!missing.length) {
  console.log('No missing English translations.')
  process.exit(0)
}

const batchSize = 64
for (let index = 0; index < missing.length; index += batchSize) {
  const batch = missing.slice(index, index + batchSize)
  const translated = await translateBatch(batch.map((item) => item.text))
  translated.forEach((text, itemIndex) => setByPath(en, batch[itemIndex].path, text))
}

await writeFile(enPath, `${JSON.stringify(en, null, 2)}\n`)
console.log(`Translated ${missing.length} missing keys into en.json.`)
