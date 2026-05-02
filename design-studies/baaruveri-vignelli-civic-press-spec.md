# Baaruveri Holhuashi · Vignelli Civic Press
## Locked design system — direction-1

> **Status:** locked 2026-05-02. Supersedes Saafu (Pentagram civic-ledger).
> **Lineage:** Massimo Vignelli — NYC Subway Map, Knoll catalogues, Heller dishware, the Vignelli Canon.
> **Tone:** declarative · civic-monumental · transit-confident · editorial · primary.
> **Scope:** governs every public surface — Holhuashi feed, topic detail, Sandbar threads, Atlas profiles, Petitions, search results, profile pages.
> **Canonical visual reference:** `direction-1-vignelli.html` (home, EN), `direction-1-vignelli-detail.html` (topic detail), `direction-1-vignelli-dv.html` (home, DV RTL).

---

## 1. Core principle

The platform is rendered as a public-square poster — the citizen's transit map for civic accountability. Every page reads as one panel of the same civic-press publication. The Saafu/Holhuashi register split is dissolved: there is no "soft social register" and "archival back-office" any more. **One register, applied everywhere, set with rigor.**

Three rules carry the philosophy:

1. **Numbers are monumental.** Every count, every figure, every counter is set in Archivo Black at 28–48px. The data line is the visual line.
2. **Color carries category, never decoration.** The four problem-level lanes are colored. Identity tier is colored. Nothing else is colored.
3. **Photography is forbidden in the feed surface.** Color blocks and type do all the work. Cover thumbs of islands appear only on the Atlas profile surface, never in the feed.

---

## 2. Color tokens

```
--paper           #f4ebd8     warm cream — Knoll-catalogue paper
--paper-rule      #d4c9b0     hairline rule on paper, warm
--paper-deep      #ece2c8     subtle alternation for ledger rows

--ink             #0f0f0f     near-black ink
--ink-soft        #2e2e2e     secondary ink

/* The four lanes — Maldivian flag tones, editorial-tuned */
--vignelli-red    #c4221e     PARLIAMENTARY · mosque-roof red
--vignelli-green  #1e5f3d     COUNCIL · palm green
--vignelli-ochre  #d99a1f     PRESIDENCY · turmeric ochre
--vignelli-ink    #0f0f0f     JUDICIARY · ink only (no color)
```

**Forbidden colors.** No purple. No teal. No pastel of any kind. No gradient anywhere. No drop shadows. No semi-transparent overlays except on the live-dot pulse.

**Inversion rule.** Solid `--ink` blocks carry `--paper` text. Solid `--vignelli-red`/`--vignelli-green` blocks carry `--paper` text. The lanes are the only colors that can ever be a *background* — never decorate type with them at small sizes (under 24px), only at 28px+ display.

**Single-use coral.** The `--coral` accent from the studio drafts is dropped. Vignelli civic-press uses no coral. If a "single attention point" is needed (live-dot, election-period live indicator), it is `--vignelli-red`.

---

## 3. Type system

Three Latin faces, two Dhivehi weights. No more, no less.

```
Display       Archivo Black       — hero topic titles, ledger numerals, masthead
Body / UI     Archivo (700/600)   — anchor strips, lane labels, button labels
              Archivo (500)       — small caps, captions
Reading body  Inter 500/400       — lede paragraphs, claim bodies, reading copy
Data          JetBrains Mono      — IDs, deltas, dates, footnotes, source-link tags

Dhivehi       MV Faseyha 700      — hero titles, lane labels, masthead
              MV Faseyha 400      — body
```

**Display rules.**
- Hero topic title: Archivo Black, 44–56px, line-height 0.95, letter-spacing −0.025em, ALL CAPS.
- Sub-display: Archivo Black, 28–36px, ALL CAPS. Used for ledger values and ordinal headers.
- Section heads: Archivo Black, 14px, ALL CAPS, letter-spacing 0.06em.

**Dhivehi parity.**
- Whenever Archivo Black is used at hero scale (28px+), MV Faseyha 700 is set at *visually matched* weight beside it. Dhivehi gets the same line-height treatment, sized 6–10px smaller than the Latin to balance the optical weight of Thaana strokes (e.g. EN 56 / DV 48).
- For the DV RTL pass, MV Faseyha 700 takes hero priority and Archivo Black becomes the smaller, secondary line. Bilingual visual parity is preserved — the rule is "primary locale gets the larger size; both get the same weight family."

