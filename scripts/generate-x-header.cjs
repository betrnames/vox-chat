/**
 * Generate X.com profile header (1500×500) with current hero messaging.
 * Run: node scripts/generate-x-header.cjs
 */
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const W = 1500
const H = 500
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

// Solid background — no warm band
ctx.fillStyle = colors.bg
ctx.fillRect(0, 0, W, H)

function wave(yBase, color, amp, phase) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.14
  ctx.lineWidth = 1.8
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
wave(200, colors.voice, 28, 0)
wave(190, colors.chat, 32, 1.2)
wave(215, colors.review, 26, 2.4)

// Centered headline — one line with accent on "or review."
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.font = '700 56px Georgia, "Times New Roman", serif'

const part1 = 'Never miss a call, lead, '
const part2 = 'or review.'
const full = part1 + part2
const fullW = ctx.measureText(full).width
const startX = W / 2 - fullW / 2
const y = 175

ctx.textAlign = 'left'
ctx.fillStyle = colors.text
ctx.fillText(part1, startX, y)
const p1w = ctx.measureText(part1).width
ctx.fillStyle = colors.accent
ctx.fillText(part2, startX + p1w, y)

// Subtext
ctx.textAlign = 'center'
ctx.fillStyle = colors.muted
ctx.font = '400 20px ui-monospace, "Cascadia Mono", "Segoe UI Mono", monospace'
ctx.fillText('AI answers your phone, captures website leads,', W / 2, 250)
ctx.fillText('and gets you more Google reviews — 24/7. Built for contractors.', W / 2, 280)

// Service pills — centered
const pills = [
  { label: 'AI Phone Agent', color: colors.voice, w: 190 },
  { label: 'AI Receptionist', color: colors.chat, w: 200 },
  { label: 'AI Review Agent', color: colors.review, w: 195 },
]
const gap = 16
const totalW = pills.reduce((s, p) => s + p.w, 0) + gap * (pills.length - 1)
let x = (W - totalW) / 2
const py = 340
const ph = 44

ctx.font = '500 15px ui-monospace, "Cascadia Mono", "Segoe UI Mono", monospace'
ctx.textAlign = 'left'
ctx.textBaseline = 'middle'

for (const p of pills) {
  roundRect(ctx, x, py, p.w, ph, 10)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fill()
  ctx.strokeStyle = colors.line
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x + 22, py + ph / 2, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.color
  ctx.fill()

  ctx.fillStyle = colors.text
  ctx.fillText(p.label, x + 36, py + ph / 2 + 0.5)

  x += p.w + gap
}

function roundRect(c, rx, ry, rw, rh, r) {
  c.beginPath()
  c.moveTo(rx + r, ry)
  c.arcTo(rx + rw, ry, rx + rw, ry + rh, r)
  c.arcTo(rx + rw, ry + rh, rx, ry + rh, r)
  c.arcTo(rx, ry + rh, rx, ry, r)
  c.arcTo(rx, ry, rx + rw, ry, r)
  c.closePath()
}

const out = path.join(__dirname, '..', 'assets', 'vox-header.png')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, canvas.toBuffer('image/png'))
console.log('wrote', out, `(${W}x${H})`)
