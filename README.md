# Baaruveri · ބާރުވެރި

> "Empowered" — a citizen civic platform for the Maldives.

Per-island civic data made legible. Threaded debate by issue × island. eFaas-verified petitions with threshold-triggered government response.

**Status:** v0 in progress. Concept prototype, not an official Government of Maldives product.

## What's in v0

- **Atlas** — civic profiles for 6 representative islands (Malé, Hulhumalé, Addu City, Kulhudhuffushi, Fuvahmulah, Maafaru)
- **Sandbar** — community forum, threaded by issue and by island
- **Petitions** — threshold cascade: per-island council response → parliament agenda
- **Civic-data sidebar** — threads auto-pull the relevant island/issue data
- **Open-data parity** — every dashboard view exposes the underlying CSV + API

## Stack

Next.js 16 (App Router, RSC) · TypeScript · Tailwind CSS v4 · shadcn/ui · PostgreSQL + Drizzle ORM · Auth.js v5 (anon + eFaas-verified tiers) · next-intl (Dhivehi RTL primary + English) · MapLibre GL · MDX · Playwright + Vitest · Vercel.

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project memory

Persistent context for this project lives at `~/.claude/projects/-Users-husham-baaruveri/memory/`. Start with `MEMORY.md` for the index.