**Body rules.**
- Lede: Inter 500, 16px, line-height 1.45, max-width 56ch.
- Claim body: Inter 400, 14–16px, line-height 1.55, max-width 60ch.
- Captions / metadata: Archivo 700 (sans) for *labels*, Inter 400 for *prose annotations*.

**Numerals.**
- All civic figures use `font-variant-numeric: tabular-nums` (`tnum`).
- Hero numbers (claim count, signature count) use Archivo Black at 28–48px.
- Inline-data numbers (view counts, claim IDs, dates) use JetBrains Mono.
- Never mix display numerals with mono numerals in the same row.

---

## 4. Lane system (problem level)

The four constitutional branches are the *transit lanes* of the platform. Each lane has a number, a name, a Dhivehi label, and a color.

| ID | EN label | DV label | Color | Token |
|----|----------|----------|-------|-------|
| 01 | JUDICIARY | ކޯޓާ ގުޅޭ | ink (`#0f0f0f`) | `--vignelli-ink` |
| 02 | PARLIAMENTARY | މަޖިލީހާ ގުޅޭ | red (`#c4221e`) | `--vignelli-red` |
| 03 | PRESIDENCY | ރައީސާ ގުޅޭ | ochre (`#d99a1f`) | `--vignelli-ochre` |
| 04 | COUNCIL | ކައުންސިލާ ގުޅޭ | green (`#1e5f3d`) | `--vignelli-green` |

**Surfacing.**
- The lane rail at the top of the home feed renders all four as numbered, colored display blocks.
- Topic cards carry a left-side 8px solid color flag in their lane's color.
- Anchor strips inside cards carry a solid color block for the lane (white type on lane color, all caps).
- Filter active state is the inverse: lane block becomes ink-on-paper outlined.

**Forbidden.** Do not use the lane colors decoratively (e.g. as text accents, as button hover states). Lane colors only mark categorical identity. Nothing else.

---

## 5. Identity tiers

| Tier | Card background | Type color | Pseudonym/name display |
|------|-----------------|------------|------------------------|
| Verified-public · citizen | `--paper` | `--ink` | `FIRSTNAME LASTNAME` (Archivo 700, ALL CAPS) |
| Verified-public · council | `--vignelli-green` | `--paper` | `NAME` + `COUNCIL · ISLAND` |
| Verified-public · journalist | `--vignelli-red` | `--paper` | `NAME` + `JOURNALIST · OUTLET` |
| Verified-shielded | `--ink` | `--paper` | `@PSEUDONYM` (JetBrains Mono) + `VERIFIED · SHIELDED · ISLAND` |
| Anonymous (read-only on Adu) | n/a — cannot post Adu | n/a | n/a |

**Audio-only Adu (verified-shielded).** Rendered as a solid `--ink` block. The "audio-ness" is signaled by a typeset waveform — vertical solid `--paper` bars of varied height set in a flex row. No literal waveform animation in the static spec; if motion is needed in production, it animates with a 1.6s ease-in-out sine pulse, never a continuous random fluctuation.

**Forbidden.** No avatar photography in the feed surface. No monogram circles. No emoji-as-icons. No cartoon-style anything. The tier is read by the card's color and label, not by a portrait.

---

## 6. Layout grid

**Desktop (≥ 1280px).**
- Three-column structure: `240px | 1fr | 280px` for home; `1fr | 280px` for topic detail (sidebar reserved for civic-data ledger).
- Outer page padding: `0` (the page bleeds to edge — Vignelli is poster-rigid).
- Internal padding inside topic articles: `28px 36px 32px`.
- Ledger row gutter: `0` (no gap; cells are separated by 1px hairline, not whitespace).

**Tablet (768–1279px).**
- Side index and posting rail collapse below the feed. Lane rail keeps its 4-column structure.

**Mobile (≤ 767px).**
- Lane rail becomes a horizontal scroller with the 4 lane chips inline.
- Side index becomes a collapsing drawer triggered by a top-bar "INDEX" button.
- Posting rail becomes a card at the bottom of each topic.
- Topic title stays at hero scale (this is the Vignelli signature — even on mobile, monumentality wins over compactness).
- The compose CTA becomes a fixed bottom-bar `--vignelli-red` block, full-width, "POST →".

