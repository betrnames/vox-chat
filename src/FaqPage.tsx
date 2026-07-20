import { useState, useEffect } from 'react'
import './index.css'

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('vox-theme')
    if (stored) return stored === 'dark'
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('vox-theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}

const categories = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    questions: [
      {
        id: 'setup-time',
        q: 'How quickly can I get set up with Vox.chat?',
        a: 'We handle all the setup — you just share your services, pricing, and preferences, and we build your custom AI agent. There\'s no software to install, no code to write, and no hardware to buy.',
      },
      {
        id: 'technical-skills',
        q: 'Do I need any technical skills to use Vox.chat?',
        a: 'None at all. We handle the entire setup, including phone forwarding, AI Receptionist setup, and AI review agent configuration. You just run your business. If you can answer a few questions about your services, you\'re ready.',
      },
      {
        id: 'onboarding',
        q: 'What does the onboarding process look like?',
        a: 'Step 1: You tell us about your business — services offered, service area, hours, and how you want calls handled. Step 2: We build and train your custom AI agent. Step 3: We activate call forwarding and/or your AI Receptionist. You get a notification the moment your first customer reaches out.',
      },
    ],
  },
  {
    id: 'voice-agent',
    label: 'AI Voice Agent',
    questions: [
      {
        id: 'robotic-voice',
        q: 'Will the AI sound robotic to my customers?',
        a: 'No. Our voice agents use natural-sounding AI with custom scripts tailored to your brand voice. Callers often can\'t tell they\'re speaking with AI. We match the tone to your business — professional for commercial HVAC, friendly for residential plumbing, etc.',
      },
      {
        id: 'after-hours',
        q: 'How does the AI voice agent handle after-hours calls?',
        a: 'The AI answers every call 24/7, including weekends and holidays. It qualifies the caller, captures their contact info and service needs, books available appointments, and sends you an instant notification. Emergency calls can be flagged and routed to your on-call number.',
      },
      {
        id: 'cant-answer',
        q: 'What happens if the AI can\'t answer a question?',
        a: 'The AI captures the caller\'s information and immediately notifies you via text and email so you can follow up personally. No customer is ever missed. For complex questions outside its training, it offers to schedule a callback with your team.',
      },
      {
        id: 'call-volume',
        q: 'How many calls can the AI handle at once?',
        a: 'There\'s no limit. Unlike a human receptionist, the AI can handle unlimited simultaneous calls. During peak hours — like when a heat wave hits and every AC in town breaks — you\'ll never hear a busy signal or get sent to voicemail.',
      },
    ],
  },
  {
    id: 'receptionist',
    label: 'AI Receptionist',
    questions: [
      {
        id: 'custom-training',
        q: 'Can the AI Receptionist be trained on my specific services and pricing?',
        a: 'Yes. We custom-train the AI Receptionist on your service menu, pricing, service areas, FAQs, and brand voice. It answers questions specific to your business — not generic responses. When your pricing changes, we update the training within 24 hours.',
      },
      {
        id: 'receptionist-languages',
        q: 'Does the AI Receptionist support multiple languages?',
        a: 'Yes. The AI Receptionist can communicate in English and Spanish out of the box. This is especially valuable for service businesses in bilingual markets — your Spanish-speaking customers get the same quality experience as English speakers.',
      },
      {
        id: 'receptionist-notifications',
        q: 'How do I get notified when the AI Receptionist books a customer?',
        a: 'Notifications are sent instantly via your choice of email, SMS, or directly into your CRM (ServiceTitan, Housecall Pro, Jobber, etc.). You get the customer\'s name, phone number, service needed, and preferred appointment time — all handled automatically.',
      },
    ],
  },
  {
    id: 'reviews',
    label: 'AI Review Agent',
    questions: [
      {
        id: 'negative-reviews',
        q: 'How does the AI review agent prevent negative reviews?',
        a: 'The system sends a private satisfaction check first. Happy customers get directed to Google Reviews. Unhappy customers are routed to you privately so you can resolve the issue before it becomes public. This filters negative sentiment before it hits your profile.',
      },
      {
        id: 'review-timing',
        q: 'When does the review request get sent?',
        a: 'The first text goes out 2 hours after the job is marked complete — close enough that the experience is fresh, but with enough gap that the customer has had time to appreciate the work. If they don\'t respond, a polite follow-up goes out at 48 hours.',
      },
      {
        id: 'review-platforms',
        q: 'Which review platforms are supported?',
        a: 'We primarily target Google Business Profile reviews since they have the highest impact on local SEO and Maps visibility. We can also direct customers to Yelp, Facebook, or industry-specific platforms like Angi or HomeAdvisor based on your preference.',
      },
    ],
  },
  {
    id: 'business',
    label: 'Business & Billing',
    questions: [
      {
        id: 'business-types',
        q: 'What types of businesses use Vox.chat?',
        a: 'We serve local service businesses — HVAC contractors, plumbers, electricians, roofers, landscapers, auto repair shops, pest control, cleaning services, and any business that relies on phone calls and online customers. If people call you to book work, we can help.',
      },
      {
        id: 'not-lead-gen',
        q: 'Is Vox.chat a lead generation service?',
        a: 'No. Vox.chat is AI automation for your business operations — we automate the calls, chats, and review follow-ups you\'re already getting so nothing falls through the cracks. We don\'t generate leads. We make sure the customers already trying to reach you get answered, booked, and followed up with — automatically. That\'s where your ROI comes from.',
      },
      {
        id: 'cancel',
        q: 'Can I cancel anytime?',
        a: 'Yes. There are no long-term contracts. You can cancel or pause your subscription at any time with no penalties. We believe in earning your business every month, not locking you in.',
      },
      {
        id: 'roi',
        q: 'What\'s the ROI for a typical service business?',
        a: 'Most service businesses see 300%+ ROI within the first month. The average HVAC company misses $2,500/week in calls alone. Answering even half those calls typically pays for the entire subscription many times over.',
      },
      {
        id: 'integrations',
        q: 'Do you integrate with my existing CRM or scheduling software?',
        a: 'Yes. We integrate with most popular CRMs (ServiceTitan, Housecall Pro, Jobber, etc.) and scheduling tools. Customer info flows directly into your existing workflow — no manual data entry required.',
      },
      {
        id: 'service-area',
        q: 'What areas do you serve?',
        a: 'Vox.chat works with service businesses nationwide across the United States. Our AI agents handle calls in English and Spanish. Setup is fully remote — we work with businesses in every state.',
      },
    ],
  },
]

