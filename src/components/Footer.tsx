interface FooterProps {
  activePage?: 'home' | 'blog' | 'faq' | 'legal'
  homePadding?: boolean
}

const cities = [
  'Modesto','Turlock','Stockton','Tracy','Manteca','Ceres','Salida',
  'Ripon','Escalon','Oakdale','Patterson','Newman','Livingston','Lodi',
  'Merced','Atwater','Los Banos','Empire','Hughson','Denair','Keyes',
  'Hilmar','Delhi','Waterford',
]

export function Footer({ activePage = 'home', homePadding = false }: FooterProps) {
  const anchor = (hash: string) => activePage === 'home' ? hash : `/${hash}`
  const link = (page: string) =>
    activePage === page ? 'text-sm text-foreground transition-colors' : 'text-sm text-muted-foreground/60 hover:text-foreground transition-colors'

  return (
    <footer className={`border-t border-border pt-12 ${homePadding ? 'pb-24 sm:pb-12' : 'pb-12'} px-6 sm:px-10`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-voice" />
              <span className="w-2 h-2 rounded-full bg-chat" />
              <span className="w-2 h-2 rounded-full bg-review" />
            </div>
            <p className="text-sm text-muted-foreground/60 leading-relaxed">
              AI voice, chat, and review automation for local service businesses.
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:support@vox.chat" aria-label="Email us" className="text-muted-foreground/40 hover:text-foreground transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a href="https://x.com/voxdotchat" target="_blank" rel="noopener noreferrer" aria-label="Vox.chat on X" className="text-muted-foreground/40 hover:text-foreground transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40">Services</span>
            <div className="flex flex-col gap-2">
              <a href={anchor('#services')} className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-voice" />Vox Voice
              </a>
              <a href={anchor('#services')} className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chat" />Vox Receptionist
              </a>
              <a href={anchor('#services')} className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-review" />Vox Reviews
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40">Resources</span>
            <div className="flex flex-col gap-2">
              <a href="/blog.html" className={link('blog')}>Blog</a>
              <a href="/faq.html" className={link('faq')}>FAQ</a>
              <a href={anchor('#contact')} className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors">Contact</a>
              <a href="/llms.txt" className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors">llms.txt</a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40">Company</span>
            <div className="flex flex-col gap-2">
              <a href="/legal.html" className={link('legal')}>Terms & Privacy</a>
              <a href="mailto:support@vox.chat" className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors">support@vox.chat</a>
              <a href="https://betrnames.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors">BetrNames</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/20">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/30 mb-3">Service Area</p>
          <p className="text-[13px] text-muted-foreground/40 leading-relaxed">
            {cities.map((city, i) => (
              <span key={city}>
                {city}
                {i < cities.length - 1 && <span className="mx-1.5 text-muted-foreground/20">&middot;</span>}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-border/10 flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground/60">&copy; {new Date().getFullYear()} Vox.chat</span>
          <span className="font-mono text-[11px] text-muted-foreground/60">Your business. Never offline.</span>
        </div>
      </div>
    </footer>
  )
}
