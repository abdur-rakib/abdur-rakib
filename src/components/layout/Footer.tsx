import { site } from '@/config/site'
import { GithubIcon, LinkedinIcon, MediumIcon } from '@/components/icons/BrandIcons'

export function Footer() {
  return (
    <footer className="border-t border-border py-7">
      <div className="mx-auto flex max-w-[940px] flex-wrap items-center justify-between gap-3 px-6">
        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {site.name}
        </span>
        <div className="flex gap-3.5">
          <a href={site.socials.github} aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
            <GithubIcon className="size-[18px]" />
          </a>
          <a href={site.socials.linkedin} aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
            <LinkedinIcon className="size-[18px]" />
          </a>
          <a href={site.socials.medium} aria-label="Medium" className="text-muted-foreground hover:text-foreground">
            <MediumIcon className="size-[18px]" />
          </a>
        </div>
      </div>
    </footer>
  )
}
