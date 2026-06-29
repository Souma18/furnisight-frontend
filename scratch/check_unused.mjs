import fs from 'fs'
import path from 'path'

const checkDir = (dir) => {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir)
  files.forEach(f => {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) {
      checkDir(p)
      return
    }
    if (!p.endsWith('.js') && !p.endsWith('.vue')) return
    const code = fs.readFileSync(p, 'utf-8')
    
    // Find imports
    const importRegex = /import\s+{([^}]+)}\s+from/g
    let match;
    const unused = []
    
    while ((match = importRegex.exec(code)) !== null) {
      const vars = match[1].split(',').map(v => v.trim().split(' as ')[0]).filter(v => v)
      vars.forEach(v => {
        // Find usages of the variable (excluding the import statement itself)
        const usageRegex = new RegExp(`\\b${v}\\b`, 'g')
        const usages = code.match(usageRegex)
        if (usages && usages.length <= 1) {
          unused.push(v)
        }
      })
    }
    
    if (unused.length > 0) {
      console.log(`${p} has unused imports: ${unused.join(', ')}`)
    }
  })
}

checkDir('/run/media/minhhien/New Volume1/Workspace/Projects/Work/FE/interior-3d/src/features/room3d')
