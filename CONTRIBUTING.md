# Portfolio Site — Development Notes

> **This is the `github` branch** — a static-export build for GitHub Pages, served at the root
> (`abdur-rakib.github.io`), which requires this repo to be named exactly `abdur-rakib.github.io`.
> It diverges from `main` (which deploys to Vercel with ISR): `output: 'export'` in
> `next.config.ts`, no `/api/revalidate` route (static export can't run server code), and pages use
> `dynamic = 'force-static'` instead of `revalidate` — content is frozen at build time and only
> updates on the next push to this branch.

A personal portfolio built with Next.js. It has a **Home** page and a **Blog** page that aggregates
posts from Hashnode and Medium into a single filterable feed. "View Resume" links (Home hero, Navbar)
open `public/resume.pdf` directly in a new tab — there's no dedicated Resume page.

## Local development

### Option A: Docker (recommended)

```bash
cp .env.example .env.local   # fill in the values, see "Environment variables" below
docker compose up
```

`docker/Dockerfile` is a single multi-stage file (`dev` / `build` / `runner` stages); `docker-compose.yml`
picks which one runs. The default `web` service builds the `dev` stage and runs `pnpm dev` with the repo
mounted as a volume so edits on the host hot-reload. The site is available at
[http://localhost:3000](http://localhost:3000).

The `web-prod` profile (minimal standalone runner) does **not** work on this branch —
`output: 'export'` doesn't produce `.next/standalone`, which the runner stage requires. Use
`pnpm build` (see below) to test the actual static export instead.

### Option B: Plain Node/pnpm

```bash
cp .env.example .env.local   # fill in the values, see "Environment variables" below
pnpm install
pnpm dev
```

Requires Node 22 and pnpm 9 (see `.github/workflows/ci.yml` for the exact versions CI uses).

## Environment variables

Copy `.env.example` to `.env.local` and fill these in:

| Variable                 | Purpose                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| `HASHNODE_HOST`          | Hashnode publication host (e.g. `yourname.hashnode.dev`) to pull posts from. |
| `MEDIUM_USERNAME`        | Medium username to pull posts from.                                     |
| `NEXT_PUBLIC_SITE_URL`   | Canonical public URL of the deployed site (used for metadata, sitemap, robots). On this branch: `https://abdur-rakib.github.io`. |
| `NEXT_PUBLIC_BASE_PATH`  | Only needed if this ever moves to a project-page subpath instead of the root. Unset here — prefixes raw asset links (e.g. the résumé PDF) that Next's `basePath` doesn't auto-rewrite. |

## Test / build commands

```bash
pnpm test       # run the vitest suite
pnpm build      # production build
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint
```

## One-time manual setup

These steps require access to accounts (Hashnode, GitHub, Vercel) that no agent has, so
they need to be done by hand, once, by the site owner.

### 1. Resume PDF

"View Resume" links open `public/resume.pdf` directly, committed to the repo so it ships with
every deploy (a gitignored file never reaches a static export).

1. Export/save your resume as a PDF.
2. Drop it in `public/resume.pdf` and commit it.

### 2. Content freshness

There's no ISR and no revalidation webhook on this branch — `dynamic = 'force-static'` means the
Home and Blog pages are frozen at build time. New Hashnode/Medium posts only appear after the next
push to `github` triggers a rebuild (see below). If you want near-live updates, push regularly or
add a scheduled (`on: schedule`) trigger to `.github/workflows/pages.yml`.

### 3. GitHub Pages deploy wiring

`.github/workflows/pages.yml` runs typecheck/lint/test, builds the static export, and deploys it to
GitHub Pages on every push to the `github` branch.

1. This repo must be named exactly `abdur-rakib.github.io` — that exact name is what makes GitHub
   serve it as a **root user page** with no subpath/`basePath` needed. Any other repo name deploys
   as a project page at `<name>.github.io/<repo>` instead, which needs `basePath` back in
   `next.config.ts` plus `NEXT_PUBLIC_BASE_PATH`/`NEXT_PUBLIC_SITE_URL` in `pages.yml` updated to
   match.
2. In GitHub: **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. In GitHub: **Settings → Secrets and variables → Actions → Variables tab**, add repo variables
   `HASHNODE_HOST` and `MEDIUM_USERNAME` (same values as `.env.local`). These are plain variables,
   not secrets — they're just a public subdomain and a public @handle, nothing confidential.
4. Push to `github` (or merge into it). The workflow builds and deploys automatically; check the
   **Actions** tab for progress and the deployed URL.

## Further reading

- Design spec: `docs/superpowers/specs/2026-07-16-portfolio-site-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-16-portfolio-site-implementation.md`
