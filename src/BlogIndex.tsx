import { useState, useEffect } from 'react'
import './index.css'
import { blogPosts } from './blog-data'

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

export default function BlogIndex() {
  const { dark, toggle } = useTheme()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="font-mono text-lg tracking-tight text-foreground">
            vox<span className="text-primary">.</span>chat
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
            Practical strategies on AI automation, lead capture, and reputation growth — written for contractors, not engineers.
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
          <a href="/" className="font-mono text-sm text-muted-foreground/50">
            vox<span className="text-primary">.</span>chat
          </a>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/50">
            <a href="/#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="/blog.html" className="text-foreground">Blog</a>
            <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="/#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/legal.html" className="hover:text-foreground transition-colors">Legal</a>
          </div>
          <div className="font-mono text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Vox.chat
          </div>
        </div>
      </footer>
    </>
  )
}
