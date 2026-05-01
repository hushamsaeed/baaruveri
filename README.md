# Baaruveri · ބާރުވެރި

> "Empowered" — a citizen civic platform for the Maldives.

Per-island civic data made legible. Threaded debate by issue × island. eFaas-verified petitions with threshold-triggered government response.

**Status:** v0 + v1 polish shipped. Concept prototype, not an official Government of Maldives product.

**Live:** https://baaruveri.thecrayfish.tech

## What's shipped

- **Atlas** (`/atlas`) — civic profiles for 6 representative islands: Malé, Hulhumalé, Addu City, Kulhudhuffushi, Fuvahmulah, Maafaru. Each profile carries population, voter register, council seats, FY26 budget table (footnoted), council members, recent threads, open petitions.
- **Sandbar** (`/sandbar`) — threaded debate by issue × island. Hero thread (Maafaru airport public-benefit accounting) is fully wired with Pros/Cons claim columns and a civic-data sidebar that pulls the relevant island's facts. Other threads route to a polite v0 stub.
- **Petitions** (`/petitions`, `/petitions/[id]`) — threshold cascade (per-island council response at 5% of registered voters, parliament agenda at 5,000 national signatures). eFaas-stubbed sign flow with optimistic counter update and the Cheong Wa Dae-style live-dot pulse.
- **Open data** (`/datasets`) — every aggregate downloadable as CSV + queryable as JSON, no signup. Per-island filter via `?island=<slug>`.
- **Moderation policy** (`/about/moderation`) — eight sections covering identity tiers, takedown protocol, threat model for the CIVICUS-rated "obstructed" civic space.
- **Bilingual** — `/dv` (Dhivehi RTL primary) and `/en` (English), full chrome translation via `next-intl`. Locale switcher in the top nav.

## Stack

Next.js 16 (App Router, RSC, `proxy.ts` middleware convention) · TypeScript · Tailwind CSS v4 with logical properties for RTL · shadcn/ui · `next-intl` 4 · MV Faseyha + MV Vaadhoo Dhivehi web fonts via [RaajjeFonts](https://raajjefonts.github.io) CDN · IBM Plex Mono for tabular numerals · Inter for Latin body. Petitions use a v0 in-memory store + cookie-based eFaas stub; Postgres + Drizzle + real Auth.js v5 OIDC adapter land post-v0.

Saafu visual direction — a Pentagram-style civic-ledger aesthetic with hairline rules, gazette teal `#0d6e6e` accent, and tabular numerals signature. Picked from a 3-direction `huashu-design` study; the canonical spec lives at [`design-studies/baaruveri-directions.html`](design-studies/baaruveri-directions.html).

## Develop

```bash
pnpm install
cp .env.local.example .env.local            # postgres connection string
docker compose up -d postgres                # local Postgres on 5444
pnpm db:migrate                              # apply schema
pnpm db:seed                                 # populate fixtures (after step 3 of the migration plan lands)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the `proxy.ts` middleware redirects to `/dv` (default locale). Drizzle Studio is available via `pnpm db:studio`.

## Deploy

The production deploy lives on a self-hosted Dokploy + Traefik + Letsencrypt stack. Manual redeploy command is documented in the project memory under `reference_deploy.md`. The repo ships a multi-stage `Dockerfile` (Node 22 alpine, pnpm, Next.js standalone output).

## Project memory

Persistent context — design direction, content fidelity rules, deploy notes, references — lives at `~/.claude/projects/-Users-husham-baaruveri/memory/`. Start with `MEMORY.md` for the index.

## Licence

Code: MIT (intent — `LICENSE` to land alongside v2). Open-data exports: ODbL 1.0 (intent). Content authored on the platform is the author's; CC-BY-SA 4.0 by default for accountability discourse.

## Concept prototype disclaimer

This is a research and design prototype. It is not affiliated with, endorsed by, or operated by the Government of Maldives or any of its agencies. The eFaas integration is currently a stub for development purposes. Council, budget, and threshold figures are illustrative until live data feeds wire.
