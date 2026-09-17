const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const sizes = [
  { name: 'favicon-48.png', size: 48 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
]

const colors = { voice: '#FF6B4A', chat: '#4A9EFF', review: '#FFB84A', bg: '#E2E3E8' }

for (const { name, size } of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const r = size * 0.21875
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fillStyle = colors.bg
  ctx.fill()

  const dotR = size * 0.1
  const cy = size / 2
  const gap = size * 0.28125

  const dots = [
    { cx: size / 2 - gap, color: colors.voice },
    { cx: size / 2, color: colors.chat },
    { cx: size / 2 + gap, color: colors.review },
  ]

  for (const d of dots) {
    ctx.beginPath()
    ctx.arc(d.cx, cy, dotR, 0, Math.PI * 2)
    ctx.fillStyle = d.color
    ctx.fill()
  }

  fs.writeFileSync(path.join(__dirname, 'public', name), canvas.toBuffer('image/png'))
  console.log(`wrote public/${name} (${size}x${size})`)
}
