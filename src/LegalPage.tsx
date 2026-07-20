import './index.css'
import { useTheme, ThemeSwitch } from './theme'

export default function LegalPage() {
  const { dark, toggle } = useTheme()

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
            <ThemeSwitch dark={dark} onToggle={toggle} />
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
            <span className="text-foreground">Legal</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Legal
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Privacy policy, terms of service, and disclaimer for Vox.chat.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">

          {/* Left Nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <a href="#privacy" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Privacy Policy</a>
              <a href="#terms" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Terms of Service</a>
              <a href="#disclaimer" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Disclaimer</a>
            </nav>
          </aside>

          {/* Sections */}
          <div className="space-y-20">

          {/* Privacy Policy */}
          <section id="privacy" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Privacy Policy</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 18, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Information We Collect</h3>
                <p>When you submit a form on vox.chat, we collect the information you provide: your name, business name, phone number, email address, and any message you include. We do not collect information passively beyond standard server logs (IP address, browser type, pages visited).</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">How We Use Your Information</h3>
                <p>We use the information you submit solely to respond to your inquiry, provide a consultation, and deliver our AI automation services. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Third-Party Services</h3>
                <p>Form submissions are processed through Formspree, Inc., which temporarily stores your data to deliver it to us. Formspree's privacy policy applies to their handling of your data. We may also use analytics services to understand site traffic in aggregate.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Data Retention</h3>
                <p>We retain your contact information for as long as necessary to fulfill your request and maintain our business relationship. You may request deletion of your data at any time by emailing us.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Your Rights (California Residents)</h3>
                <p>Under the California Consumer Privacy Act (CCPA), you have the right to know what personal information we collect, request deletion of your data, and opt out of any sale of personal information. We do not sell personal information. To exercise your rights, contact us at contact@gabemariscal.com.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Contact</h3>
                <p>For privacy-related questions, email <a href="mailto:contact@gabemariscal.com" className="text-primary hover:underline">contact@gabemariscal.com</a>.</p>
              </div>
            </div>
          </section>

          {/* Terms of Service */}
          <section id="terms" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Terms of Service</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 18, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Agreement</h3>
                <p>By using vox.chat and our services, you agree to these terms. If you do not agree, please do not use the site or our services.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Services</h3>
                <p>Vox.chat provides AI-powered voice agents, AI Receptionists, and AI review agent services for local service businesses. Services are delivered on a subscription basis with no long-term contracts. We reserve the right to modify or discontinue services with reasonable notice.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Your Responsibilities</h3>
                <p>You are responsible for providing accurate business information for AI agent training, maintaining the accuracy of your service offerings and pricing, and ensuring compliance with your own industry regulations regarding automated communications.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">AI Disclosure</h3>
                <p>Our AI voice agents and AI Receptionists are artificial intelligence systems, not human operators. While designed to sound natural and provide accurate information based on your training data, they may occasionally provide imperfect responses. You acknowledge that AI-handled interactions are automated.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Limitation of Liability</h3>
                <p>Vox.chat is not liable for lost revenue, missed calls, or business outcomes resulting from AI agent performance, service interruptions, or technical issues. Our services are provided "as is" and we make no guarantees regarding specific business results.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Cancellation</h3>
                <p>You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial billing periods.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Modifications</h3>
                <p>We may update these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.</p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Disclaimer</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 18, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Results Disclaimer</h3>
                <p>Statistics, figures, and ROI claims referenced on this site (such as average revenue lost to missed calls or typical return on investment) are based on industry research and aggregated client data. They are illustrative and do not guarantee specific results for your business. Individual results vary based on industry, location, call volume, service quality, and other factors.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">No Professional Advice</h3>
                <p>Content on this site is for informational purposes only and does not constitute business, legal, or financial advice. Consult qualified professionals for advice specific to your situation.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Third-Party Links</h3>
                <p>This site may link to third-party websites or services. We are not responsible for the content, privacy practices, or availability of external sites.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">AI Technology</h3>
                <p>Our AI agents use advanced language models and voice synthesis technology. While highly capable, AI systems are not infallible. We continuously monitor and improve agent performance but cannot guarantee 100% accuracy in all interactions.</p>
              </div>
            </div>
          </section>

          </div>
        </div>
      </main>

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
            <a href="/blog.html" className="hover:text-foreground transition-colors">Blog</a>
            <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="/legal.html" className="text-foreground">Legal</a>
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
