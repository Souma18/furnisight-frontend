import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, '../public/admin-furni.html')
const outPath = path.join(__dirname, '../src/features/admin/styles/admin.css')

const html = fs.readFileSync(htmlPath, 'utf8')
const match = html.match(/<style>([\s\S]*?)<\/style>/)
if (!match) throw new Error('style block not found')

let css = match[1]
css = css.replace(':root{', '.admin-shell {')
css = css.replace(/html,body\{[^}]+\}/, '.admin-shell{height:100vh;overflow:hidden}')
// Only replace top-level body{}, not .modal-body / .log-body
css = css.replace(/^body\{/m, '.admin-shell{')
css = css.replace(
  /\.full-table-wrap\{/g,
  '.admin-shell .full-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;',
)
css = css.replace(/\.full-table\{width/g, '.admin-shell .full-table{min-width:720px;width')
css = css.replace(
  /\.roles-grid\{display:grid;grid-template-columns:1fr 1\.4fr/g,
  '.admin-shell .roles-grid{display:grid;grid-template-columns:minmax(280px,1fr) minmax(0,1.4fr)',
)
css = css.replace(
  /\.row-actions\{display:flex;gap:5px\}/g,
  '.admin-shell .row-actions{display:flex;gap:5px;flex-shrink:0}',
)
css = css.replace(
  /\.perm-badge\{display:inline-flex/g,
  '.admin-shell .perm-badge{display:inline-flex;flex-wrap:wrap',
)

const extra = `
.admin-shell .admin-perms-cell { min-width: 140px; white-space: normal; }
.admin-shell .icon-picker-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.admin-shell .icon-picker-item { border: 1.5px solid var(--border); border-radius: 8px; padding: 10px; cursor: pointer; text-align: center; background: var(--cream); transition: all .15s; }
.admin-shell .icon-picker-item:hover, .admin-shell .icon-picker-item.active { border-color: var(--gold); background: var(--gold-pale); }
.admin-shell .model-upload-box { border: 1.5px dashed var(--border); border-radius: 10px; padding: 16px; background: var(--cream); text-align: center; }
.admin-shell .model-upload-box.has-file { border-color: var(--gold); background: var(--gold-pale); }
@media (max-width: 1100px) { .admin-shell .roles-grid { grid-template-columns: 1fr; } }
`

const header = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');\n`

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, header + css + extra)
console.log('written', outPath)
