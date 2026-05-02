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

export interface AtlasSelection {
  islandName: string;
  atoll: string;
  coordinates: [number, number];
  isFeatured: boolean;
  slug?: string;
  capital?: string;
}

export interface AtlasMapApi {
  flyTo: (lon: number, lat: number, zoom?: number) => void;
}

interface AtlasMapProps {
  height?: string;
  onReady?: (api: AtlasMapApi) => void;
  /** Render the survey-instrument crosshair + emphasis marker on this
   *  island. Updates without re-initialising the map. */
  selection?: AtlasSelection | null;
  /** Fired when the user clicks a non-featured inhabited dot. The
   *  parent decides what to do (typically: setSelection + flyTo). */
  onDotClick?: (s: AtlasSelection) => void;
}

export function AtlasMap({
  height = "520px",
  onReady,
  selection,
  onDotClick,
}: AtlasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // Imperative handle to the live MapLibre instance, populated once
  // 'load' fires. The selection-effect below reads it without
  // re-running the init effect.
  const mapInstance = useRef<InstanceType<
    typeof import("maplibre-gl").Map
  > | null>(null);
  const isLoaded = useRef(false);
  // Re-render-stable refs for the prop callbacks — the init effect
  // shouldn't restart when these identities change. Updated inside an
  // effect (writing to ref.current during render is a lint error
  // because it can desync with the next render's children).
  const onReadyRef = useRef(onReady);
  const onDotClickRef = useRef(onDotClick);
  useEffect(() => {
    onReadyRef.current = onReady;
    onDotClickRef.current = onDotClick;
  });

  useEffect(() => {
    if (!containerRef.current) return;
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
                paint: { "background-color": "#ece2c8" },
              },
            ],
          },
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
      mapInstance.current = map;

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      map.on("error", (e) => {
        console.error("[atlas-map]", e?.error ?? e);
      });

      map.on("load", () => {
        isLoaded.current = true;
        onReadyRef.current?.({
          flyTo: (lon, lat, zoom = 11) =>
            map.flyTo({ center: [lon, lat], zoom, essential: true }),
        });

        // Empty selection sources — the selection effect below fills
        // them. Pre-creating means we don't need a "first time?" check
        // every selection update.
        map.addSource("selected-crosshair", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("selected-marker", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
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
              "circle-color": "#2e2e2e",
              "circle-opacity": 0.7,
              "circle-stroke-width": 0,
            },
          });
          map.on("click", "inhabited-dots", (e) => {
            const f = e.features?.[0];
            if (!f || f.geometry.type !== "Point") return;
            const props = f.properties as Record<string, string>;
            const coords = f.geometry.coordinates as [number, number];
            onDotClickRef.current?.({
              islandName: props.islandName ?? "",
              atoll: props.atoll ?? "",
              coordinates: coords,
              isFeatured: false,
              capital: props.capital,
            });
          });
          map.on("mouseenter", "inhabited-dots", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "inhabited-dots", () => {
            map.getCanvas().style.cursor = "";
          });
        }

        if (featured) {
          map.addSource("featured", { type: "geojson", data: featured });
          map.addLayer({
            id: "featured-fill",
            type: "fill",
            source: "featured",
            paint: { "fill-color": "#c4221e", "fill-opacity": 0.85 },
          });
          map.addLayer({
            id: "featured-outline",
            type: "line",
            source: "featured",
            paint: { "line-color": "#0f0f0f", "line-width": 1.5 },
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

        // Selection layers go ON TOP of everything else. The crosshair
        // is a thin dashed line that runs the full extent of the
        // map (horizontal parallel + vertical meridian through the
        // selected point); the marker is a hollow ring + filled dot
        // sized larger than the regular inhabited dots so it stands
        // out without animation.
        map.addLayer({
          id: "selected-crosshair-line",
          type: "line",
          source: "selected-crosshair",
          paint: {
            "line-color": "#0f0f0f",
            "line-width": 1,
            "line-opacity": 0.55,
            "line-dasharray": [3, 3],
          },
        });
        map.addLayer({
          id: "selected-marker-halo",
          type: "circle",
          source: "selected-marker",
          paint: {
            "circle-radius": 14,
            "circle-color": "#0f0f0f",
            "circle-opacity": 0.12,
            "circle-stroke-width": 0,
          },
        });
        map.addLayer({
          id: "selected-marker-ring",
          type: "circle",
          source: "selected-marker",
          paint: {
            "circle-radius": 8,
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#0f0f0f",
          },
        });
        map.addLayer({
          id: "selected-marker-dot",
          type: "circle",
          source: "selected-marker",
          paint: {
            "circle-radius": 4,
            "circle-color": "#0f0f0f",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#f4ebd8",
          },
        });
      });
    })();

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      isLoaded.current = false;
    };
  }, [router]);

  // Selection effect — runs every time `selection` changes WITHOUT
  // touching the map init. Updates two GeoJSON sources; the layers
  // above pick the new data up automatically.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const apply = () => {
      const crosshairSource = map.getSource(
        "selected-crosshair"
      ) as ReturnType<typeof map.getSource> & {
        setData: (d: GeoJSON.GeoJSON) => void;
      };
      const markerSource = map.getSource("selected-marker") as ReturnType<
        typeof map.getSource
      > & { setData: (d: GeoJSON.GeoJSON) => void };
      if (!crosshairSource || !markerSource) return;
      if (!selection) {
        crosshairSource.setData({ type: "FeatureCollection", features: [] });
        markerSource.setData({ type: "FeatureCollection", features: [] });
        return;
      }
      const [lon, lat] = selection.coordinates;
      // Crosshair: horizontal parallel + vertical meridian, drawn
      // across the full max-bounds extent so it always reaches the
      // edges of the canvas regardless of the current viewport.
      crosshairSource.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [MALDIVES_BOUNDS[0][0], lat],
                [MALDIVES_BOUNDS[1][0], lat],
              ],
            },
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [lon, MALDIVES_BOUNDS[0][1]],
                [lon, MALDIVES_BOUNDS[1][1]],
              ],
            },
          },
        ],
      });
      markerSource.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: [lon, lat] },
          },
        ],
      });
    };
    if (isLoaded.current) {
      apply();
    } else {
      // Map still booting; defer until 'load' fires.
      map.once("load", apply);
    }
  }, [selection]);

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
