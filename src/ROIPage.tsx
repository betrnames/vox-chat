import { useState } from 'react'
import './index.css'
import { Footer } from './components/Footer'
import { MissedCallCalculator, HourlyCostComparison } from './components/ROICalculator'

type Section = 'calculator' | 'comparison'

const sections: { id: Section; label: string; dot: string }[] = [
  { id: 'calculator', label: 'Missed Call Calculator', dot: 'bg-voice' },
  { id: 'comparison', label: 'Hourly Cost Comparison', dot: 'bg-chat' },
]

export default function ROIPage() {
  const [active, setActive] = useState<Section>('calculator')

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-1.5" aria-label="Vox.chat">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get a quote
            </a>
          </div>
        </div>
      </nav>

      <header className="pt-28 sm:pt-32 pb-12 px-5">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <span className="text-foreground">ROI Calculator</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            ROI Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            The average contractor misses 27% of calls. 85% of those callers phone a competitor instead. See what that's costing you — and what Vox saves.
          </p>
        </div>
      </header>

      <main className="px-5 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active === s.id
                      ? 'text-foreground bg-muted font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 mb-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  active === s.id
                    ? s.id === 'calculator'
                      ? 'bg-voice/12 text-voice border-voice/30'
                      : 'bg-chat/12 text-chat border-chat/30'
                    : 'text-muted-foreground/50 hover:text-muted-foreground border-transparent'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="min-w-0">
            {active === 'calculator' ? <MissedCallCalculator /> : <HourlyCostComparison />}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
