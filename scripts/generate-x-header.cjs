/**
 * Generate X.com profile header (1500×500) with current service names.
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
  warm: '#EDE4DC',
  line: '#D2D3D9',
  text: '#2E2E2E',
  accent: '#C45A30',
  muted: '#7C7F88',
  voice: '#FF6B4A',
  chat: '#4A9EFF',
  review: '#FFB84A',
  white: '#FFFFFF',
}

// Background
ctx.fillStyle = colors.bg
ctx.fillRect(0, 0, W, H)

// Warm band bottom
ctx.fillStyle = colors.warm
ctx.fillRect(0, 400, W, 100)
ctx.strokeStyle = colors.line
ctx.lineWidth = 1
ctx.beginPath()
ctx.moveTo(0, 400)
ctx.lineTo(W, 400)
ctx.stroke()

// Subtle wave lines
function wave(yBase, color, amp, phase) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.14
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  for (let x = 0; x <= W; x += 2) {
    const y = yBase + Math.sin((x / W) * Math.PI * 3 + phase) * amp + Math.sin((x / W) * Math.PI * 7 + phase * 1.3) * (amp * 0.35)
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}
wave(210, colors.voice, 28, 0)
wave(200, colors.chat, 32, 1.2)
wave(225, colors.review, 26, 2.4)

// Centered headline
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillStyle = colors.text
ctx.font = '700 72px Georgia, "Times New Roman", serif'
ctx.fillText('Your business.', W / 2, 160)
ctx.fillStyle = colors.accent
ctx.fillText('Never offline.', W / 2, 245)

// Subtext
ctx.fillStyle = colors.muted
ctx.font = '400 22px ui-monospace, "Cascadia Mono", "Segoe UI Mono", monospace'
ctx.fillText('AI automation for HVAC, plumbing & electrical', W / 2, 305)

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
  // pill bg
  roundRect(ctx, x, py, p.w, ph, 10)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fill()
  ctx.strokeStyle = colors.line
  ctx.lineWidth = 1
  ctx.stroke()

  // dot
  ctx.beginPath()
  ctx.arc(x + 22, py + ph / 2, 5, 0, Math.PI * 2)
  ctx.fillStyle = p.color
  ctx.fill()

  // label
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
fs.writeFileSync(out, canvas.toBuffer('image/png'))
console.log('wrote', out, `(${W}x${H})`)
