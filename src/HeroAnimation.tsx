import { useEffect, useRef, useState, useCallback } from 'react'

const animCSS = `
#VH.vh-root{position:relative;width:100%;aspect-ratio:16/10;background:#0e1a30;overflow:hidden;font-family:'Inter',system-ui,sans-serif;color:#fff;border-radius:16px}
@media(max-width:640px){#VH.vh-root{aspect-ratio:4/5;min-height:360px}}
.vh-sc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;z-index:3;padding:8px}
.vh-house-scene{position:absolute;inset:0;z-index:1;transition:transform 2s cubic-bezier(0.25,0.46,0.45,0.94)}
.vh-sky{position:absolute;inset:0;background:linear-gradient(180deg,#111d3a 0%,#1a2d50 40%,#243a5e 70%,#2a4468 100%)}
.vh-stars-bg{position:absolute;inset:0}
.vh-star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%}
.vh-ground{position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(180deg,#1a2a1e 0%,#0f1a12 100%)}
.vh-street{position:absolute;bottom:0;left:0;right:0;height:8%;background:#1a1a1a}
.vh-street-line{position:absolute;bottom:3.5%;left:0;right:0;height:2px;background:repeating-linear-gradient(90deg,#444 0,#444 30px,transparent 30px,transparent 60px)}
.vh-house{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);width:min(340px,60%);height:min(260px,50%)}
.vh-house-body{position:absolute;bottom:0;left:20px;right:20px;height:69%;background:linear-gradient(180deg,#2a3040 0%,#252a35 100%);border-radius:4px 4px 0 0}
.vh-roof{position:absolute;bottom:67%;left:-3%;right:-3%;height:0;border-left:min(180px,51%) solid transparent;border-right:min(180px,51%) solid transparent;border-bottom:min(90px,26%) solid #1e2530}
.vh-door{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:44px;height:72px;background:#1a1e28;border-radius:3px 3px 0 0;border:2px solid #333}
.vh-door-knob{position:absolute;right:6px;top:40px;width:5px;height:5px;border-radius:50%;background:#888}
.vh-window{position:absolute;width:50px;height:45px;background:rgba(255,180,74,0.15);border:2px solid #333;border-radius:2px}
.vh-window.lit{background:rgba(255,180,74,0.35);box-shadow:0 0 20px rgba(255,180,74,0.15)}
.vh-window-left{left:30px;bottom:46%}
.vh-window-right{right:30px;bottom:46%}
.vh-chimney{position:absolute;right:50px;bottom:92%;width:30px;height:50px;background:#1e2530;border-radius:2px 2px 0 0}
.vh-porch-light{position:absolute;bottom:55%;left:50%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:#FFB84A;box-shadow:0 0 15px rgba(255,184,74,0.5)}
.vh-mailbox{position:absolute;bottom:0;left:-15%}
.vh-mailbox-box{width:20px;height:14px;background:#333;border-radius:2px;border:1px solid #444}
.vh-mailbox-post{width:4px;height:25px;background:#444;margin:0 auto}
.vh-tree{position:absolute;bottom:0}
.vh-tree-trunk{width:12px;height:50px;background:#2a1f15;margin:0 auto;border-radius:2px}
.vh-tree-top{width:60px;height:70px;background:radial-gradient(ellipse,#1a3020,#0f2018);border-radius:50%;margin-bottom:-8px}
.vh-phone-float{position:absolute;z-index:5;opacity:0;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.6);transition:all 1.2s cubic-bezier(0.25,0.46,0.45,0.94)}
.vh-phone-float.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
.vh-phone-frame{width:min(200px,42vw);height:min(370px,75vw);background:#111827;border-radius:min(28px,5vw);border:2px solid rgba(255,255,255,0.1);position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.7)}
.vh-phone-notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:50px;height:5px;background:#0a0e17;border-radius:3px;z-index:5}
.vh-phone-screen{position:absolute;top:8px;left:6px;right:6px;bottom:8px;border-radius:min(22px,4vw);background:#0b0f19;overflow:hidden}
.vh-chat-header{padding:22px 10px 8px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:6px}
.vh-chat-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#FF6B4A,#4A9EFF);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0}
.vh-chat-name{font-size:11px;font-weight:600;color:rgba(255,255,255,0.8)}
.vh-chat-status{font-size:8px;color:#4A9EFF;font-weight:500}
.vh-chat-area{padding:8px;display:flex;flex-direction:column;gap:6px}
.vh-mb{padding:7px 10px;border-radius:12px;font-size:clamp(8px,2vw,11px);line-height:1.45;max-width:85%;opacity:0;transform:translateY(10px)}
.vh-ai{background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);align-self:flex-start}
.vh-cu{background:rgba(255,107,74,0.08);border:1px solid rgba(255,107,74,0.12);align-self:flex-end}
.vh-tag{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px}
.vh-tag-a{color:#4A9EFF}
.vh-tag-c{color:#FF6B4A}
.vh-quick-actions{padding:4px 8px;display:flex;flex-wrap:wrap;gap:3px;opacity:0}
.vh-qa-btn{font-size:8px;padding:4px 8px;border-radius:10px;background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4A9EFF;font-weight:500;white-space:nowrap}
.vh-side-badge{position:absolute;z-index:6;top:50%;right:min(4%,16px);transform:translateY(30%);background:rgba(74,158,255,0.12);border:1px solid rgba(74,158,255,0.25);border-radius:14px;padding:8px 14px;color:#4A9EFF;display:flex;align-items:center;gap:8px;opacity:0}
.vh-booked-dot{width:8px;height:8px;border-radius:50%;background:#4A9EFF;flex-shrink:0}
.vh-scan{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(74,158,255,0.4),transparent);z-index:6;opacity:0}
.vh-stat-row{display:flex;gap:clamp(12px,4vw,40px);margin-top:12px;flex-wrap:wrap;justify-content:center}
.vh-stat-card{text-align:center}
.vh-stat-num{font-size:clamp(24px,6vw,48px);font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-0.02em}
.vh-stat-label{font-size:clamp(8px,1.8vw,13px);color:rgba(255,255,255,0.4);margin-top:2px}
@keyframes vhFi{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes vhFiLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes vhSlam{0%{opacity:0;transform:scale(1.6)}40%{opacity:1;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
@keyframes vhFadeScale{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes vhTwinkle{0%,100%{opacity:0.2}50%{opacity:0.9}}
@keyframes vhScanDown{from{top:0;opacity:1}to{top:100%;opacity:0}}
@keyframes vhRingPulse{0%{box-shadow:0 0 0 0 rgba(74,158,255,0.4)}70%{box-shadow:0 0 0 12px rgba(74,158,255,0)}100%{box-shadow:0 0 0 0 rgba(74,158,255,0)}}
`

