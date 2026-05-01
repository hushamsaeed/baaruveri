"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AtlasMap,
  type AtlasMapApi,
  type AtlasSelection,
} from "./atlas-map";
import { AtlasIslandList } from "./atlas-island-list";
import { L } from "./i18n-text";

// Stitches the MapLibre map and the side-panel atoll/island list into
// one client component. Three pieces of glue:
//
// 1. flyTo bridge — the list calls onIslandSelect, which delegates to
//    map.flyTo via an API ref the map exposes on 'load'.
// 2. selection state — clicking either the list (non-featured row) or
//    a dot on the map sets `selected`, which renders the survey-
//    instrument crosshair + marker on the map and the coordinate
//    readout card overlaid on the map's top-left corner.
// 3. featured-polygon clicks navigate to /atlas/<slug> directly (no
//    selection update — they're leaving the page).
//
// The readout card is positioned absolute over the map. Saafu instrument
// register: monospace, tabular-nums lat/lon, no animation, dismiss
// affordance via the × button.
export function AtlasIndex() {
  const t = useTranslations("atlas");
  const mapApiRef = useRef<AtlasMapApi | null>(null);
  const [selected, setSelected] = useState<AtlasSelection | null>(null);

  const handleMapReady = useCallback((api: AtlasMapApi) => {
    mapApiRef.current = api;
  }, []);

  const handleListSelect = useCallback((s: AtlasSelection) => {
    setSelected(s);
    mapApiRef.current?.flyTo(s.coordinates[0], s.coordinates[1], 11);
  }, []);

  const handleDotClick = useCallback((s: AtlasSelection) => {
    // Map already centred where the click landed — just record the
    // selection for the crosshair and readout. No flyTo so we don't
    // disorient the user mid-click.
    setSelected(s);
  }, []);

  const dismiss = useCallback(() => setSelected(null), []);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative">
        <AtlasMap
          onReady={handleMapReady}
          selection={selected}
          onDotClick={handleDotClick}
        />
        {selected && (
          <div className="absolute top-3 left-3 max-w-[260px] bg-card/95 backdrop-blur border border-border shadow-sm">
            <div className="flex items-baseline justify-between gap-3 px-3 py-2 border-b border-border">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <L>{t("readout_label")}</L>
              </span>
              <button
                type="button"
                onClick={dismiss}
                aria-label={t("readout_dismiss")}
                className="text-muted-foreground hover:text-foreground transition-colors text-[14px] leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-3 py-2.5">
              <div className="text-[14px] font-semibold leading-tight">
                {selected.islandName}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {selected.atoll === "MLE" ? "Malé" : selected.atoll}
                {selected.capital === "Y" && (
                  <span className="ms-2 uppercase tracking-[0.1em] text-[9.5px]">
                    <L>{t("readout_capital_tag")}</L>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2 font-mono text-[10.5px] tabular-nums text-muted-foreground">
                <div>
                  <span className="me-1.5">lat</span>
                  <span className="text-foreground">
                    {selected.coordinates[1].toFixed(4)}°
                  </span>
                </div>
                <div>
                  <span className="me-1.5">lon</span>
                  <span className="text-foreground">
                    {selected.coordinates[0].toFixed(4)}°
                  </span>
                </div>
              </div>
              {selected.isFeatured && selected.slug && (
                <a
                  href={`/atlas/${selected.slug}`}
                  className="block mt-3 pt-2 border-t border-border text-[11.5px] font-mono uppercase tracking-[0.1em] text-primary hover:underline underline-offset-2"
                >
                  <L>{t("readout_open_profile")}</L> →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <AtlasIslandList onIslandSelect={handleListSelect} />
    </div>
  );
}
