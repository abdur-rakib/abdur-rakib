import Link from 'next/link'
import { site } from '@/config/site'

const SOCIAL_LABELS: Record<keyof typeof site.socials, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  medium: 'Medium',
  devto: 'dev.to',
  hashnode: 'Hashnode',
}

export function Hero() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          <span>📍</span>
          <span>{site.location}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="mt-3 text-lg text-muted">{site.role}</p>
      </div>
      <p className="max-w-[60ch] text-base leading-relaxed">{site.bio}</p>
      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/blog"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Read the blog
        </Link>
        <Link
          href="/resume"
          className="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm font-medium"
        >
          View résumé
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(site.socials) as (keyof typeof site.socials)[]).map((key) => (
          <a
            key={key}
            href={site.socials[key]}
            className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            {SOCIAL_LABELS[key]}
          </a>
        ))}
        <a
          href={`mailto:${site.email}`}
          className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted hover:text-foreground"
        >
          Email
        </a>
      </div>
    </div>
  )
}
