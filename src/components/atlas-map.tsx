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

// Maldives extent (lon/lat). Used for the default fitBounds and as the
// outer-pan limit so users can't drag the camera off into the Indian
// Ocean. Slight padding around the actual extent so coastal islands
// aren't pinned to the canvas edge.
const MALDIVES_BOUNDS: [[number, number], [number, number]] = [
  [72.4, -1.0],
  [74.0, 7.4],
];

export interface AtlasMapApi {
  flyTo: (lon: number, lat: number, zoom?: number) => void;
}

interface AtlasMapProps {
  height?: string;
  onReady?: (api: AtlasMapApi) => void;
}

export function AtlasMap({ height = "520px", onReady }: AtlasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;
    let mapRef: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      let maplibregl: typeof import("maplibre-gl");
      try {
        maplibregl = await import("maplibre-gl");
      } catch (err) {
        console.error("[atlas-map] maplibre-gl failed to load:", err);
        return;
      }
      if (cancelled || !containerRef.current) return;

      // Eager-fetch both static GeoJSON files in parallel — earlier
      // versions did this inside the 'load' handler which sometimes
      // raced and silently produced an empty map. Loading first means
      // we surface a fetch failure visibly instead of a blank canvas.
      const [featuredRes, inhabitedRes] = await Promise.all([
        fetch("/atlas/featured-islands.geojson").catch(() => null),
        fetch("/atlas/inhabited-islands.geojson").catch(() => null),
      ]);
      const featured =
        featuredRes && featuredRes.ok ? await featuredRes.json() : null;
      const inhabited =
        inhabitedRes && inhabitedRes.ok ? await inhabitedRes.json() : null;
      if (!featured) {
        console.error("[atlas-map] featured-islands.geojson failed to load");
      }

      // Minimal-style map — pure background fill, no basemap, no
      // external tile-server dependency.
      let map: InstanceType<typeof maplibregl.Map>;
      try {
        map = new maplibregl.Map({
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
          },
          // fitBounds on the Maldives extent. The atoll chain is tall
          // and narrow so a fixed center+zoom always cropped one end.
          // bounds + a 24px padding keeps every island in the frame
          // regardless of the canvas aspect ratio.
          bounds: MALDIVES_BOUNDS,
          fitBoundsOptions: { padding: 24 },
          maxBounds: MALDIVES_BOUNDS,
          minZoom: 5,
          maxZoom: 12,
          attributionControl: {
            compact: true,
            customAttribution:
              'Island geometry &copy; <a href="https://readme.onemap.mv/">OneMap.mv</a>',
          },
        });
      } catch (err) {
        console.error("[atlas-map] failed to construct map:", err);
        return;
      }
      mapRef = map;

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      map.on("error", (e) => {
        console.error("[atlas-map]", e?.error ?? e);
      });

      map.on("load", () => {
        // Expose a small imperative API to the parent so the side
        // panel can fly the map to a clicked island. Kept narrow on
        // purpose — anything else parents need should be added here
        // explicitly so the surface stays auditable.
        onReady?.({
          flyTo: (lon, lat, zoom = 11) =>
            map.flyTo({ center: [lon, lat], zoom, essential: true }),
        });

        if (inhabited) {
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
        }

        if (featured) {
          map.addSource("featured", { type: "geojson", data: featured });
          map.addLayer({
            id: "featured-fill",
            type: "fill",
            source: "featured",
            paint: { "fill-color": "#7fa9b3", "fill-opacity": 0.75 },
          });
          map.addLayer({
            id: "featured-outline",
            type: "line",
            source: "featured",
            paint: { "line-color": "#3d6470", "line-width": 1.5 },
          });

          map.on("click", "featured-fill", (e) => {
            const slug = e.features?.[0]?.properties?.slug as
              | string
              | undefined;
            if (slug) router.push(`/atlas/${slug}`);
          });
          map.on("mouseenter", "featured-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "featured-fill", () => {
            map.getCanvas().style.cursor = "";
          });
        }
      });
    })();

    return () => {
      cancelled = true;
      mapRef?.remove();
    };
    // onReady is intentionally not in the dep array — it's a stable
    // ref-style callback and re-running the whole map init on each
    // render would tear down and rebuild the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
