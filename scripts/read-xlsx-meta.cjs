const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

const xlsx = path.join(__dirname, '..', 'docs', 'Vox-Ops.xlsx')
const tmp = path.join(os.tmpdir(), 'vox-ops-xlsx2')
const zip = path.join(os.tmpdir(), 'vox-ops2.zip')
fs.rmSync(tmp, { recursive: true, force: true })
fs.copyFileSync(xlsx, zip)
execSync(
  `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zip}' -DestinationPath '${tmp}' -Force"`,
  { stdio: 'pipe' },
)

const wb = fs.readFileSync(path.join(tmp, 'xl', 'workbook.xml'), 'utf8')
// sheet name -> rId
const sheets = [...wb.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map((m) => ({
  name: m[1],
  rid: m[2],
}))
const rels = fs.readFileSync(path.join(tmp, 'xl', '_rels', 'workbook.xml.rels'), 'utf8')
const ridToTarget = {}
for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
  ridToTarget[m[1]] = m[2].replace(/^\//, '')
}
console.log('Tabs:', sheets.map((s) => s.name).join(', '))

let shared = []
const ssPath = path.join(tmp, 'xl', 'sharedStrings.xml')
if (fs.existsSync(ssPath)) {
  const ss = fs.readFileSync(ssPath, 'utf8')
  shared = [...ss.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1])
}

function cellValue(c, xml) {
  const t = (c.match(/t="([^"]+)"/) || [])[1]
  const v = (c.match(/<v>([^<]*)<\/v>/) || [])[1]
  if (t === 's' && v != null) return shared[Number(v)] || ''
  if (t === 'inlineStr') {
    const t2 = (c.match(/<t[^>]*>([^<]*)<\/t>/) || [])[1]
    return t2 || ''
  }
  return v || ''
}

for (const s of sheets) {
  if (s.name.startsWith('_')) continue
  const target = ridToTarget[s.rid]
  if (!target) continue
  const xmlPath = path.join(tmp, 'xl', target.replace(/\//g, path.sep))
  if (!fs.existsSync(xmlPath)) continue
  const xml = fs.readFileSync(xmlPath, 'utf8')
  // first row cells
  const row1 = xml.match(/<row[^>]*r="1"[^>]*>([\s\S]*?)<\/row>/)
  if (!row1) {
    console.log(`\n[${s.name}] (no row 1)`)
    continue
  }
  const cells = [...row1[1].matchAll(/<c[^>]*>[\s\S]*?<\/c>/g)].map((m) => cellValue(m[0]))
  console.log(`\n[${s.name}] headers:`, cells.filter(Boolean).join(' | ') || '(empty)')
}
