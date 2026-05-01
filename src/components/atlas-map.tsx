"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";

// MapLibre-rendered atlas map. Renders an SVG-clean view of the Maldives
// with the 6 featured islands as filled polygons (clickable, takes you to
// /atlas/<slug>) and the other 183 inhabited islands as muted centroids
// for spatial context. No basemap — just our two GeoJSON layers on a
// civic-ledger ocean tint, matching the Saafu aesthetic.
//
// Geometry is pre-fetched from OneMap.mv via scripts/fetch-atlas-
// geometries.ts and lives statically at /atlas/{featured,inhabited}-
// islands.geojson, so the map works offline-from-OneMap once shipped.
//
// maplibre-gl is dynamically imported inside useEffect so SSR doesn't
// touch window/canvas.

interface AtlasMapProps {
  height?: string;
}

export function AtlasMap({ height = "520px" }: AtlasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;
    let mapRef: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;

      // Empty style — pure background colour, no basemap. Keeps the
      // visual quiet and removes any external tile-server dependency.
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: "ocean-bg",
              type: "background",
              paint: { "background-color": "#e8f1f4" },
            },
          ],
          glyphs: undefined,
        },
        // Maldives spans roughly 72.5–73.8°E, -0.7–7.1°N. fitBounds
        // would be ideal but constructing on a centred initial view is
        // simpler and keeps the country comfortably inside the frame.
        center: [73.2, 3.4],
        zoom: 6,
        minZoom: 5.5,
        maxZoom: 11,
        attributionControl: false,
      });
      mapRef = map;

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution:
            'Island geometry &copy; <a href="https://readme.onemap.mv/">OneMap.mv</a>',
        })
      );
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", async () => {
        // Inhabited-island context dots
        try {
          const inhabited = await fetch("/atlas/inhabited-islands.geojson").then(
            (r) => r.json()
          );
          map.addSource("inhabited", { type: "geojson", data: inhabited });
          map.addLayer({
            id: "inhabited-dots",
            type: "circle",
            source: "inhabited",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                6,
                1.5,
                10,
                3,
              ],
              "circle-color": "#9aa9ae",
              "circle-opacity": 0.65,
              "circle-stroke-width": 0,
            },
          });
        } catch {
          /* network failure — degrade silently */
        }

        // Featured polygons
        try {
          const featured = await fetch("/atlas/featured-islands.geojson").then(
            (r) => r.json()
          );
          map.addSource("featured", { type: "geojson", data: featured });
          map.addLayer({
            id: "featured-fill",
            type: "fill",
            source: "featured",
            paint: {
              "fill-color": "#7fa9b3",
              "fill-opacity": 0.7,
            },
          });
          map.addLayer({
            id: "featured-outline",
            type: "line",
            source: "featured",
            paint: {
              "line-color": "#3d6470",
              "line-width": 1.5,
            },
          });

          // Click → navigate
          map.on("click", "featured-fill", (e) => {
            const slug = e.features?.[0]?.properties?.slug as string | undefined;
            if (slug) router.push(`/atlas/${slug}`);
          });
          map.on("mouseenter", "featured-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "featured-fill", () => {
            map.getCanvas().style.cursor = "";
          });
        } catch {
          /* network failure — degrade silently */
        }
      });
    })();

    return () => {
      cancelled = true;
      mapRef?.remove();
    };
  }, [router]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Map of the Maldives showing the six islands featured in the Atlas as filled polygons; other inhabited islands shown as small dots for context."
      className="w-full border border-border"
      style={{ height }}
    />
  );
}
