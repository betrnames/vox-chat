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

function getSlugFromPath() {
  const path = window.location.pathname
  const match = path.match(/\/blog\/(.+?)(?:\.html)?$/)
  return match ? match[1] : null
}

export default function BlogPost() {
  const { dark, toggle } = useTheme()
  const slug = getSlugFromPath()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <a href="/blog.html" className="text-primary hover:underline">Back to blog</a>
        </div>
      </div>
    )
  }

  const currentIndex = blogPosts.findIndex((p) => p.slug === slug)
  const nextPost = blogPosts[currentIndex + 1] || blogPosts[0]
  const prevPost = blogPosts[currentIndex - 1] || blogPosts[blogPosts.length - 1]

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
              href="/blog.html"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              All posts
            </a>
          </div>
        </div>
      </nav>

      <article className="pt-28 sm:pt-32 pb-16 px-5">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <a href="/blog.html" className="hover:text-foreground transition-colors">Blog</a>
            <span>/</span>
            <span className="text-foreground truncate">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{post.tag}</span>
              <span className="text-sm text-muted-foreground">{post.date}</span>
              <span className="text-sm text-muted-foreground/50">{post.readTime}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Content */}
          <div className="space-y-10">
            {post.content.map((section, i) => (
              <section key={i}>
                <h2 className="font-serif text-xl sm:text-2xl font-bold mb-4">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed text-base">{section.body}</p>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center">
            <h3 className="font-serif text-xl font-bold mb-2">Ready to automate your business?</h3>
            <p className="text-sm text-muted-foreground mb-5">Book a free consultation — no contracts, cancel anytime.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:+12099967102"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors"
              >
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

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-border/60 grid sm:grid-cols-2 gap-4">
            <a
              href={`/blog/${prevPost.slug}.html`}
              className="group rounded-xl border border-border/60 p-4 hover:border-primary/30 transition-colors"
            >
              <span className="text-xs text-muted-foreground/50">Previous</span>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors mt-1">{prevPost.title}</p>
            </a>
            <a
              href={`/blog/${nextPost.slug}.html`}
              className="group rounded-xl border border-border/60 p-4 hover:border-primary/30 transition-colors text-right"
            >
              <span className="text-xs text-muted-foreground/50">Next</span>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors mt-1">{nextPost.title}</p>
            </a>
          </div>
        </div>
      </article>

      <footer className="border-t border-border py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/50">
            <a href="/#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="/blog.html" className="hover:text-foreground transition-colors">Blog</a>
            <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="/#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/legal.html" className="hover:text-foreground transition-colors">Legal</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:email@vox.chat" aria-label="Email us" className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <span className="font-mono text-xs text-muted-foreground/50">&copy; {new Date().getFullYear()} Vox.chat</span>
          </div>
        </div>
      </footer>
    </>
  )
}