export default function FaqPage() {
  const { dark, toggle } = useTheme()
  const [activeSection, setActiveSection] = useState(categories[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    categories.forEach((cat) => {
      const el = document.getElementById(cat.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-1.5" aria-label="Vox.chat">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Back to home
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-28 sm:pt-32 pb-12 px-5">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <span className="text-foreground">FAQ</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Everything you need to know about AI automation for your service business. Can't find what you're looking for? <a href="/#contact" className="text-primary hover:underline">Get in touch</a>.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
          {/* Left Nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === cat.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {cat.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* FAQ Content - all visible for SEO */}
          <div className="space-y-16">
            {categories.map((cat) => (
              <section key={cat.id} id={cat.id}>
                <h2 className="font-serif text-2xl font-bold mb-8 pb-3 border-b border-border/60">
                  {cat.label}
                </h2>
                <div className="space-y-10">
                  {cat.questions.map((faq) => (
                    <article key={faq.id} id={faq.id} className="scroll-mt-24">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                        {faq.q}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* CTA */}
      <section className="py-16 px-5 bg-muted">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">Book a free consultation and we'll walk you through everything.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+12099967102"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call now
            </a>
            <a
              href="/#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-input text-muted-foreground font-medium text-sm hover:border-primary/40 hover:text-foreground transition-colors"
            >
              Fill out the form
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/50">
            <a href="/#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="/#demos" className="hover:text-foreground transition-colors">Demos</a>
            <a href="/faq.html" className="text-foreground">FAQ</a>
            <a href="/#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/legal.html" className="hover:text-foreground transition-colors">Legal</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:email@vox.chat" aria-label="Email us" className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href="https://x.com/voxdotchat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Vox.chat on X"
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </a>
            <span className="font-mono text-xs text-muted-foreground/50">&copy; {new Date().getFullYear()} Vox.chat</span>
          </div>
        </div>
      </footer>
    </>
  )
}
