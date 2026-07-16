'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getSystemTheme)

  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle theme"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:text-foreground"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
