import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Back home
      </Link>
    </div>
  )
}
