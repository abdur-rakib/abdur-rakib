'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { site } from '@/config/site'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[940px] items-center gap-2 px-6">
        <Link href="/" className="mr-auto flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            AR
          </span>
          {site.name}
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'rounded-lg bg-panel-2 px-3 py-1.5 text-sm font-medium text-foreground'
                    : 'rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
