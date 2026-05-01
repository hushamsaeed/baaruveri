"use client";

import { useCallback, useRef } from "react";
import { AtlasMap, type AtlasMapApi } from "./atlas-map";
import { AtlasIslandList } from "./atlas-island-list";

// Stitches the MapLibre map and the side-panel atoll/island list into
// one client component. The bridge is a tiny imperative API: the map
// exposes flyTo(lon, lat) via onReady; the list calls it when a
// non-featured island is clicked. Featured islands navigate to
// /atlas/<slug> instead — they have profiles, so a deep link is the
// right destination.
export function AtlasIndex() {
  const mapApiRef = useRef<AtlasMapApi | null>(null);

  const handleIslandSelect = useCallback((lon: number, lat: number) => {
    mapApiRef.current?.flyTo(lon, lat, 11);
  }, []);

  const handleMapReady = useCallback((api: AtlasMapApi) => {
    mapApiRef.current = api;
  }, []);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <AtlasMap onReady={handleMapReady} />
      <AtlasIslandList onIslandSelect={handleIslandSelect} />
    </div>
  );
}