---

## 7. Component anatomy

### 7.1 Masthead (top of every page)

Three columns: `BAARUVERI HOLHUASHI` brand-block (Archivo Black 38px + MV Faseyha 700 30px) | publication strap line (Archivo 700 11px caps) | meta column (date, topic count, council count in JetBrains Mono).

Top border: `8px solid --ink`. Bottom border: `2px solid --ink`. Background: `--paper`.

### 7.2 Lane rail

Four-column grid, each lane a 14px-vertical-padded block. ID number in Archivo Black 36px, name in Archivo 700 11px caps with letter-spacing 0.1em, DV label in MV Faseyha 700 14px. Active lane inverts: `--ink` background with `--paper` type and the ID retains its lane color.

### 7.3 Topic card (home feed)

```
┌─────────────────────────────────────────────────┐ ← 8px solid lane-color flag on inset-start
│  [ISLAND·INK] [LANE·COLOR] [CATEGORY·UNDERLINED]│  T·02·MAA·001 (mono, top-end)
│                                                 │
│  HERO TITLE — ARCHIVO BLACK 44PX                │
│                                                 │
│  ހީރޯ ޓައިޓަލް — MV FASEYHA 700 36PX           │
│                                                 │
│  Lede in Inter 500 16px, max 56ch.<sup>fn</sup> │
│                                                 │
│  ╔═════════╤═════════╤═════════╤═══════════╗   │ ← ledger
│  ║ CLAIMS  │ SIGS    │ OPEN Q  │ RESPONSE  ║   │
│  ║ 47      │ 1,238   │ 3       │ 63%       ║   │
│  ║ ON SAND │ /5,000  │ 14d clk │ COUNCIL30D║   │
│  ╚═════════╧═════════╧═════════╧═══════════╝   │
│                                                 │
│  ┌─────┬─────┬─────┬─────┐                     │ ← Adu strip (4-up)
│  │POST │POST │POST │+5MO │                     │
│  │block│block│block│RE   │                     │
│  └─────┴─────┴─────┴─────┘                     │
│                                                 │
│  ╔═════════╤═════════╤═════════╤═══════════╗   │ ← reactions
│  ║ SOURCED │ CITE NEED│ COUNTER│ FOLLOWING ║   │
│  ║ 142     │ MANY     │ 31     │ A FEW     ║   │
│  ╚═════════╧═════════╧═════════╧═══════════╝   │
└─────────────────────────────────────────────────┘
border-bottom: 1px solid --ink
```

### 7.4 Adu strip post

Aspect ratio `3/4`. Solid color block keyed to identity tier. Three content slots vertically: top metadata (role, name in Archivo 700 caps), middle quote (Archivo 700 17px, line-height 1.15), bottom ordinal (Archivo Black 36px showing view count or duration).

For shielded audio-only posts, the middle slot becomes a typeset waveform of 12–15 vertical bars in `--paper` against `--ink` background.

### 7.5 Civic-data ledger (topic detail sidebar)

Tabular form, 4–6 rows × 2 columns. Left column: label in Archivo 700 caps 11px. Right column: value in Archivo Black 22–28px (when monumental) OR JetBrains Mono 14px (when inline). Hairline rule between rows. Sources cited in JetBrains Mono 9.5px caps with the lane-color highlight.

### 7.6 Pros / Cons claim tree (topic detail)

Single column, max-width 60ch. Each claim:
- A solid PRO (`--vignelli-green`) or CON (`--vignelli-red`) block tag at line-start, Archivo 700 caps 10px in `--paper` type, 8px padding.
- Claim ID in JetBrains Mono 10.5px after the tag.
- Claim body in Inter 400 14–16px, line-height 1.6.
- Source citations as JetBrains Mono 9px caps in lane color.
- Vote count and metadata in Archivo 700 caps 11px.
- Sub-claims inset 28px with a 1px ink hairline on the inset-start side.

### 7.7 Side index (categories)

Numbered list (`decimal-leading-zero` counter) of the 16 categories. Each item: ordinal in JetBrains Mono 10px caps, label in Inter 500 13px, padding 6px 0, hairline rule between rows. Active item inverts to `--ink` background with `--paper` type, full-bleed of the side rail.

