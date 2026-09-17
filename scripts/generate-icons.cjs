const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const pub = path.join(__dirname, '..', 'public')
const svg = fs.readFileSync(path.join(pub, 'favicon.svg'))

async function run() {
  // icon-192.png (192x192, solid background)
  await sharp(svg, { density: 600 })
    .resize(192, 192)
    .flatten({ background: '#E2E3E8' })
    .png()
    .toFile(path.join(pub, 'icon-192.png'))
  console.log('icon-192.png ✓')

  // icon-512.png (512x512, solid background)
  await sharp(svg, { density: 1600 })
    .resize(512, 512)
    .flatten({ background: '#E2E3E8' })
    .png()
    .toFile(path.join(pub, 'icon-512.png'))
  console.log('icon-512.png ✓')

  // favicon-32.png for ICO
  const buf32 = await sharp(svg, { density: 300 })
    .resize(32, 32)
    .flatten({ background: '#E2E3E8' })
    .png()
    .toBuffer()
  console.log('32x32 buffer ✓')

  // favicon-48.png for ICO
  const buf48 = await sharp(svg, { density: 300 })
    .resize(48, 48)
    .flatten({ background: '#E2E3E8' })
    .png()
    .toBuffer()
  console.log('48x48 buffer ✓')

  // Build ICO manually (multi-resolution)
  // ICO format: 6-byte header + 16-byte dir entries + PNG data
  const images = [
    { buf: buf32, w: 32, h: 32 },
    { buf: buf48, w: 48, h: 48 },
  ]
  const headerSize = 6
  const dirSize = 16 * images.length
  let dataOffset = headerSize + dirSize

  // ICO header
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  const dirs = []
  const datas = []
  for (const img of images) {
    const dir = Buffer.alloc(16)
    dir.writeUInt8(img.w >= 256 ? 0 : img.w, 0)
    dir.writeUInt8(img.h >= 256 ? 0 : img.h, 1)
    dir.writeUInt8(0, 2) // palette
    dir.writeUInt8(0, 3) // reserved
    dir.writeUInt16LE(1, 4) // color planes
    dir.writeUInt16LE(32, 6) // bits per pixel
    dir.writeUInt32LE(img.buf.length, 8) // size
    dir.writeUInt32LE(dataOffset, 12) // offset
    dirs.push(dir)
    datas.push(img.buf)
    dataOffset += img.buf.length
  }

  const ico = Buffer.concat([header, ...dirs, ...datas])
  fs.writeFileSync(path.join(pub, 'favicon.ico'), ico)
  console.log('favicon.ico ✓')

  // Verify apple-touch-icon
  const atMeta = await sharp(path.join(pub, 'apple-touch-icon.png')).metadata()
  console.log(`apple-touch-icon.png: ${atMeta.width}x${atMeta.height}, channels=${atMeta.channels} ✓`)
}

run().catch(e => { console.error(e); process.exit(1) })
