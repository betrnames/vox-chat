import './index.css'
import { blogPosts } from './blog-data'
import { useTheme, ThemeSwitch } from './theme'

export default function BlogIndex() {
  const { dark, toggle } = useTheme()

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

      <header className="pt-28 sm:pt-32 pb-12 px-5">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <span className="text-foreground">Blog</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Insights for service businesses
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Practical strategies on AI automation, customer experience, and reputation growth — written for contractors, not engineers.
          </p>
        </div>
      </header>

      <main className="px-5 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {blogPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}.html`}
              className="group block rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-shadow duration-300 hover:shadow-[0_0_25px_-5px_var(--primary)] hover:border-primary/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{post.tag}</span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <span className="text-xs text-muted-foreground/50">{post.readTime}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{post.excerpt}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary">
                Read article
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/50">
            <a href="/#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="/blog.html" className="text-foreground">Blog</a>
            <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="/#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/legal.html" className="hover:text-foreground transition-colors">Legal</a>
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
