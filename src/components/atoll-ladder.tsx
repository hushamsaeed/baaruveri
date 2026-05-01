import { Link } from "@/i18n/navigation";
import { L } from "./i18n-text";
import type { Island } from "@/lib/types";

// Schematic geographic index of the featured islands. Saafu approach: no
// basemap, no MapLibre — a print-document "atoll ladder" running north
// to south, with featured islands marked at their atoll position. Click
// a marker → island profile.
//
// The ordering is geographic. Atoll codes follow the official 27-letter
// administrative scheme (single uppercase letters for atolls + a few
// digraphs for compound atolls like HDh, GnA).

// North-to-south order of all atolls Baaruveri might surface; only the
// ones with featured islands get rendered, but the ordering is locked
// here so future additions sit in the right place automatically.
const ATOLL_NORTH_TO_SOUTH: readonly string[] = [
  "HA",
  "HDh",
  "Sh",
  "N",
  "R",
  "B",
  "Lh",
  "K",
  "AA",
  "ADh",
  "V",
  "M",
  "F",
  "Dh",
  "Th",
  "L",
  "GA",
  "GDh",
  "Gn",
  "S",
];

interface AtollLadderProps {
  islands: readonly Island[];
  labels: {
    eyebrow: string;
    n_label: string;
    s_label: string;
    footnote: string;
    open: string;
  };
}

export function AtollLadder({ islands, labels }: AtollLadderProps) {
  // Group by atoll_code; preserve the n→s order from the canonical list.
  const byAtoll = new Map<string, Island[]>();
  for (const i of islands) {
    const bucket = byAtoll.get(i.atoll_code);
    if (bucket) bucket.push(i);
    else byAtoll.set(i.atoll_code, [i]);
  }
  const ordered = ATOLL_NORTH_TO_SOUTH.filter((code) => byAtoll.has(code));

  return (
    <section className="border border-border bg-card">
      <div className="flex items-baseline justify-between px-5 py-3 border-b border-border">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">
            00
          </span>
          <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
            <L>{labels.eyebrow}</L>
          </h2>
        </div>
        <span className="font-mono text-[10.5px] text-muted-foreground uppercase tracking-[0.14em]">
          {labels.n_label} ↓ {labels.s_label}
        </span>
      </div>

      <ul className="divide-y divide-border">
        {ordered.map((code, index) => {
          const atollIslands = byAtoll.get(code)!;
          // Schematic horizontal position: snap to a 0..100 scale based on
          // the position in the n→s sequence. Pure visual cue — not real
          // latitude. Helps the eye track north-to-south flow.
          const yProgress = ordered.length === 1 ? 0.5 : index / (ordered.length - 1);
          return (
            <li key={code} className="px-5 py-4">
              <div className="grid grid-cols-[5rem_1fr] sm:grid-cols-[6rem_1fr] gap-4 items-baseline">
                <div className="flex flex-col">
                  <span className="font-mono text-[12px] font-semibold text-foreground">
                    {code}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {atollIslands[0].atoll_en}
                  </span>
                  <span className="dv-text text-[12px] text-muted-foreground">
                    {atollIslands[0].atoll_dv}
                  </span>
                </div>
                <div className="relative">
                  {/* Hairline rail */}
                  <div className="h-px bg-border absolute inset-x-0 top-2.5" />
                  {/* Island markers along the rail */}
                  <ul className="relative flex flex-wrap gap-x-6 gap-y-2">
                    {atollIslands.map((island) => (
                      <li key={island.id}>
                        <Link
                          href={`/atlas/${island.slug}`}
                          className="group inline-flex items-baseline gap-2 text-[13px] hover:text-primary transition-colors"
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full bg-[color:var(--primary)] -translate-y-[1px] group-hover:scale-125 transition-transform"
                            aria-hidden
                          />
                          <span className="dv-text font-semibold">
                            {island.name_dv}
                          </span>
                          <span className="text-muted-foreground">
                            {island.name_en}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <span className="sr-only">
                north-south position {Math.round(yProgress * 100)}%
              </span>
            </li>
          );
        })}
      </ul>

      <p className="px-5 py-3 border-t border-border text-[11px] text-muted-foreground">
        <L>{labels.footnote}</L>
      </p>
    </section>
  );
}
