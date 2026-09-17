const fs = require('fs')
const path = require('path')
const os = require('os')
const xml = fs.readFileSync(path.join(os.tmpdir(), 'vox-ops-xlsx2', 'xl', 'worksheets', 'sheet3.xml'), 'utf8')
const rows = [...xml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)]
for (const r of rows.slice(0, 8)) {
  const n = r[1]
  const texts = [...r[2].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1])
  console.log('ROW', n, '=>', texts.join(' | '))
}
