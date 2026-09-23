import { useEffect, useRef } from 'react'

type Node = { hx: number; hy: number; x: number; y: number }
type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number; blue: boolean }

/** Fine line grid plus tiny particles. The pointer pulls a small patch of the grid. */
export function HeroKinetic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !section || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
    let influence = 0
    let visible = true
    let running = true
    let raf = 0
    let cols = 0
    let nodes: Node[] = []
    let particles: Particle[] = []

    const at = (col: number, row: number) => nodes[row * cols + col]

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const gap = width < 640 ? 84 : 120
      cols = Math.ceil(width / gap) + 1
      const rows = Math.ceil(height / gap) + 1
      nodes = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gap
          const y = row * gap
          nodes.push({ hx: x, hy: y, x, y })
        }
      }

      const count = Math.min(220, Math.max(70, Math.round((width * height) / 7000)))
      particles = Array.from({ length: count }, () => {
        const clustered = Math.random() < 0.78
        const angle = Math.random() * Math.PI * 2
        const spread = Math.pow(Math.random(), 0.65)
        const x = clustered
          ? width * 0.58 + Math.cos(angle) * width * 0.24 * spread
          : Math.random() * width
        const y = clustered
          ? height * 0.48 + Math.sin(angle) * height * 0.32 * spread
          : Math.random() * height
        return {
          x, y,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          r: 0.35 + Math.random() * 0.55,
          a: 0.12 + Math.random() * 0.22,
          blue: Math.random() < 0.18,
        }
      })
    }

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      const dark = document.documentElement.classList.contains('dark')
      const line = dark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.04)'
      const dust = dark ? '255,255,255' : '30,35,44'
      const blue = dark ? '103,153,254' : '77,107,254'
      const radius = width < 640 ? 64 : 88
      const styles = getComputedStyle(document.documentElement)
      const narrow = width < 1024
      const media = narrow ? section.querySelector('[data-hero-media]') : null
      let bases = [0.4, 0.5, 0.58]
      let amp = height * 0.06
      if (media) {
        const canvasTop = canvas.getBoundingClientRect().top
        const under = media.getBoundingClientRect().bottom - canvasTop + 12
        const start = Math.min(height - 28, Math.max(0, under))
        bases = [start / height, (start + 12) / height, (start + 24) / height]
        amp = 14
      }
      const waves = [
        { color: styles.getPropertyValue('--voice').trim() || '#FF6B4A', base: bases[0], amp, phase: 0.4 },
        { color: styles.getPropertyValue('--chat').trim() || '#4A9EFF', base: bases[1], amp: amp * 1.15, phase: 1.7 },
        { color: styles.getPropertyValue('--review').trim() || '#FFB84A', base: bases[2], amp: amp * 0.85, phase: 3.1 },
      ]
      const rows = cols > 0 ? nodes.length / cols : 0

      if (mouse.tx > -1000) {
        mouse.x += (mouse.tx - mouse.x) * 0.16
        mouse.y += (mouse.ty - mouse.y) * 0.16
      }
      influence += ((mouse.tx > -1000 ? 1 : 0) - influence) * 0.08

      for (const node of nodes) {
        const dx = mouse.x - node.hx
        const dy = mouse.y - node.hy
        const dist = Math.hypot(dx, dy) || 1
        let ox = 0
        let oy = 0
        if (dist < radius && influence > 0.01) {
          const falloff = 1 - dist / radius
          const mag = falloff * falloff * 8 * influence
          ox = (dx / dist) * mag
          oy = (dy / dist) * mag
        }
        node.x += (node.hx + ox - node.x) * 0.2
        node.y += (node.hy + oy - node.y) * 0.2
      }

      ctx.lineWidth = 1.25
      ctx.lineCap = 'round'
      for (const wave of waves) {
        ctx.beginPath()
        ctx.strokeStyle = wave.color
        ctx.globalAlpha = 0.22
        for (let x = 0; x <= width; x += 10) {
          const nx = x / width
          let y = height * wave.base
            + Math.sin(nx * Math.PI * 2.1 + wave.phase) * wave.amp
            + Math.sin(nx * Math.PI * 4.2 + wave.phase * 0.7) * wave.amp * 0.28
          if (influence > 0.01 && mouse.x > -100) {
            const dist = Math.hypot(x - mouse.x, y - mouse.y)
            const reach = Math.min(width, height) * 0.42
            if (dist < reach) {
              const pull = (1 - dist / reach) ** 2 * influence * 0.55
              y += (mouse.y - y) * pull
            }
          }
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      ctx.strokeStyle = line
      ctx.lineWidth = 0.5
      for (let row = 0; row < rows; row++) {
        const first = at(0, row)
        ctx.beginPath()
        ctx.moveTo(first.x, first.y)
        for (let col = 1; col < cols; col++) {
          const node = at(col, row)
          ctx.lineTo(node.x, node.y)
        }
        ctx.stroke()
      }
      for (let col = 0; col < cols; col++) {
        const first = at(col, 0)
        ctx.beginPath()
        ctx.moveTo(first.x, first.y)
        for (let row = 1; row < rows; row++) {
          const node = at(col, row)
          ctx.lineTo(node.x, node.y)
        }
        ctx.stroke()
      }

      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -4) p.x = width + 4
          else if (p.x > width + 4) p.x = -4
          if (p.y < -4) p.y = height + 4
          else if (p.y > height + 4) p.y = -4
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < radius && influence > 0.01) {
            p.vx += (dx / dist) * 0.02 * influence
            p.vy += (dy / dist) * 0.02 * influence
          }
          p.vx = Math.max(-0.35, Math.min(0.35, p.vx * 0.99))
          p.vy = Math.max(-0.35, Math.min(0.35, p.vy * 0.99))
        }
        ctx.fillStyle = `rgba(${p.blue ? blue : dust},${p.a})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      if (!running) return
      if (visible) draw()
      raf = requestAnimationFrame(loop)
    }

    const place = (event: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = event.clientX - rect.left
      mouse.ty = event.clientY - rect.top
      if (mouse.x < -1000) {
        mouse.x = mouse.tx
        mouse.y = mouse.ty
      }
    }
    const leave = () => {
      mouse.tx = -9999
      mouse.ty = -9999
    }

    layout()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)

    section.addEventListener('pointermove', place)
    section.addEventListener('mousemove', place)
    section.addEventListener('pointerleave', leave)
    section.addEventListener('mouseleave', leave)
    const resize = new ResizeObserver(layout)
    resize.observe(canvas)
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    seen.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      section.removeEventListener('pointermove', place)
      section.removeEventListener('mousemove', place)
      section.removeEventListener('pointerleave', leave)
      section.removeEventListener('mouseleave', leave)
      resize.disconnect()
      seen.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)]"
      aria-hidden="true"
    />
  )
}
