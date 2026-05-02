import { getTranslations } from "next-intl/server";

// Vignelli civic-press lane rail — spec §4 + §7.2.
// Four constitutional branches as transit lanes. Each lane has a
// numbered ID, an EN label, a DV label, and a lane color.
// Active lane inverts: ink background with paper type, lane ID
// retains its color.
//
// Server component — pure layout. Filter logic (clicking a lane to
// filter the topic feed) is deferred to a later batch when the topic
// list itself is rebuilt; for now the rail surfaces lane identity
// and is visual-only.

export type Lane = "judiciary" | "parliamentary" | "presidency" | "council";

interface LaneSpec {
  id: string;
  lane: Lane;
  color: string;
  /** Dhivehi label is invariant across locales — appears next to the
   *  EN label on both /en and /dv. Hardcoded here verbatim from
   *  spec §4 so the value isn't accidentally machine-translated. */
  dvLabel: string;
}

const LANES: readonly LaneSpec[] = [
  { id: "01", lane: "judiciary", color: "var(--vignelli-ink)", dvLabel: "ކޯޓާ ގުޅޭ" },
  { id: "02", lane: "parliamentary", color: "var(--vignelli-red)", dvLabel: "މަޖިލީހާ ގުޅޭ" },
  { id: "03", lane: "presidency", color: "var(--vignelli-ochre)", dvLabel: "ރައީސާ ގުޅޭ" },
  { id: "04", lane: "council", color: "var(--vignelli-green)", dvLabel: "ކައުންސިލާ ގުޅޭ" },
];

interface LaneRailProps {
  /** Optional active-lane mark for inversion treatment. Hover/click
   *  to filter is wired by the surface that consumes the rail. */
  activeLane?: Lane | null;
}

export async function LaneRail({ activeLane }: LaneRailProps) {
  const t = await getTranslations("lane");
  return (
    <nav
      aria-label={t("rail_aria")}
      className="grid grid-cols-2 sm:grid-cols-4 border-b-[2px]"
      style={{ borderBottomColor: "var(--ink)" }}
    >
      {LANES.map((spec, i) => {
        const active = activeLane === spec.lane;
        const isLast = i === LANES.length - 1;
        return (
          <div
            key={spec.lane}
            className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-1"
            style={{
              background: active ? "var(--ink)" : "var(--paper)",
              color: active ? "var(--paper)" : "var(--ink)",
              borderInlineEnd: isLast ? "none" : "1px solid var(--ink)",
            }}
          >
            <div
              className="font-display text-[28px] sm:text-[36px] leading-[0.85] tracking-[-0.02em]"
              style={{
                fontFamily:
                  "var(--font-display, 'Archivo Black'), sans-serif",
                color: active ? "var(--paper)" : spec.color,
              }}
            >
              {spec.id}
            </div>
            <div
              className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.1em] leading-tight"
              style={{
                fontFamily: "var(--font-sans-bold), sans-serif",
              }}
            >
              {t(`${spec.lane}_label`)}
            </div>
            <div className="dv-text text-[13px] sm:text-[14px] font-bold leading-tight mt-[2px]">
              {spec.dvLabel}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
