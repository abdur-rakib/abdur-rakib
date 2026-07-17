import { site } from '@/config/site'

export function ResumeEmbed() {
  const previewUrl = `https://drive.google.com/file/d/${site.resumeDriveFileId}/preview`
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${site.resumeDriveFileId}`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Résumé</h1>
          <p className="mt-1 text-muted-foreground">{site.role}</p>
        </div>
        <a
          href={downloadUrl}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Download PDF
        </a>
      </div>
      <iframe
        src={previewUrl}
        title={`${site.name} résumé`}
        className="min-h-[80vh] w-full rounded-xl border border-border"
        allow="autoplay"
      />
    </div>
  )
}
