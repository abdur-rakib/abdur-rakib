# Graph Report - .  (2026-08-05)

## Corpus Check
- Corpus is ~22,818 words - fits in a single context window. You may not need a graph.

## Summary
- 255 nodes · 350 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Lint Dependencies
- Runtime Dependencies
- TypeScript Configuration
- Blog Pages
- Post Components
- Site Layout
- UI Component System
- Content Data Pipeline
- Project Metadata
- ESLint Configuration
- Shared UI Primitives
- Next Configuration
- PostCSS Configuration
- Sitemap Tests

## God Nodes (most connected - your core abstractions)
1. `Post` - 16 edges
2. `compilerOptions` - 16 edges
3. `getAllPosts()` - 11 edges
4. `site` - 8 edges
5. `scripts` - 7 edges
6. `tailwind` - 6 edges
7. `aliases` - 6 edges
8. `PostCard()` - 6 edges
9. `dedupeAndSort()` - 5 edges
10. `estimateReadingMinutes()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `generateStaticParams()` --calls--> `getAllPosts()`  [EXTRACTED]
  src/app/blog/[slug]/page.tsx → src/lib/aggregate.ts
- `generateMetadata()` --calls--> `getAllPosts()`  [EXTRACTED]
  src/app/blog/[slug]/page.tsx → src/lib/aggregate.ts
- `BlogPage()` --calls--> `getAllPosts()`  [EXTRACTED]
  src/app/blog/page.tsx → src/lib/aggregate.ts
- `HomePage()` --calls--> `getAllPosts()`  [EXTRACTED]
  src/app/page.tsx → src/lib/aggregate.ts
- `sitemap()` --calls--> `getAllPosts()`  [EXTRACTED]
  src/app/sitemap.ts → src/lib/aggregate.ts

## Import Cycles
- None detected.

## Communities (19 total, 3 thin omitted)

### Community 0 - "Lint Dependencies"
Cohesion: 0.06
Nodes (35): eslint, eslint-config-next, @eslint/eslintrc, jsdom, devDependencies, eslint, eslint-config-next, @eslint/eslintrc (+27 more)

### Community 1 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (31): @base-ui/react, class-variance-authority, clsx, fast-xml-parser, lucide-react, next, dependencies, @base-ui/react (+23 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/*, **/*.ts (+20 more)

### Community 3 - "Blog Pages"
Cohesion: 0.12
Nodes (18): BlogPage(), metadata, formatDate(), generateMetadata(), generateStaticParams(), PostPage(), PostPageParams, SOURCE_ICONS (+10 more)

### Community 4 - "Post Components"
Cohesion: 0.14
Nodes (14): post, paywalled, post, formatDate(), PostCard(), post, COLORS, LABELS (+6 more)

### Community 5 - "Site Layout"
Cohesion: 0.13
Nodes (15): metadata, Hero(), SOCIALS, GithubIcon(), HashnodeIcon(), LinkedinIcon(), MediumIcon(), Footer() (+7 more)

### Community 6 - "UI Component System"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "Content Data Pipeline"
Cohesion: 0.17
Nodes (13): estimateReadingMinutes(), excerptFromHtml(), fetchHashnode(), HashnodeItem, parser, toPost(), excerptFromHtml(), fetchMedium() (+5 more)

### Community 8 - "Project Metadata"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, start, test (+2 more)

### Community 9 - "ESLint Configuration"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 10 - "Shared UI Primitives"
Cohesion: 0.70
Nodes (3): Button(), buttonVariants, cn()

## Knowledge Gaps
- **112 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Lint Dependencies` to `Project Metadata`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Project Metadata`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Post` connect `Post Components` to `Blog Pages`, `Content Data Pipeline`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Lint Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._