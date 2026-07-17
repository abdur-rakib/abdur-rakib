import Link from 'next/link'
import { ArrowRight, Mail, MapPin } from 'lucide-react'
import { site } from '@/config/site'
import { GithubIcon, LinkedinIcon } from '@/components/icons/BrandIcons'

const SOCIALS: Record<'github' | 'linkedin', { label: string; icon: typeof GithubIcon }> = {
  github: { label: 'GitHub', icon: GithubIcon },
  linkedin: { label: 'LinkedIn', icon: LinkedinIcon },
}

export function Hero() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          <MapPin size={13} strokeWidth={2} />
          <span>{site.location}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{site.role}</p>
      </div>
      <p className="max-w-[60ch] text-base leading-relaxed">{site.bio}</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SOCIALS) as (keyof typeof SOCIALS)[]).map((key) => {
          const { label, icon: Icon } = SOCIALS[key]
          return (
            <a
              key={key}
              href={site.socials[key]}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Icon className="size-[15px]" />
              {label}
            </a>
          )
        })}
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Mail size={15} strokeWidth={2} />
          Email
        </a>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Read The Blog
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
        <Link
          href="/resume"
          className="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm font-medium"
        >
          View Resume
        </Link>
      </div>
    </div>
  )
}
