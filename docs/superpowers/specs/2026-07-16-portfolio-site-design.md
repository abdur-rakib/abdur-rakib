# Portfolio Site — Design Spec

**Author:** Abdur Rakib
**Date:** 2026-07-16
**Status:** Approved design, ready for implementation plan

---

## Overview

Personal brand hub for a backend-focused senior software engineer. Three real
routes — Home, Blog, Resume — plus social links. Minimal, shadcn-neutral UI.
The blog is an aggregator that pulls posts from dev.to, Hashnode, and Medium
into one deduplicated feed. Resume is an embedded Google Drive PDF. Static-first,
$0/month hosting.

**Not in scope (cut during brainstorming):** projects pages/MDX collection,
About page, contact form. May be added later; not part of v1.

---

## Goals & Success Criteria

- One feed showing every post across all three platforms, each opening an
  internal detail page that links back to its canonical original.
- Resume always current without a redeploy (owner updates the Drive PDF).
- Lighthouse ≥ 90 across the board; correct SEO/canonical tags.
- Cost: $0/month (domain optional, ~$10/yr).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 (CSS-based `@theme` config — no `tailwind.config.ts`) + shadcn/ui (neutral) |
| Markdown render | `react-markdown` + `rehype-highlight` + `rehype-slug` |
| HTML sanitize | `sanitize-html` (Medium content) |
| XML parse | `fast-xml-parser` (Medium RSS) |
| Dev environment | Docker + Docker Compose (pnpm, hot reload) |
| CI/CD | GitHub Actions |
| Hosting | Vercel Hobby (free) |
| Package manager | pnpm |

---

## Pages / Routes

### `/` — Home
- **Hero:** name with a location chip ("📍 Dhaka, Bangladesh") beside/under the
  name, role line, one-liner bio, social pills, two CTAs (Read the blog → `/blog`,
  View résumé → `/resume`).
- **Latest writing:** 3 most recent posts from `getAllPosts()`, each a `PostCard`
  with source badge.
- Bio, role, location, and social URLs come from `src/config/site.ts` (see below).

### `/blog` — Blog index
- `export const dynamic = 'force-static'`; content refreshes on the next build.
- Grid of `PostCard` from `getAllPosts()`.
- **Source filter** (All / dev.to / Hashnode / Medium) — client component.
- **Tag filter** (All / per-tag) — client component.
- Each card: title, excerpt, date, reading-time estimate, `SourceBadge`, tags.
  (Cover image optional — render when a source provides one.)
- **Blog footer caption:** "Aggregated from dev.to · Hashnode · Medium" lives
  here (moved out of the page-top eyebrow).

### `/blog/[slug]` — Post page
- `export const dynamic = 'force-static'` and `dynamicParams = false`.
- `generateStaticParams()` includes every post returned by `getAllPosts()`.
- Every post renders on-site after sanitization when content is available; the
  detail page still links to the original platform source.
- Full body via sanitized HTML.
- `generateMetadata()` sets `alternates.canonical = post.originalUrl` and a
  `<link rel="canonical">`.
- The post page includes a link to the original source.

### `/resume` — Resume
- **Embedded Google Drive PDF** via preview iframe:
  `https://drive.google.com/file/d/{RESUME_DRIVE_FILE_ID}/preview`
- **Download button** → `https://drive.google.com/uc?export=download&id={RESUME_DRIVE_FILE_ID}`
- Drive file must be shared **"Anyone with the link — Viewer."**
- No `resume.json` rendering (the rendered-resume approach is dropped). The PDF
  is the single source of truth; owner updates Drive, no redeploy needed.
- `RESUME_DRIVE_FILE_ID` stored in `site.config.ts` (public, non-secret).
- Responsive: iframe scales full-width with a sensible min-height; on mobile the
  Download button is the primary path.

### `/api/revalidate` (optional, phase-gated)
- `POST` with header `x-revalidate-secret` matching `REVALIDATE_SECRET` env var.
- Calls `revalidatePath('/blog')`. Wired to dev.to + Hashnode webhooks for
  instant refresh. Medium relies on 6h ISR only.

