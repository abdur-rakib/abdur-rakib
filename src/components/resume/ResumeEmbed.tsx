import { Download } from 'lucide-react'
import { site } from '@/config/site'

export function ResumeEmbed() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
          <p className="mt-1 text-muted-foreground">{site.role}</p>
        </div>
        <a
          href="/resume.pdf"
          download
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Download size={15} strokeWidth={2} />
          Download PDF
        </a>
      </div>
      <hr className="border-border" />
      <iframe
        src="/resume.pdf#toolbar=0&navpanes=0"
        title={`${site.name} resume`}
        className="min-h-[80vh] w-full rounded-xl border border-border"
      />
    </div>
  )
}
