"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import type { AtlasSelection } from "./atlas-map";

// Side-panel companion to AtlasMap. Renders all 189 inhabited islands
// from /atlas/inhabited-islands.geojson grouped by atoll, ordered
// north-to-south. Featured islands (the 6 with /atlas/<slug>
// profiles) get a clickable Link; the rest are buttons that fly the
// map to their centroid via the parent-supplied onIslandSelect
// callback.

// North-to-south order keyed on the atoll-name string OneMap returns.
// "MLE" is the fused-municipality name OneMap uses for Malé +
// Hulhumalé; we treat it as a sibling of Kaafu in the ladder.
const ATOLL_ORDER: readonly string[] = [
  "Haa Alifu",
  "Haa Dhaalu",
  "Shaviyani",
  "Noonu",
  "Raa",
  "Baa",
  "Lhaviyani",
  "Kaafu",
  "MLE",
  "Alifu Alifu",
  "Alifu Dhaalu",
  "Vaavu",
  "Meemu",
  "Faafu",
  "Dhaalu",
  "Thaa",
  "Laamu",
  "Gaafu Alifu",
  "Gaafu Dhaalu",
  "Gnaviyani",
  "Seenu",
];

// Map OneMap islandName → our /atlas/<slug>. Six islands have full
// profiles; the rest are display-only on the map. Hithadhoo (Seenu)
// is the de-facto centre of Addu City — same mapping used by the
// fetch script.
const FEATURED_BY_NAME: Record<string, { slug: string; atoll: string }> = {
  "Malé": { slug: "male", atoll: "MLE" },
  "Hulhumalé": { slug: "hulhumale", atoll: "MLE" },
  Hithadhoo: { slug: "addu-city", atoll: "Seenu" },
  Kulhudhuffushi: { slug: "kulhudhuffushi", atoll: "Haa Dhaalu" },
  Fuvahmulah: { slug: "fuvahmulah", atoll: "Gnaviyani" },
  Maafaru: { slug: "maafaru", atoll: "Noonu" },
};

interface InhabitedFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: { islandName: string; atoll: string; capital: string };
}

interface InhabitedFC {
  type: "FeatureCollection";
  features: InhabitedFeature[];
}

interface AtlasIslandListProps {
  onIslandSelect?: (selection: AtlasSelection) => void;
  height?: string;
}

export function AtlasIslandList({
  onIslandSelect,
  height = "520px",
}: AtlasIslandListProps) {
  const t = useTranslations("atlas");
  const [data, setData] = useState<InhabitedFC | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/atlas/inhabited-islands.geojson")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: InhabitedFC) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <aside
        className="bg-card border border-border p-4 text-[12px] text-muted-foreground"
        style={{ height }}
      >
        <L>{t("list_load_error")}</L>
      </aside>
    );
  }

  if (!data) {
    return (
      <aside
        className="bg-card border border-border p-4 text-[12px] text-muted-foreground"
        style={{ height }}
      >
        <L>{t("list_loading")}</L>
      </aside>
    );
  }

  // Group by atoll, preserve the n→s order.
  const byAtoll = new Map<string, InhabitedFeature[]>();
  for (const f of data.features) {
    const atoll = f.properties.atoll;
    const bucket = byAtoll.get(atoll);
    if (bucket) bucket.push(f);
    else byAtoll.set(atoll, [f]);
  }
  // Sort each atoll's islands alphabetically (capital first if present).
  for (const arr of byAtoll.values()) {
    arr.sort((a, b) => {
      const aCap = a.properties.capital === "Y" ? -1 : 0;
      const bCap = b.properties.capital === "Y" ? -1 : 0;
      if (aCap !== bCap) return aCap - bCap;
      return a.properties.islandName.localeCompare(b.properties.islandName);
    });
  }
  const orderedAtolls = ATOLL_ORDER.filter((a) => byAtoll.has(a));
  const totalCount = data.features.length;

  return (
    <aside
      className="bg-card border border-border overflow-hidden flex flex-col"
      style={{ height }}
      aria-label={t("list_aria_label")}
    >
      <header className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <L>{t("list_eyebrow", { count: totalCount })}</L>
        </div>
      </header>
      <div className="overflow-y-auto flex-1">
        {orderedAtolls.map((atoll) => {
          const islands = byAtoll.get(atoll)!;
          return (
            <details
              key={atoll}
              open={atoll === "MLE" || atoll === "Seenu" || atoll === "Noonu"}
              className="border-b border-border"
            >
              <summary className="cursor-pointer select-none px-4 py-2 hover:bg-muted/40 transition-colors">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold">
                  {atoll === "MLE" ? "Malé" : atoll}
                </span>
                <span className="font-mono text-[10.5px] text-muted-foreground tabular-nums ms-2">
                  {islands.length}
                </span>
              </summary>
              <ul>
                {islands.map((f) => {
                  const featured = FEATURED_BY_NAME[f.properties.islandName];
                  const [lon, lat] = f.geometry.coordinates;
                  if (featured) {
                    return (
                      <li key={f.properties.islandName}>
                        <Link
                          href={`/atlas/${featured.slug}`}
                          className="flex items-baseline gap-2 px-4 py-1.5 text-[13px] hover:bg-secondary transition-colors"
                        >
                          <span aria-hidden className="text-primary">
                            ★
                          </span>
                          <span className="text-foreground">
                            {f.properties.islandName}
                          </span>
                          {f.properties.capital === "Y" && (
                            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground ms-auto">
                              <L>{t("list_capital_tag")}</L>
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={f.properties.islandName}>
                      <button
                        type="button"
                        onClick={() =>
                          onIslandSelect?.({
                            islandName: f.properties.islandName,
                            atoll: f.properties.atoll,
                            coordinates: [lon, lat],
                            isFeatured: false,
                            capital: f.properties.capital,
                          })
                        }
                        className="w-full text-start flex items-baseline gap-2 px-4 py-1.5 text-[13px] hover:bg-muted/40 transition-colors"
                      >
                        <span
                          aria-hidden
                          className="text-muted-foreground/60 ms-[2px] me-[5px]"
                        >
                          ·
                        </span>
                        <span className="text-foreground/90">
                          {f.properties.islandName}
                        </span>
                        {f.properties.capital === "Y" && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground ms-auto">
                            <L>{t("list_capital_tag")}</L>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
      <footer className="px-4 py-2.5 border-t border-border text-[10.5px] text-muted-foreground leading-relaxed">
        <L>{t("list_footnote")}</L>
      </footer>
    </aside>
  );
}
