import { useState, useEffect } from 'react'

/** Shared light/dark theme (localStorage key: vox-theme) */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const stored = localStorage.getItem('vox-theme')
      if (stored !== null) return stored !== 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('vox-theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}

/** Pill switch — same control on home, blog, FAQ, legal, setup */
export function ThemeSwitch({
  dark,
  onToggle,
  compact = false,
}: {
  dark: boolean
  onToggle: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition-colors ${
        compact ? 'h-4 w-7' : 'h-7 w-12'
      } ${dark ? 'border-white/10 bg-black/55 shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)]' : 'bg-muted border-border'}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform ${
          compact ? 'h-3 w-3' : 'h-5 w-5'
        } ${dark ? (compact ? 'translate-x-3' : 'translate-x-6') : 'translate-x-0.5'}`}
      />
    </button>
  )
}
