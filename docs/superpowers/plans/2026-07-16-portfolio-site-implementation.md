# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio site — Home, Blog (aggregated from dev.to/Hashnode/Medium), Resume (embedded Google Drive PDF) — per `docs/superpowers/specs/2026-07-16-portfolio-site-design.md`.

**Architecture:** Next.js 15 App Router, static-first with ISR (6h) on blog routes. A data layer (`src/lib/`) normalizes three external blog sources into one `Post[]` shape, deduplicates cross-posts, and feeds server components. No database, no auth. Resume is a Google Drive PDF embedded via iframe — no rendering pipeline.

**Tech Stack:** Next.js 15 (TypeScript strict, App Router), Tailwind CSS v4 + shadcn/ui, react-markdown + rehype-highlight + rehype-slug, sanitize-html, fast-xml-parser, Vitest + Testing Library, Docker + Docker Compose, GitHub Actions, Vercel Hobby, pnpm, Node 22.

## Global Constraints

- Next.js 15, App Router, TypeScript strict mode. (spec: Tech Stack)
- Tailwind CSS v4 uses CSS-based `@theme` config — no `tailwind.config.ts`. (spec: Tech Stack)
- Package manager: pnpm. Node version: 22. (spec: Tech Stack, Docker)
- Home, blog, post, and sitemap routes use `dynamic = 'force-static'`; content
  refreshes on the next static build. (spec: Rendering Strategy)
- All blog post pages set `alternates.canonical = post.originalUrl`. (spec: SEO)
- Medium sanitize allowlist: `p, a, strong, em, h1–h6, ul, ol, li, blockquote, pre, code, img, figure, figcaption`. Strip `<img>` with width/height of `1`. (spec: Blog Sources)
- Medium `isPaywalled = true` when sanitized content is under 500 characters. (spec: Blog Sources)
- Medium image domains allowlisted in `next.config.ts`: `cdn-images-1.medium.com`, `miro.medium.com`. (spec: Blog Sources)
- Cross-post dedupe: normalize by title slug, prefer Hashnode as primary when
  present, preserve the earliest `publishedAt`, and record other platforms in
  `alsoOn`. (spec: Data Layer)
- All three source fetches run through `Promise.allSettled` — one platform failing must not crash the page. (spec: Aggregation)
- No projects pages, no About page, no contact form (cut from scope). (spec: Overview)
- No `resume.json` rendering — resume is a Google Drive PDF embed only. `resumeDriveFileId` is public, stored in `src/config/site.ts`, not an env var. (spec: Resume)
- Cost target: $0/month (Vercel Hobby, GitHub Actions on a public repo, free source APIs). (spec: Cost)

---

## Task 1: Project scaffold — Next.js, Tailwind v4, shadcn/ui, Docker, Vitest

**Files:**
- Create: entire project scaffold via `create-next-app` (package.json, tsconfig.json, next.config.ts, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, eslint config, .gitignore)
- Create: `components.json` (via shadcn init)
- Create: `docker/Dockerfile.dev`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add scripts + test deps)

**Interfaces:**
- Produces: a running `pnpm dev` server at `localhost:3000`, a passing `pnpm build`, a working `pnpm test` (Vitest), path alias `@/*` → `src/*`, Tailwind v4 wired, shadcn `Button` component available at `@/components/ui/button`.

- [ ] **Step 1: Scaffold the Next.js app**

Run from `/Users/md.rakib/Desktop/portfolio-site`:

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

When prompted, accept defaults (React 19, no additional options). This auto-runs `git init` and creates the first commit-ready tree with `.gitignore` already covering `node_modules`, `.next`, `.env*.local`.

- [ ] **Step 2: Verify Tailwind v4 CSS-based config**

```bash
cat src/app/globals.css | head -5
ls tailwind.config.ts 2>&1
```

Expected: `globals.css` starts with `@import "tailwindcss";` and `tailwind.config.ts` reports "No such file" — Tailwind v4 has no JS config file. If a `tailwind.config.ts` was generated (older CLI), delete it: `rm -f tailwind.config.ts`.

- [ ] **Step 3: Add the Tailwind typography plugin**

```bash
pnpm add -D @tailwindcss/typography
```

Add to the top of `src/app/globals.css` (after the `@import "tailwindcss";` line):

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Initialize shadcn/ui and add Button**

```bash
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button -y
```

Expected: creates `components.json`, `src/lib/utils.ts` (exports `cn()`), and `src/components/ui/button.tsx`.

- [ ] **Step 5: Add runtime dependencies**

```bash
pnpm add react-markdown rehype-highlight rehype-slug sanitize-html fast-xml-parser
```

- [ ] **Step 6: Add test tooling**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/sanitize-html
```

- [ ] **Step 7: Create Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 8: Add scripts to package.json**

Edit `package.json` `"scripts"` block to include:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

- [ ] **Step 9: Write a scaffold smoke test**

Create `src/app/page.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from './page'

describe('scaffold smoke test', () => {
  it('renders without crashing', () => {
    render(<Page />)
    expect(screen.getByRole('main')).toBeTruthy()
  })
})
```

This will fail until Task 15 replaces the default `page.tsx` with the real Home page (which renders a `<main>` via the root layout — the default scaffold page has no `<main>` role). For now, run it to confirm Vitest itself works end-to-end:

```bash
pnpm test
```

Expected: FAIL (no element with role "main" — the default Next.js starter page doesn't include a `<main>` landmark). This confirms Vitest is wired correctly; it will pass once Task 12 (root layout) and Task 15 (home page) land. Leave the file as-is — later tasks overwrite `page.tsx`.

- [ ] **Step 10: Verify typecheck, lint, build**

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all three succeed (the failing test from Step 9 does not block `build`).

- [ ] **Step 11: Docker dev environment**

Create `docker/Dockerfile.dev`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]
```

Create `docker-compose.yml`:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
    env_file:
      - .env.local
    command: pnpm dev
```

- [ ] **Step 12: Env var files**

Create `.env.example`:

```
DEVTO_USERNAME=
HASHNODE_HOST=
MEDIUM_USERNAME=
REVALIDATE_SECRET=
NEXT_PUBLIC_SITE_URL=
```

Create `.env.local` (this file must NOT be committed — confirm it's covered by `.gitignore`, generated by create-next-app):

```
DEVTO_USERNAME=abdur-rakib
HASHNODE_HOST=abdur-rakib.hashnode.dev
MEDIUM_USERNAME=@abdur-rakib
REVALIDATE_SECRET=change-me-locally
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
grep -q '.env*.local' .gitignore && echo "gitignored" || echo "MISSING — add .env*.local to .gitignore"
```

Expected: `gitignored`.

- [ ] **Step 13: Validate Docker build**

```bash
docker compose config >/dev/null && echo "compose file valid"
docker compose build
```

Expected: `compose file valid`, then a successful image build.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 + Tailwind v4 + shadcn/ui + Docker + Vitest"
```

---

## Task 2: Site config and shared types

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/config/site.ts`
- Create: `src/config/site.test.ts`

**Interfaces:**
- Produces: `PostSource` (`'devto' | 'hashnode' | 'medium'`), `Post` interface, `SiteConfig` interface, `site: SiteConfig` singleton. All later tasks import `Post`/`PostSource` from `@/lib/types` and `site` from `@/config/site`.

- [ ] **Step 1: Write the failing test**

Create `src/config/site.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { site } from './site'

