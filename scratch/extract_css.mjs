import fs from 'fs'
import path from 'path'

const dir = '/run/media/minhhien/New Volume1/Workspace/Projects/Work/FE/interior-3d/src/features/room3d/components'
const outCssPath = '/run/media/minhhien/New Volume1/Workspace/Projects/Work/FE/interior-3d/src/features/room3d/styles/room3d.css'

if (!fs.existsSync(path.dirname(outCssPath))) {
  fs.mkdirSync(path.dirname(outCssPath), { recursive: true })
}

let combinedCss = ''

const files = fs.readdirSync(dir).filter(f => f.endsWith('.vue'))

for (const file of files) {
  const filePath = path.join(dir, file)
  let code = fs.readFileSync(filePath, 'utf-8')
  
  const styleMatch = code.match(/<style scoped>([\s\S]*?)<\/style>/)
  if (styleMatch) {
    const cssContent = styleMatch[1].trim()
    combinedCss += `/* --- ${file} --- */\n${cssContent}\n\n`
    
    // Remove the style block from the vue file
    const newCode = code.replace(/<style scoped>[\s\S]*?<\/style>/, '')
    fs.writeFileSync(filePath, newCode.trim() + '\n')
    console.log(`Extracted CSS from ${file}`)
  }
}

// Check if room3d.css already exists and append to it if needed
if (fs.existsSync(outCssPath)) {
  const existingCss = fs.readFileSync(outCssPath, 'utf-8')
  fs.writeFileSync(outCssPath, existingCss + '\n' + combinedCss)
} else {
  fs.writeFileSync(outCssPath, combinedCss)
}

console.log('Done! Combined CSS into room3d.css')