---

## Data Layer

### Normalized types (`src/lib/types.ts`)
```ts
export type PostSource = 'devto' | 'hashnode' | 'medium'

export interface Post {
  id: string            // `${source}-${slug}`
  title: string
  slug: string
  excerpt: string
  content?: string      // full body; present for server-side post rendering
  contentFormat: 'markdown' | 'html'
  coverImage: string | null
  publishedAt: string   // ISO 8601
  tags: string[]
  source: PostSource    // Hashnode is preferred when a cross-post is available
  alsoOn: PostSource[]  // other platforms this post was cross-posted to
  originalUrl: string   // canonical href — always link back
  isPaywalled: boolean
}
```

`sanitizePostContent` sanitizes HTML before it is rendered on an on-site post
page. Every post card links to the corresponding internal `/blog/[slug]`
detail page; that page links to `originalUrl` for the canonical source.

### Source loaders (`src/lib/sources/`)
- **devto.ts** — `https://dev.to/api/articles?username={DEVTO_USERNAME}&per_page=100`;
  full body via `GET /api/articles/{id}` (`body_markdown`). No key. Render markdown.
- **hashnode.ts** — RSS `https://{HASHNODE_HOST}/rss.xml`; body `content:encoded`.
  No key. Render sanitized HTML on the on-site route when available.
- **medium.ts** — RSS `https://medium.com/feed/{MEDIUM_USERNAME}`; parse with
  `fast-xml-parser`; body `content:encoded`. Sanitize with `sanitize-html`
  (allowlist: `p, a, strong, em, h1–h6, ul, ol, li, blockquote, pre, code, img,
  figure, figcaption`). Strip 1×1 tracking pixels. `isPaywalled = true` when
  stripped content < 500 chars. Allowlist image domains
  (`cdn-images-1.medium.com`, `miro.medium.com`) in `next.config.ts`.

### Aggregation (`src/lib/aggregate.ts`)
```ts
const postsPromise = (async (): Promise<Post[]> => {
  const results = await Promise.allSettled([fetchDevto(), fetchHashnode(), fetchMedium()])
  const posts = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<Post[]>).value)
  return dedupeAndSort(posts)
})

export const getAllPosts = () => postsPromise
```
- `Promise.allSettled` — one platform down must not crash the page.
- Dedupe cross-posts by normalized title slug: prefer the Hashnode copy as the
  primary (`source`) when present, preserve the earliest `publishedAt`, and
  record the other platforms in `alsoOn`.
- Sort by `publishedAt` desc.

---

## Site Config (`src/config/site.ts`)

Single source of truth for identity content (replaces `resume.json`):
```ts
export const site = {
  name: 'Abdur Rakib',
  role: 'Senior Software Engineer · Backend-Focused Full Stack',
  location: 'Dhaka, Bangladesh',
  bio: '...one-liner...',
  email: 'abdurrakib961@gmail.com',
  socials: {
    github: 'https://github.com/abdur-rakib',
    linkedin: 'https://linkedin.com/in/abdurrakibcseruet',
    medium: 'https://medium.com/@abdur-rakib',
    devto: '...', hashnode: '...',
  },
  resumeDriveFileId: '<google-drive-file-id>',
}
```

---

## Components

- `layout/` — `Navbar` (Home/Blog/Resume + theme toggle), `Footer` (socials, copyright)
- `home/` — `Hero`, `LatestPosts`
- `blog/` — `PostCard`, `SourceBadge`, `SourceFilter`, `TagFilter`, `PostBody`
- `resume/` — `ResumeEmbed` (Drive iframe + download button)
- `ui/` — shadcn components

---

## Visual Direction

shadcn-neutral: zinc-based neutral palette with a restrained indigo accent used
sparingly (links, primary buttons). System font stack; monospace for source
badges, tags, and tech chips. Full light + dark via CSS-variable tokens with a
toggle. Generous whitespace, subtle borders, `max-width ~940px` reading column.

