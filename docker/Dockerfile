# syntax=docker/dockerfile:1

# ---- base: shared setup, dependency manifests only (maximizes layer cache) ----
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# ---- deps: install once, reused by dev and build stages ----
FROM base AS deps
RUN pnpm install --frozen-lockfile

# ---- dev: full source, hot reload via bind mount (see docker-compose.yml) ----
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---- build: compile the production bundle ----
FROM deps AS build
COPY . .
RUN pnpm build

# ---- runner: minimal production image, no pnpm/source/devDependencies ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