### 7.8 Posting rail ("People posting on [island]")

Numbered list (01, 02, 03, 04). Each entry: ordinal in Archivo Black 22px in `--vignelli-red`, name in Archivo 700 caps 13px, role in Inter 400 11px (`--ink-soft`), reason in Inter 400 italic 11px (max 22ch).

### 7.9 Compose CTA

Single button, `--vignelli-red` background, `--paper` type, Archivo Black 18px caps, with a JetBrains Mono arrow `→`. Full-width of the side rail. Always reads "POST" (EN) or "ބަސް ނެރޭ" (DV).

The compose CTA is the only place orange-class verb-color appears anywhere on the platform, and even here it's `--vignelli-red`, not orange. Orange was the studio iteration; Vignelli civic-press tightens this to red — the lane color of Parliamentary, the most-active civic lane, doubles as the verb color.

### 7.10 Footer / colophon

`--ink` background, `--paper` type, JetBrains Mono 10.5px caps. Two columns: brand disclaimer ("BAARUVERI · CONCEPT PROTOTYPE — NOT AN OFFICIAL GOVERNMENT PRODUCT.") on inset-start, illustrative-figures notice on inset-end with `--vignelli-red` highlight on key terms.

---

## 8. RTL (Dhivehi-primary) rules

When `locale = dv`:

| Element | Visual change |
|---------|--------------|
| Document | `dir="rtl"` on the `.app` container |
| Lane rail | reads right-to-left — lane 01 Judiciary visually right, lane 04 Council visually left |
| Side index | swaps to inset-start (visual right in RTL) |
| Posting rail | swaps to inset-end (visual left in RTL) |
| Topic title pair | MV Faseyha 700 is the larger hero (44px), Archivo Black is secondary (32px ALL CAPS) |
| Card flag | the 8px lane-color stripe moves to inset-start (visual right) |
| Stats chips inline | read right-to-left |
| Tabular numerals | stay Latin (no Eastern Arabic numerals — preserves tabular alignment per FSD §10.3) |
| Topic ID badge (`T·02·MAA·001`) | stays LTR, same content; rendered in JetBrains Mono with explicit `dir="ltr"` to prevent the dot-numerals reversing |

The lane rail color encoding is identical in DV — colors are universally readable and don't translate.

---

## 9. Composition principles

1. **Number-first hierarchy.** When a number exists in a row, it is the largest type. Never bury a 1,238 under prose.
2. **Hairlines, not gaps.** Use 1px ink rules to separate, not whitespace. Vignelli paper is dense.
3. **All-caps for verbs and labels; mixed case for prose.** A label is "SIGNATURES." A sentence is "Has the airport delivered measurable public benefit."
4. **Color is data, not decoration.** Adding a color anywhere requires a categorical justification (which lane, which tier).
5. **Bleed the page.** No outer rounded corners on cards. No drop shadows. The page is set to its grid edge.
6. **Footnote, don't hide.** Mocked figures get a `<sup>illustrative</sup>` in JetBrains Mono in `--vignelli-red`. The disclosure is part of the design language, not a regret.
7. **Bilingual at the same weight.** Whenever EN appears, DV appears within ±10px and at the same weight family (Bold ↔ Bold). Never one faded.

---

## 10. Anti-patterns (do not do)

- ❌ Rounded corners on any card.
- ❌ Drop shadows of any kind.
- ❌ Avatar photography in the feed surface.
- ❌ Monogram circles for users.
- ❌ Emoji as icons.
- ❌ Gradients anywhere.
- ❌ Pastel colors.
- ❌ Italic for emphasis (Vignelli used italic only in citation/Newsreader-class contexts; in this system italics are reserved for the *posting rail "reason" line* and nowhere else).
- ❌ Multiple weights of the same Latin face within the same component (use Archivo Black for display, Archivo 700 for labels — never both at the same scale).
- ❌ Helvetica or Helvetica Neue (specifically — they are the AI-slop Vignelli reference; we use Archivo Black + Archivo as the Vignelli-faithful but non-Helvetica pairing).
- ❌ Decorating a `<sup>` footnote with a circle, parenthesis, or bracket. Just the raw `illustrative` token in mono red.

---

## 11. Implementation notes (for the baaruveri Next.js port)

