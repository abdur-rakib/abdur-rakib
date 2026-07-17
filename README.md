# Portfolio Site

A personal portfolio built with Next.js. It has three sections: a **Home** page, a **Blog** page that
aggregates posts from dev.to, Hashnode, and Medium into a single filterable feed, and a **Resume** page
that embeds a local PDF (`public/resume.pdf`), with a download link alongside it.

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

To run the production image locally instead (build stage → minimal standalone runner, no hot reload):

```bash
docker compose --profile prod up web-prod
```

### Option B: Plain Node/pnpm

```bash
cp .env.example .env.local   # fill in the values, see "Environment variables" below
pnpm install
pnpm dev
```

Requires Node 22 and pnpm 9 (see `.github/workflows/ci.yml` for the exact versions CI uses).

## Environment variables

Copy `.env.example` to `.env.local` and fill these in:

| Variable               | Purpose                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| `DEVTO_USERNAME`       | dev.to username to pull blog posts from.                                |
| `HASHNODE_HOST`        | Hashnode publication host (e.g. `yourname.hashnode.dev`) to pull posts from. |
| `MEDIUM_USERNAME`      | Medium username to pull posts from.                                     |
| `REVALIDATE_SECRET`    | Shared secret checked against the `x-revalidate-secret` header on `POST /api/revalidate`, used by blog platform webhooks to trigger on-demand ISR revalidation. |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL of the deployed site (used for metadata, sitemap, RSS, etc.). |

## Test / build commands

```bash
pnpm test       # run the vitest suite
pnpm build      # production build
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint
```

## One-time manual setup

These steps require access to accounts (dev.to, Hashnode, GitHub, Vercel) that no agent has, so
they need to be done by hand, once, by the site owner.

### 1. Resume PDF

The Resume page embeds and links to `public/resume.pdf`, which is gitignored (large binary, keep
it out of the repo).

1. Export/save your resume as a PDF.
2. Drop it in `public/resume.pdf`.

### 2. Blog platform webhooks (instant revalidation)

Without webhooks, new posts still appear automatically, just up to the ISR revalidation window
(6 hours) later. Wiring up webhooks makes new posts show up within seconds of publishing.

Once the site is deployed and `REVALIDATE_SECRET` is set in the Vercel environment:

- **dev.to**: Settings → Extensions → Webhooks → add a webhook for event `article_updated`
  pointing at `https://<your-domain>/api/revalidate`, with header
  `x-revalidate-secret: <REVALIDATE_SECRET>`.
- **Hashnode**: Publication → Webhooks → add a webhook for events `post_published` and
  `post_updated` pointing at the same URL and header.

(Medium has no webhook support, so Medium posts always rely on the ISR window.)

### 3. GitHub Actions + Vercel deploy wiring

`.github/workflows/ci.yml` runs typecheck/lint/test/build on every PR. `.github/workflows/deploy.yml`
deploys to Vercel on push to `main`. Both need secrets configured once:

1. Push this repo to a GitHub remote (if not already).
2. Locally, run `vercel link` to connect the repo to a Vercel project — this creates
   `.vercel/project.json` containing `orgId` and `projectId`.
3. In GitHub: **Settings → Secrets and variables → Actions**, add these repo secrets:
   - `VERCEL_TOKEN` — from vercel.com → Account Settings → Tokens.
   - `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` — from `.vercel/project.json`.
   - `DEVTO_USERNAME`, `HASHNODE_HOST`, `MEDIUM_USERNAME`, `REVALIDATE_SECRET`,
     `NEXT_PUBLIC_SITE_URL` — same values as in `.env.local`.
4. In Vercel: **Project → Settings → Environment Variables**, add the same five app env vars
   (`DEVTO_USERNAME`, `HASHNODE_HOST`, `MEDIUM_USERNAME`, `REVALIDATE_SECRET`,
   `NEXT_PUBLIC_SITE_URL`) for the **Production** environment.

## Further reading

- Design spec: `docs/superpowers/specs/2026-07-16-portfolio-site-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-16-portfolio-site-implementation.md`