/*
 * HeroAnimation — kinetic text + house-zoom promo that plays in the hero right column.
 * Auto-starts on mount, loops: animation (~23s) → onFinish callback → 5s pause → replay.
 * All CSS is scoped under #VH to avoid collisions with the rest of the page.
 */

export default function HeroAnimation({ onFinish }: { onFinish?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [iteration, setIteration] = useState(0)

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  /* Schedule a callback at `ms` into the animation */
  const at = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])

  /* Reset every animated element to initial opacity / transform */
  const resetElements = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    // scenes
    root.querySelectorAll<HTMLElement>('.vh-sc').forEach(el => {
      el.style.transition = 'none'
      el.style.opacity = '0'
    })
    // all individually animated spans
    const ids = [
      'vh-s1pre','vh-s1time','vh-s1sub',
      'vh-s2a','vh-s2b',
      'vh-s5pre','vh-s5big','vh-s5stats',
      'vh-s6dots','vh-s6name','vh-s6tag',
      'vh-m1','vh-m2','vh-m3','vh-m4','vh-m5',
      'vh-qa','vh-bookedBadge','vh-sideBadge',
    ]
    ids.forEach(id => {
      const el = root.querySelector<HTMLElement>(`#${id}`)
      if (!el) return
      el.style.transition = 'none'
      el.style.opacity = '0'
      el.style.transform = ''
      el.style.animation = 'none'
    })
    // phone
    const pf = root.querySelector<HTMLElement>('#vh-phoneFloat')
    if (pf) { pf.style.transition = 'none'; pf.style.opacity = '0'; pf.style.transform = 'translate(-50%,-50%) scale(0.6)'; pf.classList.remove('show') }
    // house scene
    const hs = root.querySelector<HTMLElement>('#vh-houseScene')
    if (hs) { hs.style.transition = 'none'; hs.style.transform = 'none'; hs.style.opacity = '1' }
    // window
    const wr = root.querySelector<HTMLElement>('.vh-window-right')
    if (wr) wr.classList.remove('lit')
    // scan
    const scan = root.querySelector<HTMLElement>('#vh-scan')
    if (scan) scan.style.animation = 'none'
  }, [])

  /* Helper: animate an element */
  const anim = useCallback((el: HTMLElement | null, name: string, dur: number) => {
    if (!el) return
    el.style.opacity = '1'
    el.style.animation = `${name} ${dur}ms ease-out forwards`
  }, [])
  const showS = useCallback((id: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`#${id}`)
    if (el) el.style.opacity = '1'
  }, [])
  const hideS = useCallback((id: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`#${id}`)
    if (!el) return
    el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'
    timersRef.current.push(setTimeout(() => { el.style.transition = 'none' }, 600))
  }, [])
  const showM = useCallback((id: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`#${id}`)
    if (!el) return
    el.style.opacity = '1'; el.style.transform = 'translateY(0)'
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
  }, [])
  const flash = useCallback(() => {
    const s = rootRef.current?.querySelector<HTMLElement>('#vh-scan')
    if (!s) return
    s.style.animation = 'vhScanDown 1.2s linear forwards'
    timersRef.current.push(setTimeout(() => { s.style.animation = 'none' }, 1300))
  }, [])
  const countUp = useCallback((el: HTMLElement | null, target: number, prefix: string, dur: number) => {
    if (!el) return
    const start = performance.now()
    const fmt = (n: number) => prefix + n.toLocaleString()
    ;(function tick() {
      const p = Math.min((performance.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      el.textContent = fmt(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(tick)
    })()
  }, [])

  const $ = useCallback((id: string) => rootRef.current?.querySelector<HTMLElement>(`#${id}`) ?? null, [])

  /* Main timeline */
  const runAnimation = useCallback(() => {
    clearAll()
    resetElements()
    // force reflow so resets apply
    rootRef.current?.offsetHeight

    at(0, () => { showS('vh-s1'); anim($('vh-s1pre'), 'vhFi', 400) })
    at(400, () => anim($('vh-s1time'), 'vhSlam', 500))
    at(1500, () => anim($('vh-s1sub'), 'vhFi', 600))
    at(2000, () => { rootRef.current?.querySelector('.vh-window-right')?.classList.add('lit') })
    at(3800, () => hideS('vh-s1'))

    at(4200, () => { showS('vh-s2'); anim($('vh-s2a'), 'vhFiLeft', 500) })
    at(5200, () => { anim($('vh-s2b'), 'vhSlam', 400); flash() })
    at(5800, () => {
      const hs = $('vh-houseScene')
      if (hs) { hs.style.transition = 'transform 2s cubic-bezier(0.25,0.46,0.45,0.94)'; hs.style.transform = 'scale(3.5) translate(0%, 15%)' }
    })
    at(6800, () => hideS('vh-s2'))

    at(7500, () => {
      const pf = $('vh-phoneFloat')
      if (pf) { pf.classList.add('show'); pf.style.opacity = '1'; pf.style.transform = 'translate(-50%,-50%) scale(1)'; pf.style.transition = 'all 1.2s cubic-bezier(0.25,0.46,0.45,0.94)' }
    })
    at(8200, () => showM('vh-m1'))
    at(9200, () => { const qa = $('vh-qa'); if (qa) { qa.style.opacity = '1'; qa.style.animation = 'vhFi 0.3s ease-out forwards' } })
    at(10500, () => { const qa = $('vh-qa'); if (qa) qa.style.opacity = '0'; showM('vh-m2') })
    at(12500, () => showM('vh-m3'))
    at(14500, () => showM('vh-m4'))
    at(16200, () => { showM('vh-m5'); flash() })
    at(17000, () => {
      const sb = $('vh-sideBadge')
      if (sb) { sb.style.opacity = '1'; sb.style.animation = 'vhFadeScale 0.5s ease-out forwards, vhRingPulse 1.5s ease-out 0.5s' }
    })

    at(19500, () => {
      const pf = $('vh-phoneFloat')
      if (pf) { pf.style.transition = 'all 0.8s ease'; pf.style.opacity = '0'; pf.style.transform = 'translate(-50%,-50%) scale(0.8)' }
      const sb = $('vh-sideBadge')
      if (sb) { sb.style.transition = 'opacity 0.8s'; sb.style.opacity = '0' }
      const hs = $('vh-houseScene')
      if (hs) { hs.style.transition = 'opacity 0.8s'; hs.style.opacity = '0' }
    })

    at(20500, () => { showS('vh-s5'); anim($('vh-s5pre'), 'vhFi', 300) })
    at(21000, () => { anim($('vh-s5big'), 'vhSlam', 500); flash() })
    at(21800, () => {
      const el = $('vh-s5stats')
      if (el) { el.style.opacity = '1'; el.style.animation = 'vhFi 0.5s ease-out forwards' }
      countUp($('vh-ct1'), 3800, '$', 1200)
    })
    at(24800, () => hideS('vh-s5'))

    at(25200, () => { showS('vh-s6'); anim($('vh-s6dots'), 'vhFadeScale', 400) })
    at(25600, () => anim($('vh-s6name'), 'vhSlam', 500))
    at(26200, () => anim($('vh-s6tag'), 'vhFi', 600))

    // Signal finish after endcard
    at(28000, () => { onFinish?.() })
  }, [clearAll, resetElements, at, anim, showS, hideS, showM, flash, countUp, $, onFinish])

  useEffect(() => {
    // Generate stars on mount
    const sc = rootRef.current?.querySelector('#vh-stars')
    if (sc && sc.children.length === 0) {
      for (let i = 0; i < 60; i++) {
        const s = document.createElement('div')
        s.className = 'vh-star'
        s.style.left = Math.random() * 100 + '%'
        s.style.top = Math.random() * 55 + '%'
        s.style.opacity = String(Math.random() * 0.5 + 0.15)
        s.style.animation = `vhTwinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`
        if (Math.random() > 0.85) { s.style.width = '3px'; s.style.height = '3px' }
        sc.appendChild(s)
      }
    }
    runAnimation()
    return clearAll
  }, [iteration, runAnimation, clearAll])

  /* Public restart method via iteration bump */
  const restart = useCallback(() => {
    clearAll()
    setIteration(i => i + 1)
  }, [clearAll])

  // Expose restart to parent via ref if needed
  useEffect(() => {
    const el = rootRef.current
    if (el) (el as any).__restart = restart
  }, [restart])

  return (
    <>
      <style>{animCSS}</style>
      <div ref={rootRef} id="VH" className="vh-root">
        {/* House scene */}
        <div className="vh-house-scene" id="vh-houseScene">
          <div className="vh-sky" />
          <div className="vh-stars-bg" id="vh-stars" />
          <div className="vh-ground" />
          <div className="vh-street" />
          <div className="vh-street-line" />

          <div className="vh-tree" style={{ left: '8%', bottom: '8%' }}>
            <div className="vh-tree-top" /><div className="vh-tree-trunk" />
          </div>
          <div className="vh-tree" style={{ left: '18%', bottom: '8%' }}>
            <div className="vh-tree-top" style={{ width: 45, height: 55 }} /><div className="vh-tree-trunk" style={{ height: 40 }} />
          </div>
          <div className="vh-tree" style={{ right: '5%', bottom: '8%' }}>
            <div className="vh-tree-top" style={{ width: 50, height: 60 }} /><div className="vh-tree-trunk" style={{ height: 45 }} />
          </div>

          <div className="vh-house">
            <div className="vh-chimney" />
            <div className="vh-roof" />
            <div className="vh-house-body">
              <div className="vh-window vh-window-left lit" />
              <div className="vh-window vh-window-right" />
              <div className="vh-door"><div className="vh-door-knob" /></div>
              <div className="vh-porch-light" />
            </div>
            <div className="vh-mailbox"><div className="vh-mailbox-box" /><div className="vh-mailbox-post" /></div>
          </div>
        </div>

        {/* Phone */}
        <div className="vh-phone-float" id="vh-phoneFloat">
          <div className="vh-phone-frame">
            <div className="vh-phone-notch" />
            <div className="vh-phone-screen">
              <div className="vh-chat-header">
                <div className="vh-chat-avatar">V</div>
                <div><div className="vh-chat-name">Valley Air Pros</div><div className="vh-chat-status">AI Receptionist</div></div>
              </div>
              <div className="vh-chat-area">
                <div className="vh-mb vh-ai" id="vh-m1"><div className="vh-tag vh-tag-a">Vox AI</div>Hi — I'm the AI Receptionist. How can I help?</div>
                <div className="vh-quick-actions" id="vh-qa">
                  <div className="vh-qa-btn">Schedule a repair</div>
                  <div className="vh-qa-btn">Get a quote</div>
                </div>
                <div className="vh-mb vh-cu" id="vh-m2"><div className="vh-tag vh-tag-c">Homeowner</div>The AC just stopped working. It's 104° and I have kids.</div>
                <div className="vh-mb vh-ai" id="vh-m3"><div className="vh-tag vh-tag-a">Vox AI</div>I have a tech available tomorrow at 8 AM. Can I book it?</div>
                <div className="vh-mb vh-cu" id="vh-m4"><div className="vh-tag vh-tag-c">Homeowner</div>Yes please — 2841 Elm St.</div>
                <div className="vh-mb vh-ai" id="vh-m5"><div className="vh-tag vh-tag-a">Vox AI</div>Booked! Confirmation text sent.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side badge — outside phone on the right */}
        <div className="vh-side-badge" id="vh-sideBadge">
          <div className="vh-booked-dot" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 11 }}>APPOINTMENT CONFIRMED</div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>Tomorrow · 8:00 AM · AC Repair</div>
          </div>
        </div>

        <div className="vh-scan" id="vh-scan" />

        {/* Scene overlays */}
        <div className="vh-sc" id="vh-s1" style={{ gap: 6, zIndex: 4 }}>
          <div id="vh-s1pre" style={{ fontSize: 'clamp(10px,2.5vw,16px)', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', opacity: 0 }}>Late night emergency</div>
          <div id="vh-s1time" style={{ fontSize: 'clamp(36px,10vw,80px)', fontWeight: 900, letterSpacing: '-0.03em', opacity: 0 }}>11:47 PM</div>
          <div id="vh-s1sub" style={{ fontSize: 'clamp(16px,3.5vw,32px)', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em', opacity: 0 }}>The AC just stopped working.</div>
        </div>

        <div className="vh-sc" id="vh-s2" style={{ gap: 8, zIndex: 4 }}>
          <div id="vh-s2a" style={{ fontSize: 'clamp(16px,4vw,36px)', fontWeight: 300, color: 'rgba(255,255,255,0.5)', opacity: 0 }}>A homeowner searches for help.</div>
          <div id="vh-s2b" style={{ fontSize: 'clamp(24px,6vw,52px)', fontWeight: 800, opacity: 0 }}>Your AI answers first.</div>
        </div>

        <div className="vh-sc" id="vh-s5" style={{ gap: 8, zIndex: 7 }}>
          <div id="vh-s5pre" style={{ fontSize: 'clamp(10px,2vw,15px)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', opacity: 0 }}>One chat. One booking.</div>
          <div id="vh-s5big" style={{ fontSize: 'clamp(28px,7vw,64px)', fontWeight: 900, letterSpacing: '-0.03em', opacity: 0 }}>While you were asleep.</div>
          <div className="vh-stat-row" id="vh-s5stats" style={{ opacity: 0 }}>
            <div className="vh-stat-card"><div className="vh-stat-num" style={{ color: '#FF6B4A' }} id="vh-ct1">0</div><div className="vh-stat-label">Revenue booked</div></div>
            <div className="vh-stat-card"><div className="vh-stat-num" style={{ color: '#4A9EFF' }}>8 AM</div><div className="vh-stat-label">Tech dispatched</div></div>
            <div className="vh-stat-card"><div className="vh-stat-num" style={{ color: '#FFB84A' }}>5<span style={{ fontSize: '60%' }}>★</span></div><div className="vh-stat-label">Review incoming</div></div>
          </div>
        </div>

        <div className="vh-sc" id="vh-s6" style={{ gap: 14, zIndex: 7 }}>
          <div id="vh-s6dots" style={{ display: 'flex', gap: 8, opacity: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF6B4A' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4A9EFF' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFB84A' }} />
          </div>
          <div id="vh-s6name" style={{ fontSize: 'clamp(28px,7vw,56px)', fontWeight: 700, letterSpacing: '-0.02em', opacity: 0 }}>Vox.chat</div>
          <div id="vh-s6tag" style={{ fontSize: 'clamp(12px,3vw,22px)', fontWeight: 400, color: '#FF6B4A', opacity: 0 }}>Your AI books jobs while you sleep.</div>
        </div>
      </div>
    </>
  )
}