The production stack is Next.js 16 + Tailwind v4 + shadcn/ui. The migration path:

1. **Tailwind theme tokens** — write the 12 color tokens above into `src/app/globals.css` `@theme inline`. Drop the existing Saafu tokens (`--color-teal`, etc.).
2. **Font imports** — `[locale]/layout.tsx` adds Google Fonts links for Archivo Black, Archivo, Inter, JetBrains Mono. MV Faseyha (regular + bold) stays loaded from RaajjeFonts CDN with the existing `@font-face` declarations.
3. **shadcn theme override** — map shadcn's `--background`, `--foreground`, `--primary`, `--border` to the Vignelli tokens (`--paper`, `--ink`, `--vignelli-red`, `--paper-rule`).
4. **Component refactor priorities** (suggested order, not required sequence):
   1. `top-nav.tsx` → masthead (no nav links — see homepage hero replacement)
   2. `homepage hero` → masthead + lane rail + topics list
   3. `thread-list-item.tsx` → topic card (anchor strip, ledger, Adu strip, reactions)
   4. `claim-tree.tsx` → Pros/Cons column with PRO/CON solid-block tags
   5. `civic-data-sidebar.tsx` → tabular ledger
   6. `atlas-card.tsx` → atlas profile (the only surface where cover thumbs of islands appear)
   7. `petition-list-item.tsx` → ledger row variant
   8. `claim-vote-button.tsx`, `claim-add-form.tsx` → keep functional, restyle
5. **Data shape changes:** none required. The existing schema supports this design verbatim.
6. **`design-studies/baaruveri-directions.html`** stays as historical record. A new `design-studies/baaruveri-vignelli-civic-press.html` (renamed copy of `direction-1-vignelli.html`) becomes the new canonical reference.
7. **Project memory** — `~/.claude/projects/-Users-husham-baaruveri/memory/project_design_direction.md` is updated to mark Vignelli civic-press as the new locked direction effective 2026-05-02, with Saafu archived as the prior direction.

The migration does not require a database change, does not break the existing API contract, and does not affect the open-data exports.

---

## 12. Surface-by-surface coverage

| Surface | Vignelli treatment | Reference HTML |
|---------|--------------------|----------------|
| Holhuashi home feed (EN) | Masthead + lane rail + side index + topics list + posting rail | `direction-1-vignelli.html` |
| Holhuashi home feed (DV RTL) | Same, mirrored; MV Faseyha 700 takes hero | `direction-1-vignelli-dv.html` |
| Topic detail | Hero title + expanded ledger + wide Adu strip + Pros/Cons column + civic-data sidebar + council-response clock | `direction-1-vignelli-detail.html` |
| Sandbar thread (legacy URL) | Same as topic detail; `/sandbar/[id]` redirects forward | (covered) |
| Petition page | Topic detail variant where the ledger is dominated by the signature counter; live-pulse on red dot | (style applies; surface deferred) |
| Atlas profile | First surface where photographic island covers appear; otherwise topic-card grammar | (style applies; surface deferred) |
| Profile page | Posting rail entry expanded; user's Adu posts in the Adu-strip grammar | (style applies; surface deferred) |
| Search results | Side index transposed; results as topic-card half-height variants | (style applies; surface deferred) |
| Notifications | Ledger rows with bold ordinal in `--vignelli-red` | (style applies; surface deferred) |

---

## 13. Decision log

- **2026-05-02** — Direction selected from a 3-way design-direction-consultant pass (Vignelli civic press / Field.io motion-poetics / Kenya Hara emptiness). Vignelli chosen for declarative civic-monumentality; "every post is a public-record poster, not a feed item."
- **2026-05-02** — Saafu (Pentagram civic-ledger, the prior locked direction) archived. The Saafu canon (`design-studies/baaruveri-directions.html`) is preserved as historical reference but is no longer the active design direction.
- **2026-05-02** — Coral accent dropped (was a candidate from the studio iteration). The four lane colors carry all categorical signal; `--vignelli-red` doubles as the verb-action color (compose CTA, footnote markers, live-pulse).
- **2026-05-02** — Photography forbidden in feed surface; Atlas profiles become the one surface where island covers appear.
- **2026-05-02** — All caps everywhere display, mixed case for reading prose, italic reserved for posting-rail reason lines only.
