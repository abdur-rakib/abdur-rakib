# Portfolio Site

A personal portfolio built with Next.js. It has three sections: a **Home** page, a **Blog** page that
aggregates posts from Hashnode and Medium into a single filterable feed, and a **Resume** page
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

These steps require access to accounts (Hashnode, GitHub, Vercel) that no agent has, so
they need to be done by hand, once, by the site owner.

### 1. Resume PDF

The Resume page embeds and links to `public/resume.pdf`, committed to the repo so it ships with
every deploy (Vercel builds only from git — a gitignored file never reaches production).

1. Export/save your resume as a PDF.
2. Drop it in `public/resume.pdf` and commit it.

### 2. Blog platform webhooks (instant revalidation)

Without webhooks, new posts still appear automatically, just up to the ISR revalidation window
(6 hours) later. Wiring up webhooks makes new posts show up within seconds of publishing.

Once the site is deployed and `REVALIDATE_SECRET` is set in the Vercel environment:

- **Hashnode**: Publication → Webhooks → add a webhook for events `post_published` and
  `post_updated` pointing at the same URL and header.

(Medium has no webhook support, so Medium posts always rely on the ISR window.)

### 3. Deploy wiring

`.github/workflows/ci.yml` runs typecheck/lint/test/build on every PR — it doesn't deploy anything.
Deployment is handled by Vercel's native GitHub integration (connected via the Vercel dashboard or
`vercel link`), which auto-builds and deploys on every push to `main`, independent of GitHub Actions.

1. Push this repo to a GitHub remote (if not already).
2. In Vercel: **Add New → Project**, import the GitHub repo. This connects Vercel's GitHub App,
   which then deploys automatically on every push to `main` (and creates preview deploys for PRs).
3. In Vercel: **Project → Settings → Environment Variables**, add the app env vars
   (`HASHNODE_HOST`, `MEDIUM_USERNAME`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`) for the
   **Production** environment.

## Further reading

- Design spec: `docs/superpowers/specs/2026-07-16-portfolio-site-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-16-portfolio-site-implementation.md`