Reference mockup (static, placeholder content): the approved Artifact demo.

---

## Rendering / Freshness Strategy (Static Export)

| Platform | Strategy |
|---|---|
| Hashnode | static export at build time |
| Medium | static export at build time |

Home, blog, post, and sitemap routes use `dynamic = 'force-static'`.

---

## SEO

- `generateMetadata` on every route.
- `alternates.canonical = post.originalUrl` on all blog post pages.
- `app/sitemap.ts` (static + blog + every post detail route), `app/robots.ts`.
- `app/opengraph-image.tsx` + per-post dynamic OG via `ImageResponse`.
- `next/font` for zero layout shift (or system stack — no webfont CDN needed).

---

## Infra

### Docker (local dev)
- `docker/Dockerfile.dev` — `node:22-alpine`, pnpm, hot reload.
- `docker-compose.yml` — port 3000, bind mount with anonymous `node_modules`/`.next`
  volumes, `env_file: .env.local`.

### Environment variables
```
DEVTO_USERNAME=
HASHNODE_HOST=
MEDIUM_USERNAME=
REVALIDATE_SECRET=      # only if /api/revalidate is enabled
```
(`RESUME_DRIVE_FILE_ID` is public → lives in `site.config.ts`, not env.)
Committed `.env.example`; gitignored `.env.local`.

### CI/CD (GitHub Actions)
- `ci.yml` — on PR to `main`: install (frozen lockfile), `tsc --noEmit`, lint, build.
- `deploy.yml` — on push to `main`: deploy to Vercel (`--prod`) via `vercel-action`.
- Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DEVTO_USERNAME`,
  `HASHNODE_HOST`, `MEDIUM_USERNAME`, `REVALIDATE_SECRET`.

### Hosting
Vercel Hobby. `vercel link` once → copy IDs to GitHub secrets → set env vars in
Vercel dashboard. Push to `main` deploys; PRs get preview URLs.

---

## Error Handling

- Any source loader failing → excluded from feed (`allSettled`), page still renders.
- Empty feed (all sources down/empty) → friendly empty state, not a crash.
- Medium sanitize failure → skip that post rather than render unsafe HTML.
- Drive PDF unreachable → Download button remains as fallback path.

---

## Testing

- Unit: each source loader (mocked HTTP) → correct normalized `Post[]`.
- Unit: `dedupeAndSort` — Hashnode wins cross-post primacy while the earliest
  date is preserved, badges merge, and results sort desc.
- Unit: Medium sanitize — strips tracking pixels, enforces tag allowlist, paywall detection.
- Build check: `generateStaticParams` produces routes for all posts.
- Lighthouse ≥ 90 (performance, a11y, best-practices, SEO) on `/`, `/blog`, a post, `/resume`.

---

## Build Phases

| Phase | Work |
|---|---|
| 1 | Scaffold Next.js 15, Tailwind v4, shadcn/ui, Docker, ESLint, TS strict |
| 2 | Layout, Navbar, Footer, dark/light theme, typography, `site.config.ts` |
| 3 | Home (Hero + location chip + socials + CTAs) |
| 4 | dev.to loader → blog index → post page (end to end) |
| 5 | Hashnode loader |
| 6 | Medium loader + sanitize + paywall detection |
| 7 | Dedupe, source filter, tag filter, SourceBadge, blog footer caption |
| 8 | Resume page — Drive PDF embed + download |
| 9 | `/api/revalidate` + dev.to/Hashnode webhooks (optional) |
| 10 | SEO, sitemap, OG images, Lighthouse ≥ 90 |
| 11 | GitHub Actions CI + deploy + secrets |
| 12 | Vercel link, env vars, domain (optional) |

---

## Cost

| Item | Cost |
|---|---|
| Vercel Hobby | $0/mo |
| GitHub Actions (public repo) | $0/mo |
| dev.to / Hashnode / Medium APIs | $0 |
| Google Drive (resume PDF) | $0 |
| Domain (optional) | ~$10/yr |
| **Total** | **$0/mo** |
