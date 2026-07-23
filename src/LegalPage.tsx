import './index.css'
export default function LegalPage() {
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
              <a href="#sms" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">SMS &amp; TCPA</a>
              <a href="#recording" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Call &amp; chat recording</a>
              <a href="#disclaimer" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Disclaimer</a>
              <a href="#fair-use" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Fair Use Policy</a>
              <a href="#compliance" className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Compliance Add-Ons</a>
            </nav>
          </aside>

          {/* Sections */}
          <div className="space-y-20">

          {/* Privacy Policy */}
          <section id="privacy" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Privacy Policy</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 20, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Information We Collect</h3>
                <p>When you submit a form on vox.chat, start an AI Receptionist conversation, or otherwise contact us, we collect the information you provide: your name, business name, phone number, email address, and any message you include. We may also process call or chat content when you use our demos or services. We do not collect information passively beyond standard server logs (IP address, browser type, pages visited) and analytics in aggregate.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">How We Use Your Information</h3>
                <p>We use the information you submit to respond to your inquiry, provide a consultation, deliver AI automation services, send transactional texts or emails related to your request, and improve our product. We do not sell, rent, or share your personal information with third parties for their marketing purposes.</p>
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
                <p>Under the California Consumer Privacy Act (CCPA), you have the right to know what personal information we collect, request deletion of your data, and opt out of any sale of personal information. We do not sell personal information. To exercise your rights, contact us at support@vox.chat.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Contact</h3>
                <p>For privacy-related questions, email <a href="mailto:support@vox.chat" className="text-primary hover:underline">support@vox.chat</a>.</p>
              </div>
            </div>
          </section>

          {/* Terms of Service */}
          <section id="terms" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Terms of Service</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 20, 2026</p>
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
                <p>You are responsible for providing accurate business information for AI agent training, maintaining the accuracy of your service offerings and pricing, and ensuring compliance with your own industry regulations regarding automated communications. If you use Vox to text or call your customers (for example review requests or appointment confirmations), you represent that you have obtained all required consent under the TCPA, state mini-TCPA laws, and carrier rules, and that you will honor opt-outs. You are solely responsible for the content of customer-facing messages sent on your behalf once configured.</p>
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

          {/* SMS & TCPA */}
          <section id="sms" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">SMS messaging &amp; TCPA</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 20, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">When we text you</h3>
                <p>
                  If you provide a mobile number on vox.chat (contact forms, setup, demos, or AI Receptionist), you consent to receive transactional
                  texts from Vox.chat related to your inquiry or service — for example confirmations, follow-ups, and support. Message frequency varies.
                  Message and data rates may apply. Carriers are not liable for delayed or undelivered messages.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Opt out</h3>
                <p>
                  Reply <strong className="text-foreground">STOP</strong> to any Vox text to opt out of further SMS from that program. Reply{' '}
                  <strong className="text-foreground">HELP</strong> for help, or email{' '}
                  <a href="mailto:support@vox.chat" className="text-primary hover:underline">
                    support@vox.chat
                  </a>
                  . You may still receive emails or calls related to an open service relationship unless you request otherwise.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Texts to your customers (client responsibility)</h3>
                <p>
                  When Vox automates SMS for your business (review requests, appointment reminders, etc.), those messages are sent on your behalf as the
                  business. You must have a lawful basis to contact each recipient (including prior express written consent where required under the
                  Telephone Consumer Protection Act and applicable state law). You must maintain opt-out processes and honor STOP requests. Vox provides
                  the tooling; you remain the sender of record for compliance purposes unless we agree otherwise in writing.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">No marketing spam</h3>
                <p>
                  We do not sell your number. We do not use your contact details for unrelated third-party marketing lists. Program descriptions and
                  consent language on our forms are part of this policy.
                </p>
              </div>
            </div>
          </section>

          {/* Call & chat recording */}
          <section id="recording" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Call &amp; chat recording</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 20, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">What we record</h3>
                <p>
                  Voice agent calls and AI Receptionist conversations may be recorded and/or transcribed for quality assurance, training, dispute
                  resolution, and to deliver summaries, bookings, and notifications to the business owner. Demo interactions on vox.chat may also be
                  logged for product improvement and lead follow-up.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Notice &amp; consent</h3>
                <p>
                  Where required by law, callers or chat participants will be notified that the interaction may be recorded (for example via an automated
                  disclosure at the start of a call). You acknowledge that California and some other states require consent of all parties for certain
                  recordings; as a Vox client you agree to configure scripts and disclosures appropriate to your service area and to obtain any consent
                  your jurisdiction requires.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Access &amp; retention</h3>
                <p>
                  Recordings and transcripts are shared with the subscribing business and may be stored by Vox and its infrastructure providers for a
                  limited period. Request deletion by contacting{' '}
                  <a href="mailto:support@vox.chat" className="text-primary hover:underline">
                    support@vox.chat
                  </a>
                  , subject to legal hold and operational needs.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">AI systems</h3>
                <p>
                  Recordings may be processed by AI models to generate transcripts, extract lead fields, and improve agent quality. Automated systems are
                  not a substitute for legal advice or human judgment in regulated situations.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Disclaimer</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 20, 2026</p>
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

          {/* Fair Use Policy */}
          <section id="fair-use" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Fair Use Policy</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 23, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Flat-Rate Promise</h3>
                <p>Vox.chat services are offered at a flat monthly rate with no per-minute or per-message charges. This Fair Use Policy ensures every customer gets reliable, high-quality service without a small number of accounts driving costs that affect everyone.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Included Usage</h3>
                <p>Each package includes generous monthly allowances designed to cover the vast majority of small and mid-size businesses:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Reviews — up to 5,000 SMS messages</li>
                  <li>Receptionist — up to 5,000 web chat sessions</li>
                  <li>Voice — up to 5,000 voice minutes</li>
                  <li>Bundle — up to 5,000 voice minutes, 5,000 SMS messages, and 5,000 web chat sessions</li>
                </ul>
                <p className="mt-2">These allowances are not hard caps. Occasional spikes — a busy week, a seasonal rush — are expected and will never trigger a surprise charge.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Exceeding the Allowance</h3>
                <p>If your account regularly exceeds the included allowance for two or more consecutive billing cycles, we will notify you with your actual usage data and work together to find the right fit. Options may include moving to a higher-tier plan, a custom volume agreement, or optimizing your setup to reduce unnecessary usage. We will never silently add per-minute or per-message charges to your invoice. Any pricing change requires mutual written agreement.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">What Counts as Usage</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Voice minutes are measured from call pickup to hangup, rounded to the nearest minute.</li>
                  <li>SMS messages count each sent and received message as one unit.</li>
                  <li>Web chat sessions count each unique visitor conversation as one session.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">What Doesn't Count</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Calls that go unanswered or hit voicemail before the AI engages</li>
                  <li>System-generated alerts or notifications to you (the business owner)</li>
                  <li>Test calls and setup/configuration activity</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Prohibited Use</h3>
                <p>This service is for your business's customer-facing communications. It may not be used for bulk or automated outbound telemarketing or robocalling, reselling Vox.chat services to third parties, artificially inflating usage, or any use that violates applicable telecommunications law (TCPA, etc.). Violation of prohibited use may result in immediate suspension.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Changes to This Policy</h3>
                <p>We may update usage allowances or thresholds with 30 days' written notice. Any changes apply to the next billing cycle, never retroactively.</p>
              </div>
            </div>
          </section>

          {/* Compliance & Security Add-Ons */}
          <section id="compliance" className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 pb-3 border-b border-border/60">Compliance &amp; Security Add-Ons</h2>
            <p className="text-xs text-muted-foreground mb-6">Last updated: July 23, 2026</p>
            <div className="space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>For businesses in healthcare, finance, or other regulated industries, Vox.chat offers optional compliance add-ons billed monthly in addition to your package price.</p>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">HIPAA Compliance — $2,500/mo</h3>
                <p>Required for any business handling Protected Health Information (PHI) over voice or messaging. Includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>HIPAA-compliant voice AI infrastructure</li>
                  <li>Business Associate Agreement (BAA) execution</li>
                  <li>Encrypted call handling and storage meeting HIPAA technical safeguards</li>
                  <li>Compliance configuration and ongoing monitoring</li>
                  <li>Annual compliance review and documentation</li>
                </ul>
                <p className="mt-2">Who needs this: Medical and dental practices, behavioral health providers, home health agencies, telehealth services, medical billing companies, or any business where callers may disclose health information.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Zero Data Retention (ZDR) — $1,500/mo</h3>
                <p>For businesses that require no call data, transcripts, or recordings to be stored after processing. Includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Real-time processing with no persistent storage of call content</li>
                  <li>No transcripts, recordings, or conversation logs retained</li>
                  <li>Immediate purge of all call data after the session ends</li>
                  <li>Compliance documentation confirming zero-retention architecture</li>
                </ul>
                <p className="mt-2">Who needs this: Legal firms, financial advisors, businesses with strict data minimization policies, or any organization where retaining customer conversation data poses regulatory or liability risk.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Compliance Bundle — $3,500/mo</h3>
                <p>Both HIPAA Compliance and Zero Data Retention together, saving $500/mo versus purchasing separately. Recommended for healthcare organizations that need the highest level of data protection.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Important Notes</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Compliance add-ons apply to your entire Vox.chat account — they cannot be enabled per-assistant or per-phone-number.</li>
                  <li>Activation requires a brief compliance intake (typically 1–2 business days) to configure your environment correctly.</li>
                  <li>HIPAA compliance requires a signed BAA before activation. We will provide the BAA for your review.</li>
                  <li>Compliance add-ons are billed month-to-month with no long-term commitment, same as your core package.</li>
                  <li>Removing a compliance add-on requires 30 days' written notice and confirmation that you no longer handle regulated data through Vox.chat.</li>
                </ul>
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
            <a href="mailto:support@vox.chat" aria-label="Email us" className="text-muted-foreground/50 hover:text-foreground transition-colors">
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
