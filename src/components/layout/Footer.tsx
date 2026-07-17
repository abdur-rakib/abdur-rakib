import { site } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-border py-7">
      <div className="mx-auto flex max-w-[940px] flex-wrap items-center justify-between gap-3 px-6">
        <span className="text-sm text-muted">
          © {new Date().getFullYear()} {site.name}
        </span>
        <div className="flex gap-4">
          <a href={site.socials.github} className="text-sm text-muted hover:text-foreground">
            GitHub
          </a>
          <a href={site.socials.linkedin} className="text-sm text-muted hover:text-foreground">
            LinkedIn
          </a>
          <a href={site.socials.medium} className="text-sm text-muted hover:text-foreground">
            Medium
          </a>
        </div>
      </div>
    </footer>
  )
}