describe('site config', () => {
  it('has all required social links as non-empty strings', () => {
    expect(site.socials.github).toMatch(/^https:\/\//)
    expect(site.socials.linkedin).toMatch(/^https:\/\//)
    expect(site.socials.medium).toMatch(/^https:\/\//)
  })

  it('has a name, role, location, bio, and email', () => {
    expect(site.name).toBe('Abdur Rakib')
    expect(site.role.length).toBeGreaterThan(0)
    expect(site.location).toBe('Dhaka, Bangladesh')
    expect(site.bio.length).toBeGreaterThan(0)
    expect(site.email).toBe('abdurrakib961@gmail.com')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/config/site.test.ts
```

Expected: FAIL with "Cannot find module './site'".

- [ ] **Step 3: Write `src/lib/types.ts`**

```ts
export type PostSource = 'devto' | 'hashnode' | 'medium'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  contentFormat: 'markdown' | 'html'
  coverImage: string | null
  publishedAt: string
  tags: string[]
  source: PostSource
  alsoOn: PostSource[]
  originalUrl: string
  isPaywalled: boolean
}
```

- [ ] **Step 4: Write `src/config/site.ts`**

```ts
export interface SiteConfig {
  name: string
  role: string
  location: string
  bio: string
  email: string
  socials: {
    github: string
    linkedin: string
    medium: string
    devto: string
    hashnode: string
  }
  resumeDriveFileId: string
}

export const site: SiteConfig = {
  name: 'Abdur Rakib',
  role: 'Senior Software Engineer · Backend-Focused Full Stack',
  location: 'Dhaka, Bangladesh',
  bio: 'I build scalable web, mobile, and backend systems — microservices, event-driven architectures, and API gateways that hold up under millions of calls a day.',
  email: 'abdurrakib961@gmail.com',
  socials: {
    github: 'https://github.com/abdur-rakib',
    linkedin: 'https://linkedin.com/in/abdurrakibcseruet',
    medium: 'https://medium.com/@abdur-rakib',
    devto: 'https://dev.to/abdur-rakib',
    hashnode: 'https://abdur-rakib.hashnode.dev',
  },
  // Replace with the real Google Drive file ID once the résumé PDF is
  // uploaded and shared as "Anyone with the link — Viewer" (see Task 18).
  resumeDriveFileId: 'REPLACE_WITH_GOOGLE_DRIVE_FILE_ID',
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test src/config/site.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/config/site.ts src/config/site.test.ts
git commit -m "feat: add shared Post types and site config"
```

---

## Task 3: Post dedupe and sort logic

**Files:**
- Create: `src/lib/dedupe.ts`
- Create: `src/lib/dedupe.test.ts`

**Interfaces:**
- Consumes: `Post`, `PostSource` from `@/lib/types` (Task 2).
- Produces: `dedupeAndSort(posts: Post[]): Post[]`. Consumed by `src/lib/aggregate.ts` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `src/lib/dedupe.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { dedupeAndSort } from './dedupe'
import type { Post } from './types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'devto-test',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'excerpt',
    content: 'content',
    contentFormat: 'markdown',
    coverImage: null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [],
    source: 'devto',
    alsoOn: [],
    originalUrl: 'https://dev.to/test-post',
    isPaywalled: false,
    ...overrides,
  }
}

describe('dedupeAndSort', () => {
  it('passes through posts with unique titles unchanged', () => {
    const posts = [
      makePost({ id: 'a', title: 'Post A', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'Post B', publishedAt: '2026-02-01T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(2)
  })

  it('merges cross-posts with the same title, preferring Hashnode as primary', () => {
    const posts = [
      makePost({
        id: 'medium-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'medium',
        publishedAt: '2026-03-05T00:00:00.000Z',
      }),
      makePost({
        id: 'devto-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'devto',
        publishedAt: '2026-03-01T00:00:00.000Z',
      }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(1)
    expect(result[0].source).toBe('devto')
    expect(result[0].publishedAt).toBe('2026-03-01T00:00:00.000Z')
    expect(result[0].alsoOn).toEqual(['medium'])
  })

  it('title match is case- and punctuation-insensitive', () => {
    const posts = [
      makePost({ id: 'a', title: 'Rate Limiting at the Gateway!', source: 'devto', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'rate limiting at the gateway', source: 'hashnode', publishedAt: '2026-01-02T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(1)
    expect(result[0].alsoOn).toEqual(['hashnode'])
  })

  it('sorts results by publishedAt descending', () => {
    const posts = [
      makePost({ id: 'a', title: 'Old Post', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'New Post', publishedAt: '2026-06-01T00:00:00.000Z' }),
      makePost({ id: 'c', title: 'Mid Post', publishedAt: '2026-03-01T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result.map((p) => p.title)).toEqual(['New Post', 'Mid Post', 'Old Post'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/dedupe.test.ts
```

Expected: FAIL with "Cannot find module './dedupe'".

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/dedupe.ts`:

```ts
import type { Post, PostSource } from './types'

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function dedupeAndSort(posts: Post[]): Post[] {
  const byTitle = new Map<string, Post>()

  for (const post of posts) {
    const key = normalizeTitle(post.title)
    const existing = byTitle.get(key)

    if (!existing) {
      byTitle.set(key, { ...post, alsoOn: [...post.alsoOn] })
      continue
    }

    const earlier = post.publishedAt < existing.publishedAt ? post : existing
    const later = post.publishedAt < existing.publishedAt ? existing : post

    const alsoOn = Array.from(
      new Set([...existing.alsoOn, ...post.alsoOn, later.source])
    ).filter((source): source is PostSource => source !== earlier.source)

    byTitle.set(key, { ...earlier, alsoOn })
  }

  return Array.from(byTitle.values()).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/lib/dedupe.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dedupe.ts src/lib/dedupe.test.ts
git commit -m "feat: add cross-post dedupe and sort logic"
```

---

## Task 4: dev.to loader

**Files:**
- Create: `src/lib/sources/devto.ts`
- Create: `src/lib/sources/devto.test.ts`

**Interfaces:**
- Consumes: `Post` from `@/lib/types` (Task 2); reads `process.env.DEVTO_USERNAME`.
- Produces: `fetchDevto(): Promise<Post[]>`. Consumed by `src/lib/aggregate.ts` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `src/lib/sources/devto.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchDevto } from './devto'

const ARTICLE_LIST = [
  {
    id: 1,
    title: 'Custom Kong Plugins to Block Unauthorized API Traffic',
    slug: 'custom-kong-plugins',
    description: 'A verification layer that cut fraudulent requests by 90%.',
    cover_image: null,
    published_at: '2026-05-01T00:00:00.000Z',
    tag_list: ['kong', 'security'],
    url: 'https://dev.to/abdur-rakib/custom-kong-plugins',
  },
]

const ARTICLE_FULL = {
  ...ARTICLE_LIST[0],
  body_markdown: '# Custom Kong Plugins\n\nFull article body here.',
}

describe('fetchDevto', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns an empty array when DEVTO_USERNAME is unset', async () => {
    vi.stubEnv('DEVTO_USERNAME', '')
    const result = await fetchDevto()
    expect(result).toEqual([])
  })

  it('fetches the article list then full body for each article', async () => {
    vi.stubEnv('DEVTO_USERNAME', 'abdur-rakib')
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/api/articles?')) {
        return new Response(JSON.stringify(ARTICLE_LIST), { status: 200 })
      }
      return new Response(JSON.stringify(ARTICLE_FULL), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchDevto()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'devto-custom-kong-plugins',
      title: 'Custom Kong Plugins to Block Unauthorized API Traffic',
      slug: 'custom-kong-plugins',
      content: '# Custom Kong Plugins\n\nFull article body here.',
      contentFormat: 'markdown',
      source: 'devto',
      alsoOn: [],
      tags: ['kong', 'security'],
      originalUrl: 'https://dev.to/abdur-rakib/custom-kong-plugins',
      isPaywalled: false,
    })
  })

  it('throws when the article list fetch fails', async () => {
    vi.stubEnv('DEVTO_USERNAME', 'abdur-rakib')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))

    await expect(fetchDevto()).rejects.toThrow('dev.to list fetch failed: 500')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/sources/devto.test.ts
```

Expected: FAIL with "Cannot find module './devto'".

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/sources/devto.ts`:

```ts
import type { Post } from '../types'

interface DevtoArticle {
  id: number
  title: string
  slug: string
  description: string
  cover_image: string | null
  published_at: string
  tag_list: string[]
  url: string
}

interface DevtoArticleFull extends DevtoArticle {
  body_markdown: string
}

const DEVTO_API = 'https://dev.to/api/articles'

export async function fetchDevto(): Promise<Post[]> {
  const username = process.env.DEVTO_USERNAME
  if (!username) return []

  const listRes = await fetch(`${DEVTO_API}?username=${username}&per_page=100`)
  if (!listRes.ok) {
    throw new Error(`dev.to list fetch failed: ${listRes.status}`)
  }
  const articles: DevtoArticle[] = await listRes.json()

  const full = await Promise.all(
    articles.map(async (article) => {
      const res = await fetch(`${DEVTO_API}/${article.id}`)
      if (!res.ok) {
        throw new Error(`dev.to article fetch failed: ${res.status}`)
      }
      return (await res.json()) as DevtoArticleFull
    })
  )

  return full.map(toPost)
}

function toPost(article: DevtoArticleFull): Post {
  return {
    id: `devto-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    content: article.body_markdown,
    contentFormat: 'markdown',
    coverImage: article.cover_image,
    publishedAt: article.published_at,
    tags: article.tag_list,
    source: 'devto',
    alsoOn: [],
    originalUrl: article.url,
    isPaywalled: false,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/lib/sources/devto.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sources/devto.ts src/lib/sources/devto.test.ts
git commit -m "feat: add dev.to post loader"
```

---

## Task 5: Hashnode loader

**Files:**
- Create: `src/lib/sources/hashnode.ts`
- Create: `src/lib/sources/hashnode.test.ts`

**Interfaces:**
- Consumes: `Post` from `@/lib/types` (Task 2); reads `process.env.HASHNODE_HOST`.
- Produces: `fetchHashnode(): Promise<Post[]>`. Consumed by `src/lib/aggregate.ts` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `src/lib/sources/hashnode.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHashnode } from './hashnode'

const GRAPHQL_RESPONSE = {
  data: {
    publication: {
      posts: {
        edges: [
          {
            node: {
              title: 'Offline-First React Native for Field Agents',
              slug: 'offline-first-react-native',
              brief: 'Syncing orders from remote areas reliably.',
              url: 'https://abdur-rakib.hashnode.dev/offline-first-react-native',
              publishedAt: '2026-04-01T00:00:00.000Z',
              tags: [{ name: 'react-native' }, { name: 'redux' }],
              coverImage: { url: 'https://cdn.hashnode.com/cover.png' },
              content: { markdown: '# Offline-First\n\nFull body.' },
            },
          },
        ],
      },
    },
  },
}

describe('fetchHashnode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns an empty array when HASHNODE_HOST is unset', async () => {
    vi.stubEnv('HASHNODE_HOST', '')
    const result = await fetchHashnode()
    expect(result).toEqual([])
  })

  it('maps GraphQL posts to normalized Post objects', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(GRAPHQL_RESPONSE), { status: 200 }))
    )

    const result = await fetchHashnode()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'hashnode-offline-first-react-native',
      title: 'Offline-First React Native for Field Agents',
      slug: 'offline-first-react-native',
      content: '# Offline-First\n\nFull body.',
      contentFormat: 'markdown',
      coverImage: 'https://cdn.hashnode.com/cover.png',
      tags: ['react-native', 'redux'],
      source: 'hashnode',
      alsoOn: [],
      originalUrl: 'https://abdur-rakib.hashnode.dev/offline-first-react-native',
      isPaywalled: false,
    })
  })

  it('returns an empty array when the publication is not found', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ data: { publication: null } }), { status: 200 }))
    )

    const result = await fetchHashnode()
    expect(result).toEqual([])
  })

  it('throws when the request fails', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))

    await expect(fetchHashnode()).rejects.toThrow('Hashnode fetch failed: 500')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/sources/hashnode.test.ts
```

Expected: FAIL with "Cannot find module './hashnode'".

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/sources/hashnode.ts`:

```ts
import type { Post } from '../types'

const HASHNODE_API = 'https://gql.hashnode.com'

const POSTS_QUERY = `
  query PublicationPosts($host: String!) {
    publication(host: $host) {
      posts(first: 50) {
        edges {
          node {
            title
            slug
            brief
            url
            publishedAt
            tags { name }
            coverImage { url }
            content { markdown }
          }
        }
      }
    }
  }
`

interface HashnodePostNode {
  title: string
  slug: string
  brief: string
  url: string
  publishedAt: string
  tags: { name: string }[]
  coverImage: { url: string } | null
  content: { markdown: string }
}

interface HashnodeResponse {
  data: {
    publication: {
      posts: { edges: { node: HashnodePostNode }[] }
    } | null
  }
}

export async function fetchHashnode(): Promise<Post[]> {
  const host = process.env.HASHNODE_HOST
  if (!host) return []

  const res = await fetch(HASHNODE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: POSTS_QUERY, variables: { host } }),
  })
  if (!res.ok) {
    throw new Error(`Hashnode fetch failed: ${res.status}`)
  }

  const json = (await res.json()) as HashnodeResponse
  const publication = json.data.publication
  if (!publication) return []

  return publication.posts.edges.map(({ node }) => toPost(node))
}

function toPost(node: HashnodePostNode): Post {
  return {
    id: `hashnode-${node.slug}`,
    title: node.title,
    slug: node.slug,
    excerpt: node.brief,
    content: node.content.markdown,
    contentFormat: 'markdown',
    coverImage: node.coverImage?.url ?? null,
    publishedAt: node.publishedAt,
    tags: node.tags.map((tag) => tag.name),
    source: 'hashnode',
    alsoOn: [],
    originalUrl: node.url,
    isPaywalled: false,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/lib/sources/hashnode.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sources/hashnode.ts src/lib/sources/hashnode.test.ts
git commit -m "feat: add Hashnode post loader"
```

---

## Task 6: Medium content sanitizer (pure)

**Files:**
- Create: `src/lib/sources/mediumSanitize.ts`
- Create: `src/lib/sources/mediumSanitize.test.ts`

**Interfaces:**
- Produces: `sanitizeMediumContent(rawHtml: string): { html: string; isPaywalled: boolean }`. Consumed by `src/lib/sources/medium.ts` (Task 7).

- [ ] **Step 1: Write the failing test**

Create `src/lib/sources/mediumSanitize.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { sanitizeMediumContent } from './mediumSanitize'

describe('sanitizeMediumContent', () => {
  it('strips disallowed tags like script', () => {
    const { html } = sanitizeMediumContent('<p>Hello</p><script>alert(1)</script>')
    expect(html).toBe('<p>Hello</p>')
  })

  it('strips 1x1 tracking pixel images', () => {
    const { html } = sanitizeMediumContent(
      '<p>Body</p><img src="https://track.example/pixel.gif" width="1" height="1" />'
    )
    expect(html).not.toContain('track.example')
  })

  it('keeps normal images', () => {
    const { html } = sanitizeMediumContent(
      '<p>Body</p><img src="https://miro.medium.com/photo.png" width="800" height="400" />'
    )
    expect(html).toContain('miro.medium.com/photo.png')
  })

  it('flags isPaywalled true when content is under 500 characters', () => {
    const { isPaywalled } = sanitizeMediumContent('<p>Short teaser paragraph only.</p>')
    expect(isPaywalled).toBe(true)
  })

  it('flags isPaywalled false when content is 500 characters or longer', () => {
    const longParagraph = `<p>${'word '.repeat(120)}</p>`
    const { isPaywalled } = sanitizeMediumContent(longParagraph)
    expect(isPaywalled).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/sources/mediumSanitize.test.ts
```

Expected: FAIL with "Cannot find module './mediumSanitize'".

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/sources/mediumSanitize.ts`:

```ts
import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'a', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption',
]

const PAYWALL_THRESHOLD = 500

export function sanitizeMediumContent(rawHtml: string): { html: string; isPaywalled: boolean } {
  const html = sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt', 'width', 'height'],
    },
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && frame.attribs.width === '1' && frame.attribs.height === '1',
  })

  const textLength = html.replace(/<[^>]+>/g, '').trim().length
  return { html, isPaywalled: textLength < PAYWALL_THRESHOLD }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/lib/sources/mediumSanitize.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sources/mediumSanitize.ts src/lib/sources/mediumSanitize.test.ts
git commit -m "feat: add Medium HTML sanitizer with paywall detection"
```

---

## Task 7: Medium RSS loader

**Files:**
- Create: `src/lib/sources/medium.ts`
- Create: `src/lib/sources/medium.test.ts`
- Modify: `next.config.ts` (allowlist Medium image domains)

**Interfaces:**
- Consumes: `Post` from `@/lib/types` (Task 2); `sanitizeMediumContent` from `./mediumSanitize` (Task 6); reads `process.env.MEDIUM_USERNAME`.
- Produces: `fetchMedium(): Promise<Post[]>`. Consumed by `src/lib/aggregate.ts` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `src/lib/sources/medium.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMedium } from './medium'

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Abdur Rakib - Medium</title>
    <item>
      <title>Enforcing Coverage Thresholds in GitLab CI</title>
      <link>https://medium.com/@abdur-rakib/enforcing-coverage-thresholds-abc123</link>
      <guid>https://medium.com/p/abc123</guid>
      <pubDate>Wed, 04 Mar 2026 00:00:00 GMT</pubDate>
      <category>ci</category>
      <category>jest</category>
      <description>Failing the pipeline when tests slip below the line.</description>
      <content:encoded><![CDATA[<p>${'Full article body. '.repeat(40)}</p>]]></content:encoded>
    </item>
  </channel>
</rss>`

describe('fetchMedium', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns an empty array when MEDIUM_USERNAME is unset', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '')
    const result = await fetchMedium()
    expect(result).toEqual([])
  })

  it('parses RSS items into normalized Post objects', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    vi.stubGlobal('fetch', vi.fn(async () => new Response(SAMPLE_RSS, { status: 200 })))

    const result = await fetchMedium()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'medium-enforcing-coverage-thresholds-abc123',
      title: 'Enforcing Coverage Thresholds in GitLab CI',
      slug: 'enforcing-coverage-thresholds-abc123',
      excerpt: 'Failing the pipeline when tests slip below the line.',
      contentFormat: 'html',
      tags: ['ci', 'jest'],
      source: 'medium',
      alsoOn: [],
      originalUrl: 'https://medium.com/@abdur-rakib/enforcing-coverage-thresholds-abc123',
      isPaywalled: false,
    })
    expect(result[0].publishedAt).toBe(new Date('Wed, 04 Mar 2026 00:00:00 GMT').toISOString())
  })

  it('throws when the feed fetch fails', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))

    await expect(fetchMedium()).rejects.toThrow('Medium feed fetch failed: 404')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/sources/medium.test.ts
```

Expected: FAIL with "Cannot find module './medium'".

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/sources/medium.ts`:

```ts
import { XMLParser } from 'fast-xml-parser'
import type { Post } from '../types'
import { sanitizeMediumContent } from './mediumSanitize'

interface MediumItem {
  title: string
  link: string
  guid: string
  pubDate: string
  category?: string | string[]
  'content:encoded': string
  description?: string
}

const parser = new XMLParser({ ignoreAttributes: false })

export async function fetchMedium(): Promise<Post[]> {
  const username = process.env.MEDIUM_USERNAME
  if (!username) return []

  const res = await fetch(`https://medium.com/feed/${username}`)
  if (!res.ok) {
    throw new Error(`Medium feed fetch failed: ${res.status}`)
  }

  const xml = await res.text()
  const parsed = parser.parse(xml)
  const rawItems = parsed?.rss?.channel?.item ?? []
  const items: MediumItem[] = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items.map(toPost)
}

function toPost(item: MediumItem): Post {
  const { html, isPaywalled } = sanitizeMediumContent(item['content:encoded'])
  const tags = ([] as string[]).concat(item.category ?? [])
  const slug = item.link.split('/').pop()?.split('?')[0] ?? item.guid

  return {
    id: `medium-${slug}`,
    title: item.title,
    slug,
    excerpt: item.description ?? html.replace(/<[^>]+>/g, '').slice(0, 160),
    content: html,
    contentFormat: 'html',
    coverImage: null,
    publishedAt: new Date(item.pubDate).toISOString(),
    tags,
    source: 'medium',
    alsoOn: [],
    originalUrl: item.link,
    isPaywalled,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/lib/sources/medium.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Allowlist Medium image domains**

Edit `next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn-images-1.medium.com' },
      { protocol: 'https', hostname: 'miro.medium.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/sources/medium.ts src/lib/sources/medium.test.ts next.config.ts
git commit -m "feat: add Medium RSS loader with sanitize and paywall detection"
```

---

## Task 8: Post aggregation

**Files:**
- Create: `src/lib/aggregate.ts`
- Create: `src/lib/aggregate.test.ts`

**Interfaces:**
- Consumes: `fetchDevto` (Task 4), `fetchHashnode` (Task 5), `fetchMedium` (Task 7), `dedupeAndSort` (Task 3).
- Produces: `combinePosts(): Promise<Post[]>` (settle-and-merge logic, directly testable) and `getAllPosts: () => Promise<Post[]>` (module-scoped build snapshot, used by pages). Consumed by Home page (Task 15), Blog index (Task 16), Post detail (Task 17), sitemap (Task 19).

- [ ] **Step 1: Write the failing test**

Create `src/lib/aggregate.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import type { Post } from './types'

const devtoPost: Post = {
  id: 'devto-a', title: 'A', slug: 'a', excerpt: '', content: '', contentFormat: 'markdown',
  coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z', tags: [], source: 'devto',
  alsoOn: [], originalUrl: 'https://dev.to/a', isPaywalled: false,
}
const hashnodePost: Post = {
  id: 'hashnode-b', title: 'B', slug: 'b', excerpt: '', content: '', contentFormat: 'markdown',
  coverImage: null, publishedAt: '2026-02-01T00:00:00.000Z', tags: [], source: 'hashnode',
  alsoOn: [], originalUrl: 'https://hashnode.dev/b', isPaywalled: false,
}

vi.mock('./sources/devto', () => ({ fetchDevto: vi.fn(async () => [devtoPost]) }))
vi.mock('./sources/hashnode', () => ({
  fetchHashnode: vi.fn(async () => {
    throw new Error('hashnode is down')
  }),
}))
vi.mock('./sources/medium', () => ({ fetchMedium: vi.fn(async () => [hashnodePost]) }))

describe('combinePosts', () => {
  it('merges posts from sources that succeed and ignores sources that fail', async () => {
    const { combinePosts } = await import('./aggregate')
    const result = await combinePosts()

    expect(result).toHaveLength(2)
    expect(result.map((p) => p.id).sort()).toEqual(['devto-a', 'hashnode-b'])
  })

  it('sorts the merged result by publishedAt descending', async () => {
    const { combinePosts } = await import('./aggregate')
    const result = await combinePosts()

    expect(result[0].id).toBe('hashnode-b')
    expect(result[1].id).toBe('devto-a')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/aggregate.test.ts
```

Expected: FAIL with "Cannot find module './aggregate'".

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/aggregate.ts`:

```ts
import { cache } from 'react'
import type { Post } from './types'
import { fetchDevto } from './sources/devto'
import { fetchHashnode } from './sources/hashnode'
import { fetchMedium } from './sources/medium'
import { dedupeAndSort } from './dedupe'

export async function combinePosts(): Promise<Post[]> {
  const results = await Promise.allSettled([fetchDevto(), fetchHashnode(), fetchMedium()])

  const posts = results
    .filter((r): r is PromiseFulfilledResult<Post[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  return dedupeAndSort(posts)
}

export const getAllPosts = cache(combinePosts)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/lib/aggregate.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/aggregate.ts src/lib/aggregate.test.ts
git commit -m "feat: add post aggregation with allSettled fault tolerance"
```

---

## Task 9: Design tokens (globals.css)

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties (`--background`, `--foreground`, `--panel`, `--panel-2`, `--muted`, `--muted-foreground`, `--border`, `--border-strong`, `--primary`, `--primary-foreground`, `--accent`, `--ring`) mapped into Tailwind v4 `@theme inline` as `bg-background`, `text-foreground`, `border-border`, etc. Full light/dark support via `prefers-color-scheme` and `[data-theme]` override. Consumed by every component task from here on.

This task has no unit-testable logic (pure CSS) — verification is visual + a grep check that both theme blocks exist.

- [ ] **Step 1: Replace `src/app/globals.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

:root {
  --background: #fafafa;
  --foreground: #18181b;
  --panel: #ffffff;
  --panel-2: #f4f4f5;
  --muted: #71717a;
  --muted-foreground: #a1a1aa;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --accent: #4f46e5;
  --ring: #a5b4fc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #09090b;
    --foreground: #fafafa;
    --panel: #131316;
    --panel-2: #18181b;
    --muted: #a1a1aa;
    --muted-foreground: #71717a;
    --border: #27272a;
    --border-strong: #3f3f46;
    --primary: #fafafa;
    --primary-foreground: #18181b;
    --accent: #a5b4fc;
    --ring: #4f46e5;
  }
}

:root[data-theme="light"] {
  --background: #fafafa;
  --foreground: #18181b;
  --panel: #ffffff;
  --panel-2: #f4f4f5;
  --muted: #71717a;
  --muted-foreground: #a1a1aa;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --accent: #4f46e5;
  --ring: #a5b4fc;
}

:root[data-theme="dark"] {
  --background: #09090b;
  --foreground: #fafafa;
  --panel: #131316;
  --panel-2: #18181b;
  --muted: #a1a1aa;
  --muted-foreground: #71717a;
  --border: #27272a;
  --border-strong: #3f3f46;
  --primary: #fafafa;
  --primary-foreground: #18181b;
  --accent: #a5b4fc;
  --ring: #4f46e5;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-panel: var(--panel);
  --color-panel-2: var(--panel-2);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-ring: var(--ring);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 2: Verify both theme blocks are present**

```bash
grep -c "prefers-color-scheme: dark" src/app/globals.css
grep -c 'data-theme="dark"' src/app/globals.css
grep -c 'data-theme="light"' src/app/globals.css
```

Expected: each command prints `1`.

- [ ] **Step 3: Verify the build still succeeds**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add light/dark design tokens for Tailwind v4"
```

---

## Task 10: ThemeToggle component

**Files:**
- Create: `src/components/layout/ThemeToggle.tsx`
- Create: `src/components/layout/ThemeToggle.test.tsx`

**Interfaces:**
- Produces: `ThemeToggle` (client component, default export named `ThemeToggle`). Consumed by `Navbar` (Task 11).

- [ ] **Step 1: Write the failing test**

Create `src/components/layout/ThemeToggle.test.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-theme')
  window.localStorage.clear()
})

describe('ThemeToggle', () => {
  it('renders a toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy()
  })

  it('sets data-theme on the document root when clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })

    await user.click(button)
    const firstTheme = document.documentElement.getAttribute('data-theme')
    expect(['light', 'dark']).toContain(firstTheme)

    await user.click(button)
    const secondTheme = document.documentElement.getAttribute('data-theme')
    expect(secondTheme).not.toBe(firstTheme)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/layout/ThemeToggle.test.tsx
```

Expected: FAIL with "Cannot find module './ThemeToggle'".

- [ ] **Step 3: Write minimal implementation**

Create `src/components/layout/ThemeToggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getSystemTheme)

  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle theme"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:text-foreground"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/components/layout/ThemeToggle.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ThemeToggle.tsx src/components/layout/ThemeToggle.test.tsx
git commit -m "feat: add theme toggle component"
```

---

## Task 11: Navbar and Footer

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Navbar.test.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/Footer.test.tsx`

**Interfaces:**
- Consumes: `site` from `@/config/site` (Task 2), `ThemeToggle` from `./ThemeToggle` (Task 10).
- Produces: `Navbar`, `Footer`. Consumed by root layout (Task 12).

- [ ] **Step 1: Write the failing Navbar test**

Create `src/components/layout/Navbar.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from './Navbar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/blog',
}))

describe('Navbar', () => {
  it('renders Home, Blog, and Resume links', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Blog' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Resume' })).toBeTruthy()
  })

  it('marks the current route as active', () => {
    render(<Navbar />)
    const blogLink = screen.getByRole('link', { name: 'Blog' })
    expect(blogLink.className).toContain('font-medium')
  })

  it('renders the theme toggle button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/layout/Navbar.test.tsx
```

Expected: FAIL with "Cannot find module './Navbar'".

- [ ] **Step 3: Write minimal Navbar implementation**

Create `src/components/layout/Navbar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { site } from '@/config/site'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/resume', label: 'Resume' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-[940px] items-center gap-2 px-6">
        <Link href="/" className="mr-auto flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            AR
          </span>
          {site.name}
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'rounded-lg bg-panel-2 px-3 py-1.5 text-sm font-medium text-foreground'
                    : 'rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/components/layout/Navbar.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing Footer test**

Create `src/components/layout/Footer.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders GitHub, LinkedIn, and Medium links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /github/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /medium/i })).toBeTruthy()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test src/components/layout/Footer.test.tsx
```

Expected: FAIL with "Cannot find module './Footer'".

- [ ] **Step 7: Write minimal Footer implementation**

Create `src/components/layout/Footer.tsx`:

```tsx
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
```

- [ ] **Step 8: Run test to verify it passes**

```bash
pnpm test src/components/layout/Footer.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/Navbar.test.tsx src/components/layout/Footer.tsx src/components/layout/Footer.test.tsx
git commit -m "feat: add Navbar and Footer layout components"
```

---

## Task 12: Root layout wiring

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Navbar` (Task 11), `Footer` (Task 11), `site` (Task 2).
- Produces: the page shell every route renders inside — a `<main>` landmark wrapping `{children}`, wrapped by `Navbar` and `Footer`. This is what makes the Task 1 smoke test (`page.test.tsx`) findable once combined with Task 15's home page.

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { site } from '@/config/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: `${site.name} — ${site.role}`,
  description: site.bio,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <main className="mx-auto max-w-[940px] px-6 py-14">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` is required on `<html>` because `ThemeToggle` (Task 10) sets `data-theme` on `document.documentElement` after mount — without it, React logs a spurious hydration mismatch warning for an attribute it doesn't control server-side.

- [ ] **Step 2: Verify the build succeeds**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 3: Run the full test suite**

```bash
pnpm test
```

Expected: the Task 1 scaffold smoke test (`src/app/page.test.tsx`) still FAILS at this point — `page.tsx` is still the default Next.js starter, which the root layout now wraps in `<main>`, but the starter content itself hasn't changed. Confirm the failure reason has shifted from "no module" to "no main role found within default page markup" is no longer the issue — re-run and note it now passes if the starter page's content lands inside `<main>`:

```bash
pnpm test src/app/page.test.tsx
```

Expected: PASS (the `<main>` landmark now comes from the root layout, regardless of what `page.tsx` renders inside it). All other suites continue to pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire root layout with Navbar, Footer, and metadata"
```

---

## Task 13: SourceBadge and PostCard

**Files:**
- Create: `src/components/blog/SourceBadge.tsx`
- Create: `src/components/blog/SourceBadge.test.tsx`
- Create: `src/components/blog/PostCard.tsx`
- Create: `src/components/blog/PostCard.test.tsx`

**Interfaces:**
- Consumes: `PostSource`, `Post` from `@/lib/types` (Task 2).
- Produces: `SourceBadge`, `PostCard`. Consumed by `BlogExplorer` (Task 14), `LatestPosts` (Task 15), Post detail page (Task 17).

- [ ] **Step 1: Write the failing SourceBadge test**

Create `src/components/blog/SourceBadge.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourceBadge } from './SourceBadge'

describe('SourceBadge', () => {
  it.each([
    ['devto', 'dev.to'],
    ['hashnode', 'hashnode'],
    ['medium', 'medium'],
  ] as const)('renders the label for %s', (source, label) => {
    render(<SourceBadge source={source} />)
    expect(screen.getByText(label)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/blog/SourceBadge.test.tsx
```

Expected: FAIL with "Cannot find module './SourceBadge'".

- [ ] **Step 3: Write minimal SourceBadge implementation**

Create `src/components/blog/SourceBadge.tsx`:

```tsx
import type { PostSource } from '@/lib/types'

const LABELS: Record<PostSource, string> = {
  devto: 'dev.to',
  hashnode: 'hashnode',
  medium: 'medium',
}

export function SourceBadge({ source }: { source: PostSource }) {
  return (
    <span className="rounded-md bg-panel-2 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold lowercase text-foreground">
      {LABELS[source]}
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/components/blog/SourceBadge.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing PostCard test**

Create `src/components/blog/PostCard.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from './PostCard'
import type { Post } from '@/lib/types'

const post: Post = {
  id: 'devto-kong-plugins',
  title: 'Custom Kong Plugins to Block Unauthorized API Traffic',
  slug: 'kong-plugins',
  excerpt: 'A verification layer that cut fraudulent requests by 90%.',
  content: 'word '.repeat(400),
  contentFormat: 'markdown',
  coverImage: null,
  publishedAt: '2026-05-01T00:00:00.000Z',
  tags: ['kong', 'security', 'api-gateway', 'devops'],
  source: 'devto',
  alsoOn: ['hashnode'],
  originalUrl: 'https://dev.to/abdur-rakib/kong-plugins',
  isPaywalled: false,
}

describe('PostCard', () => {
  it('links to the internal post route', () => {
    render(<PostCard post={post} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/blog/devto/kong-plugins')
  })

  it('renders the title and excerpt', () => {
    render(<PostCard post={post} />)
    expect(screen.getByText(post.title)).toBeTruthy()
    expect(screen.getByText(post.excerpt)).toBeTruthy()
  })

  it('renders a badge for the primary source and each alsoOn source', () => {
    render(<PostCard post={post} />)
    expect(screen.getByText('dev.to')).toBeTruthy()
    expect(screen.getByText('hashnode')).toBeTruthy()
  })

  it('renders at most 3 tags', () => {
    render(<PostCard post={post} />)
    expect(screen.getAllByText(/^(kong|security|api-gateway|devops)$/)).toHaveLength(3)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test src/components/blog/PostCard.test.tsx
```

Expected: FAIL with "Cannot find module './PostCard'".

- [ ] **Step 7: Write minimal PostCard implementation**

Create `src/components/blog/PostCard.tsx`:

```tsx
import Link from 'next/link'
import type { Post } from '@/lib/types'
import { SourceBadge } from './SourceBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.source}/${post.slug}`}
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-panel p-4.5 transition hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <SourceBadge source={post.source} />
        {post.alsoOn.map((source) => (
          <SourceBadge key={source} source={source} />
        ))}
        <span>{formatDate(post.publishedAt)}</span>
        <span>{readingTime(post.content)} min</span>
      </div>
      <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
      <p className="text-sm text-muted">{post.excerpt}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
pnpm test src/components/blog/PostCard.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/blog/SourceBadge.tsx src/components/blog/SourceBadge.test.tsx src/components/blog/PostCard.tsx src/components/blog/PostCard.test.tsx
git commit -m "feat: add SourceBadge and PostCard components"
```

---

## Task 14: Blog filters and explorer

**Files:**
- Create: `src/components/blog/SourceFilter.tsx`
- Create: `src/components/blog/TagFilter.tsx`
- Create: `src/components/blog/BlogExplorer.tsx`
- Create: `src/components/blog/BlogExplorer.test.tsx`

**Interfaces:**
- Consumes: `Post`, `PostSource` from `@/lib/types` (Task 2); `PostCard` from `./PostCard` (Task 13).
- Produces: `SourceFilter` (props: `value: PostSource | 'all'`, `onChange: (v: PostSource | 'all') => void`), `TagFilter` (props: `tags: string[]`, `value: string`, `onChange: (v: string) => void`), `BlogExplorer` (props: `posts: Post[]`). Consumed by Blog index page (Task 16).

- [ ] **Step 1: Write `SourceFilter.tsx`** (presentational, no test needed beyond BlogExplorer's integration test — it has no logic of its own)

Create `src/components/blog/SourceFilter.tsx`:

```tsx
'use client'

import type { PostSource } from '@/lib/types'

const OPTIONS: { value: PostSource | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'devto', label: 'dev.to' },
  { value: 'hashnode', label: 'Hashnode' },
  { value: 'medium', label: 'Medium' },
]

export function SourceFilter({
  value,
  onChange,
}: {
  value: PostSource | 'all'
  onChange: (value: PostSource | 'all') => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Source</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            value === opt.value
              ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
              : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted hover:text-foreground'
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Write `TagFilter.tsx`**

Create `src/components/blog/TagFilter.tsx`:

```tsx
'use client'

export function TagFilter({
  tags,
  value,
  onChange,
}: {
  tags: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Tag</span>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={
          value === 'all'
            ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
            : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted hover:text-foreground'
        }
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={
            value === tag
              ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
              : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted hover:text-foreground'
          }
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write the failing BlogExplorer test**

Create `src/components/blog/BlogExplorer.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogExplorer } from './BlogExplorer'
import type { Post } from '@/lib/types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'devto-a', title: 'A', slug: 'a', excerpt: 'excerpt a', content: 'word '.repeat(200),
    contentFormat: 'markdown', coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [], source: 'devto', alsoOn: [], originalUrl: 'https://dev.to/a', isPaywalled: false,
    ...overrides,
  }
}

const posts: Post[] = [
  makePost({ id: 'devto-a', title: 'Rate Limiting at the Gateway', source: 'devto', tags: ['api-gateway'] }),
  makePost({ id: 'medium-b', title: 'Auto-Recharge Engine', source: 'medium', tags: ['nestjs'], publishedAt: '2026-02-01T00:00:00.000Z' }),
]

describe('BlogExplorer', () => {
  it('renders all posts by default', () => {
    render(<BlogExplorer posts={posts} />)
    expect(screen.getByText('Rate Limiting at the Gateway')).toBeTruthy()
    expect(screen.getByText('Auto-Recharge Engine')).toBeTruthy()
  })

  it('filters by source', async () => {
    const user = userEvent.setup()
    render(<BlogExplorer posts={posts} />)

    await user.click(screen.getByRole('button', { name: 'Medium' }))

    expect(screen.queryByText('Rate Limiting at the Gateway')).toBeNull()
    expect(screen.getByText('Auto-Recharge Engine')).toBeTruthy()
  })

  it('filters by tag', async () => {
    const user = userEvent.setup()
    render(<BlogExplorer posts={posts} />)

    await user.click(screen.getByRole('button', { name: 'nestjs' }))

    expect(screen.queryByText('Rate Limiting at the Gateway')).toBeNull()
    expect(screen.getByText('Auto-Recharge Engine')).toBeTruthy()
  })

  it('shows an empty state when no posts match', async () => {
    const user = userEvent.setup()
    render(<BlogExplorer posts={posts} />)

    await user.click(screen.getByRole('button', { name: 'Medium' }))
    await user.click(screen.getByRole('button', { name: 'api-gateway' }))

    expect(screen.getByText('No posts match these filters.')).toBeTruthy()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
pnpm test src/components/blog/BlogExplorer.test.tsx
```

Expected: FAIL with "Cannot find module './BlogExplorer'".

- [ ] **Step 5: Write minimal BlogExplorer implementation**

Create `src/components/blog/BlogExplorer.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import type { Post, PostSource } from '@/lib/types'
import { PostCard } from './PostCard'
import { SourceFilter } from './SourceFilter'
import { TagFilter } from './TagFilter'

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [source, setSource] = useState<PostSource | 'all'>('all')
  const [tag, setTag] = useState('all')

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts])

  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (source === 'all' || post.source === source || post.alsoOn.includes(source)) &&
          (tag === 'all' || post.tags.includes(tag))
      ),
    [posts, source, tag]
  )

  return (
    <div className="flex flex-col gap-6">
      <SourceFilter value={source} onChange={setSource} />
      <TagFilter tags={tags} value={tag} onChange={setTag} />
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No posts match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
pnpm test src/components/blog/BlogExplorer.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/blog/SourceFilter.tsx src/components/blog/TagFilter.tsx src/components/blog/BlogExplorer.tsx src/components/blog/BlogExplorer.test.tsx
git commit -m "feat: add blog source/tag filters and BlogExplorer"
```

---

## Task 15: Home page

**Files:**
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/Hero.test.tsx`
- Create: `src/components/home/LatestPosts.tsx`
- Create: `src/components/home/LatestPosts.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `site` (Task 2), `getAllPosts` (Task 8), `PostCard` (Task 13).
- Produces: the `/` route.

- [ ] **Step 1: Write the failing Hero test**

Create `src/components/home/Hero.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { site } from '@/config/site'

describe('Hero', () => {
  it('renders name, role, location, and bio', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: site.name })).toBeTruthy()
    expect(screen.getByText(site.role)).toBeTruthy()
    expect(screen.getByText(site.location)).toBeTruthy()
    expect(screen.getByText(site.bio)).toBeTruthy()
  })

  it('renders CTA links to /blog and /resume', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /read the blog/i }).getAttribute('href')).toBe('/blog')
    expect(screen.getByRole('link', { name: /view résumé/i }).getAttribute('href')).toBe('/resume')
  })

  it('renders a link for every social plus email', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(site.socials.github)
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toBe(`mailto:${site.email}`)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/home/Hero.test.tsx
```

Expected: FAIL with "Cannot find module './Hero'".

- [ ] **Step 3: Write minimal Hero implementation**

Create `src/components/home/Hero.tsx`:

```tsx
import Link from 'next/link'
import { site } from '@/config/site'

const SOCIAL_LABELS: Record<keyof typeof site.socials, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  medium: 'Medium',
  devto: 'dev.to',
  hashnode: 'Hashnode',
}

export function Hero() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          <span>📍</span>
          <span>{site.location}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{site.name}</h1>
        <p className="mt-3 text-lg text-muted">{site.role}</p>
      </div>
      <p className="max-w-[60ch] text-base leading-relaxed">{site.bio}</p>
      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/blog"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Read the blog
        </Link>
        <Link
          href="/resume"
          className="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm font-medium"
        >
          View résumé
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(site.socials) as (keyof typeof site.socials)[]).map((key) => (
          <a
            key={key}
            href={site.socials[key]}
            className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            {SOCIAL_LABELS[key]}
          </a>
        ))}
        <a
          href={`mailto:${site.email}`}
          className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted hover:text-foreground"
        >
          Email
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/components/home/Hero.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing LatestPosts test**

Create `src/components/home/LatestPosts.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LatestPosts } from './LatestPosts'
import type { Post } from '@/lib/types'

function makePost(id: string, title: string, publishedAt: string): Post {
  return {
    id, title, slug: id, excerpt: '', content: '', contentFormat: 'markdown', coverImage: null,
    publishedAt, tags: [], source: 'devto', alsoOn: [], originalUrl: 'https://dev.to/x', isPaywalled: false,
  }
}

describe('LatestPosts', () => {
  it('renders at most 3 posts', () => {
    const posts = [
      makePost('a', 'Post A', '2026-04-01T00:00:00.000Z'),
      makePost('b', 'Post B', '2026-03-01T00:00:00.000Z'),
      makePost('c', 'Post C', '2026-02-01T00:00:00.000Z'),
      makePost('d', 'Post D', '2026-01-01T00:00:00.000Z'),
    ]
    render(<LatestPosts posts={posts} />)
    expect(screen.getByText('Post A')).toBeTruthy()
    expect(screen.getByText('Post C')).toBeTruthy()
    expect(screen.queryByText('Post D')).toBeNull()
  })

  it('shows an empty state when there are no posts', () => {
    render(<LatestPosts posts={[]} />)
    expect(screen.getByText(/no posts yet/i)).toBeTruthy()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test src/components/home/LatestPosts.test.tsx
```

Expected: FAIL with "Cannot find module './LatestPosts'".

- [ ] **Step 7: Write minimal LatestPosts implementation**

Create `src/components/home/LatestPosts.tsx`:

```tsx
import Link from 'next/link'
import type { Post } from '@/lib/types'
import { PostCard } from '@/components/blog/PostCard'

export function LatestPosts({ posts }: { posts: Post[] }) {
  const latest = posts.slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Latest writing</h2>
        <Link href="/blog" className="text-sm text-accent hover:underline">
          All posts →
        </Link>
      </div>
      {latest.length === 0 ? (
        <p className="text-sm text-muted">No posts yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
pnpm test src/components/home/LatestPosts.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 9: Replace `src/app/page.tsx`**

```tsx
import { getAllPosts } from '@/lib/aggregate'
import { Hero } from '@/components/home/Hero'
import { LatestPosts } from '@/components/home/LatestPosts'

export const dynamic = 'force-static'

export default async function HomePage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <hr className="border-border" />
      <LatestPosts posts={posts} />
    </div>
  )
}
```

- [ ] **Step 10: Replace `src/app/page.test.tsx`**

The Task 1 placeholder test asserted only that a `<main>` landmark exists. Replace it with a real assertion now that the page has content:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => []),
}))

describe('HomePage', () => {
  it('renders the hero name heading', async () => {
    const { default: HomePage } = await import('./page')
    const ui = await HomePage()
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})
```

- [ ] **Step 11: Run the full test suite**

```bash
pnpm test
```

Expected: PASS — all suites green, including the new `page.test.tsx`.

- [ ] **Step 12: Verify the build**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add src/components/home/Hero.tsx src/components/home/Hero.test.tsx src/components/home/LatestPosts.tsx src/components/home/LatestPosts.test.tsx src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: build home page with hero and latest posts"
```

---

## Task 16: Blog index page

**Files:**
- Create: `src/app/blog/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts` (Task 8), `BlogExplorer` (Task 14).
- Produces: the `/blog` route.

- [ ] **Step 1: Create `src/app/blog/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { BlogExplorer } from '@/components/blog/BlogExplorer'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Blog — Abdur Rakib',
  description: 'Posts aggregated from dev.to, Hashnode, and Medium.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 max-w-[56ch] text-muted">
          Every post I publish, pulled from all three platforms into one feed.
          Cross-posts are de-duplicated; each post links back to its original.
        </p>
      </div>
      <BlogExplorer posts={posts} />
      <p className="border-t border-border pt-6 text-center font-mono text-xs text-muted-foreground">
        Aggregated from dev.to · Hashnode · Medium
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Write a route-level test**

Create `src/app/blog/page.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Post } from '@/lib/types'

const post: Post = {
  id: 'devto-a', title: 'Custom Kong Plugins', slug: 'a', excerpt: 'excerpt', content: 'body',
  contentFormat: 'markdown', coverImage: null, publishedAt: '2026-05-01T00:00:00.000Z',
  tags: ['kong'], source: 'devto', alsoOn: [], originalUrl: 'https://dev.to/a', isPaywalled: false,
}

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => [post]),
}))

describe('BlogPage', () => {
  it('renders the aggregated caption and post list', async () => {
    const { default: BlogPage } = await import('./page')
    const ui = await BlogPage()
    render(ui)

    expect(screen.getByText('Aggregated from dev.to · Hashnode · Medium')).toBeTruthy()
    expect(screen.getByText('Custom Kong Plugins')).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run test to verify it passes**

```bash
pnpm test src/app/blog/page.test.tsx
```

Expected: PASS (1 test). This is a "write test, verify it passes immediately" step because the page composes only already-tested pieces (`BlogExplorer`, `getAllPosts`) — the test here is an integration check, not driving new logic.

- [ ] **Step 4: Verify the build**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/page.tsx src/app/blog/page.test.tsx
git commit -m "feat: add blog index page"
```

---

## Task 17: Post detail page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/app/blog/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `getAllPosts` (Task 8), `SourceBadge` (Task 13), `hasOnSitePage` (routing helper), and `Post` (Task 2).
- Produces: the `/blog/[slug]` route with `generateStaticParams` and
  `generateMetadata`; only full, non-paywalled Hashnode HTML posts are included.

- [ ] **Step 1: Write the failing route test**

The route test should verify that a full Hashnode HTML post is rendered and
that only eligible Hashnode posts are returned by `generateStaticParams`.

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostBody } from './PostBody'
import type { Post } from '@/lib/types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'x', title: 'x', slug: 'x', excerpt: '', content: '', contentFormat: 'markdown',
    coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z', tags: [], source: 'devto',
    alsoOn: [], originalUrl: 'https://dev.to/x', isPaywalled: false, ...overrides,
  }
}

describe('PostBody', () => {
  it('renders markdown content as HTML', () => {
    const post = makePost({ content: '# Heading\n\nBody text.', contentFormat: 'markdown' })
    render(<PostBody post={post} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeTruthy()
    expect(screen.getByText('Body text.')).toBeTruthy()
  })

  it('renders sanitized HTML content directly', () => {
    const post = makePost({ content: '<p>Already sanitized.</p>', contentFormat: 'html' })
    render(<PostBody post={post} />)
    expect(screen.getByText('Already sanitized.')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/blog/PostBody.test.tsx
```

Expected: FAIL with "Cannot find module './PostBody'".

- [ ] **Step 3: Write minimal PostBody implementation**

Create `src/components/blog/PostBody.tsx`:

```tsx
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import type { Post } from '@/lib/types'

export function PostBody({ post }: { post: Post }) {
  if (post.contentFormat === 'html') {
    return (
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    )
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeSlug, rehypeHighlight]}>{post.content}</ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/components/blog/PostBody.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Create the post detail page**

Create `src/app/blog/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { PostBody } from '@/components/blog/PostBody'
import { SourceBadge } from '@/components/blog/SourceBadge'

export const dynamic = 'force-static'
export const dynamicParams = false

type PageParams = { source: string; slug: string }

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ source: post.source, slug: post.slug }))
}

async function getPost(source: string, slug: string) {
  const posts = await getAllPosts()
  return posts.find((post) => post.source === source && post.slug === slug) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { source, slug } = await params
  const post = await getPost(source, slug)
  if (!post) return {}

  return {
    title: `${post.title} — Abdur Rakib`,
    description: post.excerpt,
    alternates: { canonical: post.originalUrl },
  }
}

export default async function PostPage({ params }: { params: Promise<PageParams> }) {
  const { source, slug } = await params
  const post = await getPost(source, slug)
  if (!post) notFound()

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <SourceBadge source={post.source} />
        {post.alsoOn.map((s) => (
          <SourceBadge key={s} source={s} />
        ))}
        <span>
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      {post.isPaywalled ? (
        <div className="flex flex-col gap-4">
          <p className="text-muted">{post.excerpt}</p>
          <a
            href={post.originalUrl}
            className="w-fit rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Read full article on Medium →
          </a>
        </div>
      ) : (
        <PostBody post={post} />
      )}
    </article>
  )
}
```

- [ ] **Step 6: Write the failing route test**

Create `src/app/blog/[slug]/page.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Post } from '@/lib/types'

const normalPost: Post = {
  id: 'devto-a', title: 'Custom Kong Plugins', slug: 'kong-plugins', excerpt: 'excerpt',
  content: '# Body\n\nText.', contentFormat: 'markdown', coverImage: null,
  publishedAt: '2026-05-01T00:00:00.000Z', tags: ['kong'], source: 'devto', alsoOn: [],
  originalUrl: 'https://dev.to/a', isPaywalled: false,
}

const paywalledPost: Post = {
  ...normalPost,
  id: 'medium-b', slug: 'paywalled-post', source: 'medium', isPaywalled: true,
  originalUrl: 'https://medium.com/p/b', contentFormat: 'html', content: '<p>Teaser.</p>',
}

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => [normalPost, paywalledPost]),
}))

describe('PostPage', () => {
  it('renders the full body for a normal post', async () => {
    const { default: PostPage } = await import('./page')
    const ui = await PostPage({ params: Promise.resolve({ source: 'devto', slug: 'kong-plugins' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1, name: 'Custom Kong Plugins' })).toBeTruthy()
    expect(screen.getByText('Text.')).toBeTruthy()
  })

  it('renders the excerpt and a link to Medium for a paywalled post', async () => {
    const { default: PostPage } = await import('./page')
    const ui = await PostPage({ params: Promise.resolve({ source: 'medium', slug: 'paywalled-post' }) })
    render(ui)

    expect(screen.getByText('excerpt')).toBeTruthy()
    expect(screen.queryByText('Teaser.')).toBeNull()
    const link = screen.getByRole('link', { name: /read full article on medium/i })
    expect(link.getAttribute('href')).toBe('https://medium.com/p/b')
  })
})
```

- [ ] **Step 7: Run test to verify it passes**

```bash
pnpm test "src/app/blog/[slug]/page.test.tsx"
```

Expected: PASS (2 tests).

- [ ] **Step 8: Verify the build (checks `generateStaticParams` compiles)**

```bash
pnpm build
```

Expected: PASS. With no `.env.local` values reachable at build time in CI (they are — this runs locally with `.env.local` present), `generateStaticParams` returns an empty array gracefully because each loader early-returns `[]` when its env var is unset — no crash either way.

- [ ] **Step 9: Commit**

```bash
git add "src/app/blog/[slug]/page.tsx" "src/app/blog/[slug]/page.test.tsx"
git commit -m "feat: add post detail page with canonical metadata and paywall handling"
```

---

## Task 18: Resume page

**Files:**
- Create: `src/components/resume/ResumeEmbed.tsx`
- Create: `src/components/resume/ResumeEmbed.test.tsx`
- Create: `src/app/resume/page.tsx`

**Interfaces:**
- Consumes: `site` (Task 2).
- Produces: the `/resume` route.

- [ ] **Step 1: Write the failing test**

Create `src/components/resume/ResumeEmbed.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResumeEmbed } from './ResumeEmbed'
import { site } from '@/config/site'

describe('ResumeEmbed', () => {
  it('embeds the Drive preview iframe for the configured file id', () => {
    render(<ResumeEmbed />)
    const iframe = screen.getByTitle(`${site.name} résumé`)
    expect(iframe.getAttribute('src')).toBe(
      `https://drive.google.com/file/d/${site.resumeDriveFileId}/preview`
    )
  })

  it('links the download button to the Drive export URL', () => {
    render(<ResumeEmbed />)
    const link = screen.getByRole('link', { name: /download pdf/i })
    expect(link.getAttribute('href')).toBe(
      `https://drive.google.com/uc?export=download&id=${site.resumeDriveFileId}`
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/resume/ResumeEmbed.test.tsx
```

Expected: FAIL with "Cannot find module './ResumeEmbed'".

- [ ] **Step 3: Write minimal implementation**

Create `src/components/resume/ResumeEmbed.tsx`:

```tsx
import { site } from '@/config/site'

export function ResumeEmbed() {
  const previewUrl = `https://drive.google.com/file/d/${site.resumeDriveFileId}/preview`
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${site.resumeDriveFileId}`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Résumé</h1>
          <p className="mt-1 text-muted">{site.role}</p>
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/components/resume/ResumeEmbed.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Create the resume route**

Create `src/app/resume/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { ResumeEmbed } from '@/components/resume/ResumeEmbed'

export const metadata: Metadata = {
  title: 'Résumé — Abdur Rakib',
  description: 'Download or preview my résumé.',
}

export default function ResumePage() {
  return <ResumeEmbed />
}
```

- [ ] **Step 6: Verify the build**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 7: Upload the résumé and update the config**

Manual, one-time steps (not code):
1. Export the résumé to PDF.
2. Upload it to Google Drive.
3. Right-click the file → Share → change access to "Anyone with the link" → role "Viewer".
4. Copy the file ID from the share URL (the segment between `/d/` and `/view`).
5. Update `src/config/site.ts`: replace `resumeDriveFileId: 'REPLACE_WITH_GOOGLE_DRIVE_FILE_ID'` with the real ID.

```bash
pnpm test src/config/site.test.ts src/components/resume/ResumeEmbed.test.tsx
```

Expected: PASS (existing tests don't assert a specific ID value, so they remain green after the edit).

- [ ] **Step 8: Commit**

```bash
git add src/components/resume/ResumeEmbed.tsx src/components/resume/ResumeEmbed.test.tsx src/app/resume/page.tsx src/config/site.ts
git commit -m "feat: add resume page with embedded Google Drive PDF"
```

---

## Task 19: SEO — sitemap, robots, OG images

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/opengraph-image.tsx`
- Create: `src/app/blog/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `getAllPosts` (Task 8), `site` (Task 2).
- Produces: `/sitemap.xml`, `/robots.txt`, default OG image, per-post OG image.

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/aggregate'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  const staticRoutes = ['', '/blog', '/resume'].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }))

  const postRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.source}/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }))

  return [...staticRoutes, ...postRoutes]
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Create the default OG image**

Create `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { site } from '@/config/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#a1a1aa', marginBottom: 16 }}>{site.location}</div>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 12 }}>{site.role}</div>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 4: Create the per-post OG image**

Create `src/app/blog/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { getAllPosts } from '@/lib/aggregate'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ source: string; slug: string }>
}) {
  const { source, slug } = await params
  const posts = await getAllPosts()
  const post = posts.find((p) => p.source === source && p.slug === slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 24, color: '#a1a1aa', marginBottom: 20 }}>{post?.source ?? 'blog'}</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15 }}>{post?.title ?? 'Post not found'}</div>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 5: Verify the build produces the routes**

```bash
pnpm build
```

Expected: PASS. Check the build output listing includes `○ /sitemap.xml`, `○ /robots.txt`, `○ /opengraph-image`, and the dynamic per-post OG route.

- [ ] **Step 6: Run the full test suite**

```bash
pnpm test
```

Expected: PASS (no new tests — these are Next.js file-convention routes with no branching logic to unit test; correctness is verified by the build output and, post-deploy, by checking `/sitemap.xml` in a browser).

- [ ] **Step 7: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/app/opengraph-image.tsx "src/app/blog/[slug]/opengraph-image.tsx"
git commit -m "feat: add sitemap, robots, and OG image generation"
```

---

## Task 20: Revalidate API route

**Files:**
- Create: `src/app/api/revalidate/route.ts`
- Create: `src/app/api/revalidate/route.test.ts`

**Interfaces:**
- Produces: `POST /api/revalidate`, guarded by `x-revalidate-secret` header matching `process.env.REVALIDATE_SECRET`.

- [ ] **Step 1: Write the failing test**

Create `src/app/api/revalidate/route.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('POST /api/revalidate', () => {
  it('returns 401 when the secret header is missing', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'correct-secret')
    const { POST } = await import('./route')

    const res = await POST(new Request('http://localhost/api/revalidate', { method: 'POST' }))

    expect(res.status).toBe(401)
  })

  it('returns 401 when the secret header is wrong', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'correct-secret')
    const { POST } = await import('./route')

    const res = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': 'wrong-secret' },
      })
    )

    expect(res.status).toBe(401)
  })

  it('revalidates /blog and returns 200 when the secret matches', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'correct-secret')
    const { revalidatePath } = await import('next/cache')
    const { POST } = await import('./route')

    const res = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': 'correct-secret' },
      })
    )

    expect(res.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/app/api/revalidate/route.test.ts
```

Expected: FAIL with "Cannot find module './route'".

- [ ] **Step 3: Write minimal implementation**

Create `src/app/api/revalidate/route.ts`:

```ts
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret')

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  revalidatePath('/blog')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test src/app/api/revalidate/route.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Verify the build**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/revalidate/route.ts src/app/api/revalidate/route.test.ts
git commit -m "feat: add secret-guarded revalidate endpoint for blog webhooks"
```

- [ ] **Step 7: Wire dev.to and Hashnode webhooks (manual, post-deploy)**

Once deployed (Task 22), configure:
- dev.to: Settings → Extensions → Webhooks → add `POST https://<your-domain>/api/revalidate` with header `x-revalidate-secret: <REVALIDATE_SECRET>`, event `article_updated`.
- Hashnode: Publication → Webhooks → add the same URL/header for the `post_published` and `post_updated` events.

This step cannot be scripted — both platforms require configuring the webhook through their web dashboards.

---

## Task 21: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: a CI check that runs on every PR to `main` — install, typecheck, lint, test, build.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
        env:
          DEVTO_USERNAME: ${{ secrets.DEVTO_USERNAME }}
          HASHNODE_HOST: ${{ secrets.HASHNODE_HOST }}
          MEDIUM_USERNAME: ${{ secrets.MEDIUM_USERNAME }}
          REVALIDATE_SECRET: ${{ secrets.REVALIDATE_SECRET }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
```

- [ ] **Step 2: Validate the YAML parses**

```bash
ruby -ryaml -e "YAML.load_file('.github/workflows/ci.yml'); puts 'valid'"
```

Expected: `valid`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for typecheck, lint, test, build"
```

---

## Task 22: GitHub Actions deploy workflow and Vercel linking

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: an automatic Vercel production deploy on every push to `main`.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

- [ ] **Step 2: Validate the YAML parses**

```bash
ruby -ryaml -e "YAML.load_file('.github/workflows/deploy.yml'); puts 'valid'"
```

Expected: `valid`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow to deploy to Vercel on push to main"
```

- [ ] **Step 4: Push the repo and link Vercel (manual, one-time)**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

Then:

```bash
npm i -g vercel
vercel link
```

This creates `.vercel/project.json`. Copy `orgId` and `projectId` from it.

- [ ] **Step 5: Add GitHub repo secrets (manual, one-time)**

In GitHub: Settings → Secrets and variables → Actions, add:

| Secret | Value source |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` |
| `DEVTO_USERNAME` | your dev.to handle |
| `HASHNODE_HOST` | e.g. `abdur-rakib.hashnode.dev` |
| `MEDIUM_USERNAME` | e.g. `@abdur-rakib` |
| `REVALIDATE_SECRET` | any random string |
| `NEXT_PUBLIC_SITE_URL` | your production URL, e.g. `https://abdurrakib.dev` |

- [ ] **Step 6: Add the same environment variables in the Vercel dashboard (manual, one-time)**

Project → Settings → Environment Variables — add `DEVTO_USERNAME`, `HASHNODE_HOST`, `MEDIUM_USERNAME`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL` for the Production environment.

- [ ] **Step 7: Verify the deploy**

Push to `main` and confirm in the GitHub Actions tab that both `CI` and `Deploy` workflows run and succeed, then visit the Vercel-assigned URL and confirm Home, Blog, and Resume all render.

---

## Self-Review

**Spec coverage:**
- Pages `/`, `/blog`, `/blog/[slug]`, `/resume` — Tasks 15–18, 20. ✓
- Data types, loaders, dedupe, aggregate — Tasks 2–8. ✓
- Site config replacing `resume.json` — Task 2. ✓
- Design tokens (light/dark) — Task 9. ✓
- Layout (Navbar/Footer/theme toggle) — Tasks 10–12. ✓
- Blog filters — Task 14. ✓
- SEO (sitemap, robots, OG, canonical) — Task 19, canonical also in Task 17. ✓
- Docker — Task 1. ✓
- CI/CD — Tasks 21–22. ✓
- Resume Drive PDF embed + download — Task 18. ✓
- Cost/hosting — Task 22 (Vercel Hobby). ✓
- Home label relocation (Dhaka as location chip, aggregation caption in blog footer) — Tasks 15, 16. ✓
- Not-in-scope items (projects, About, contact form) — correctly absent from all tasks. ✓

**Placeholder scan:** no "TBD"/"TODO" in code logic. The one literal placeholder value (`REPLACE_WITH_GOOGLE_DRIVE_FILE_ID` in `site.ts`) is inherently user-supplied — it cannot exist before the user uploads a file to their own Drive — and Task 18 Step 7 gives the exact manual steps and file to edit to replace it. This is data the engineer fills in, not a missing plan step.

**Type consistency:** `Post`/`PostSource` (Task 2) used identically across Tasks 3–19 — checked `contentFormat: 'markdown' | 'html'`, `alsoOn: PostSource[]`, `source: PostSource` match between producers (loaders, dedupe) and consumers (PostCard, PostBody, SourceBadge) throughout. `combinePosts`/`getAllPosts` (Task 8) signature matches every page's `await getAllPosts()` call (Tasks 15–17, 19).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-16-portfolio-site-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
