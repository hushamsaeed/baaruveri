# syntax=docker/dockerfile:1.7
# ----- deps -----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ----- build -----
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ----- runtime -----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Migration runner + drizzle/ migrations folder. Drizzle's postgres-js
# migrator is ~50KB on top of drizzle-orm (already a runtime dep), so the
# image impact is negligible.
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate-prod.mjs ./scripts/migrate-prod.mjs
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs
EXPOSE 3000
# Apply pending migrations, then start the server. Migration is idempotent
# and skipped if already applied.
CMD ["sh", "-c", "node scripts/migrate-prod.mjs && node server.js"]
