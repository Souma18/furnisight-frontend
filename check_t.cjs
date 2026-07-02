const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.vue') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Match `t(` that is NOT preceded by `$` or `.`, and NOT part of `const { t }` etc.
  // Actually, just check if ` t(` or `{{t(` or `(t(` exists, and `useI18n` does not.
  if (/(?<![\$\.\w])t\(/.test(content)) {
    if (!content.includes('useI18n')) {
      console.log('Missing useI18n in: ' + file);
    }
  }
}
