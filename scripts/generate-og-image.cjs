/**
 * Export public/og-image.png at 1200×630 for social previews.
 * Run: node scripts/generate-og-image.cjs
 */
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const W = 1200
const H = 630
const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

const colors = {
  bg: '#E2E3E8',
  line: '#D2D3D9',
  text: '#2E2E2E',
  accent: '#C45A30',
  muted: '#7C7F88',
  voice: '#FF6B4A',
  chat: '#4A9EFF',
  review: '#FFB84A',
}

// Single continuous background — no warm band (was clashing with cool gray)
ctx.fillStyle = colors.bg
ctx.fillRect(0, 0, W, H)

function wave(yBase, color, amp, phase) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.12
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  for (let x = 0; x <= W; x += 2) {
    const y =
      yBase +
      Math.sin((x / W) * Math.PI * 3 + phase) * amp +
      Math.sin((x / W) * Math.PI * 7 + phase * 1.3) * (amp * 0.35)
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}
wave(280, colors.voice, 22, 0)
wave(260, colors.chat, 26, 1.2)
wave(300, colors.review, 20, 2.4)

// Three dots — left
;[[90, colors.voice], [126, colors.chat], [162, colors.review]].forEach(([cx, c]) => {
  ctx.beginPath()
  ctx.arc(cx, 150, 12, 0, Math.PI * 2)
  ctx.fillStyle = c
  ctx.fill()
})

ctx.textAlign = 'left'
ctx.textBaseline = 'alphabetic'
ctx.fillStyle = colors.text
ctx.font = '700 52px Georgia, "Times New Roman", serif'
ctx.fillText('Your business.', 80, 260)
ctx.fillStyle = colors.accent
ctx.fillText('Never offline.', 80, 325)

ctx.fillStyle = colors.muted
ctx.font = '400 18px ui-monospace, "Cascadia Mono", monospace'
ctx.fillText('AI automation for HVAC, plumbing & electrical', 82, 385)

function roundRect(x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const pills = [
  { label: 'AI Phone Agent', color: colors.voice, x: 80, w: 170 },
  { label: 'AI Receptionist', color: colors.chat, x: 266, w: 185 },
  { label: 'AI Review Agent', color: colors.review, x: 467, w: 175 },
]
const py = 420
const ph = 38

ctx.font = '500 12px ui-monospace, "Cascadia Mono", monospace'
for (const p of pills) {
  roundRect(p.x, py, p.w, ph, 8)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fill()
  ctx.strokeStyle = colors.line
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(p.x + 20, py + ph / 2, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.color
  ctx.fill()

  ctx.fillStyle = colors.text
  ctx.textBaseline = 'middle'
  ctx.fillText(p.label, p.x + 32, py + ph / 2 + 0.5)
}

ctx.fillStyle = colors.muted
ctx.globalAlpha = 0.5
ctx.font = '400 14px ui-monospace, "Cascadia Mono", monospace'
ctx.textBaseline = 'alphabetic'
ctx.fillText('vox.chat', 82, 490)
ctx.globalAlpha = 1

const out = path.join(__dirname, '..', 'public', 'og-image.png')
fs.writeFileSync(out, canvas.toBuffer('image/png'))
console.log('wrote', out, `(${W}x${H})`)
