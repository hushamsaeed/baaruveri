// Pulls Maldives island geometries from OneMap.mv (the public ArcGIS
// FeatureServer at services7.arcgis.com) and writes two GeoJSON
// FeatureCollections under public/atlas/. Run this script when the
// upstream data refreshes — the resulting files are committed and
// shipped statically so the build doesn't need internet access.
//
//   pnpm tsx scripts/fetch-atlas-geometries.ts
//
// Files written:
//   - public/atlas/featured-islands.geojson — 6 islands the platform
//     features (Malé, Hulhumalé, Hithadhoo for Addu, Kulhudhuffushi,
//     Fuvahmulah, Maafaru). Full polygons at precision 4 (~11m).
//   - public/atlas/inhabited-islands.geojson — every Residential Island
//     in the Maldives as a point feature (longitude/latitude only),
//     for spatial context around the featured polygons.

import { writeFile } from "node:fs/promises";
import path from "node:path";

const ARCGIS_BASE =
  "https://services7.arcgis.com/yvCbn3q8PPtPLZIM/arcgis/rest/services/island_20240509/FeatureServer/0/query";

// OneMap doesn't have a single "Addu City" feature — the city is the
// fused-municipality name for five islands. Hithadhoo (Seenu, capital=Y)
// is the de-facto centre; using it here keeps the click target sensible.
// Slug → OneMap islandName for our 6 featured Atlas profiles.
const FEATURED: Record<string, string> = {
  male: "Malé",
  hulhumale: "Hulhumalé",
  "addu-city": "Hithadhoo", // see note above; atoll filter narrows to Seenu
  kulhudhuffushi: "Kulhudhuffushi",
  fuvahmulah: "Fuvahmulah",
  maafaru: "Maafaru",
};

// Hithadhoo also exists in Laamu — keep this mapping so we pick the
// right one when names collide.
const FEATURED_ATOLL_HINT: Partial<Record<string, string>> = {
  "addu-city": "Seenu",
};

interface ArcGisGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
}

async function fetchFeatured(): Promise<ArcGisGeoJSON> {
  const features: ArcGisGeoJSON["features"] = [];
  for (const [slug, islandName] of Object.entries(FEATURED)) {
    const wherePieces = [`islandName='${islandName.replace(/'/g, "''")}'`];
    const atollHint = FEATURED_ATOLL_HINT[slug];
    if (atollHint) wherePieces.push(`atoll='${atollHint}'`);
    const where = wherePieces.join(" AND ");
    const url = new URL(ARCGIS_BASE);
    url.searchParams.set("where", where);
    url.searchParams.set("outFields", "islandName,atoll,capital,Area_ha");
    url.searchParams.set("geometryPrecision", "4");
    url.searchParams.set("f", "geojson");
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`featured ${slug}: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as ArcGisGeoJSON;
    if (data.features.length === 0) {
      throw new Error(`featured ${slug}: no feature matched ${where}`);
    }
    if (data.features.length > 1) {
      throw new Error(
        `featured ${slug}: ${data.features.length} features matched — ambiguous`
      );
    }
    const f = data.features[0]!;
    f.properties = { ...f.properties, slug };
    features.push(f);
    console.log(`  ${slug.padEnd(16)} ← ${islandName} (${f.properties.atoll})`);
  }
  return { type: "FeatureCollection", features };
}

// OneMap stores longitude/latitude as DMS strings, e.g.
// "73° 28' 17.499\" E" rather than decimal degrees. parseFloat truncates
// at the first non-digit so the obvious approach silently produced
// integer-clustered (lon, lat) points. This parser converts to decimal.
function parseDMS(s: string): number | null {
  const m = /^\s*(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([NSEW])\s*$/.exec(s);
  if (!m) return null;
  const [, deg, min, sec, hemi] = m;
  const decimal =
    parseInt(deg!, 10) +
    parseInt(min!, 10) / 60 +
    parseFloat(sec!) / 3600;
  return hemi === "S" || hemi === "W" ? -decimal : decimal;
}

async function fetchInhabited(): Promise<ArcGisGeoJSON> {
  // returnGeometry=true so we can derive an exact centroid from the
  // polygon (more reliable than parsing OneMap's DMS display strings).
  // The DMS strings stay as a fallback. Spatial reference 4326 (lon/lat)
  // — the FeatureServer's source is 3857 but the query supports outSR.
  const url = new URL(ARCGIS_BASE);
  url.searchParams.set("where", "category='Residential Island'");
  url.searchParams.set(
    "outFields",
    "islandName,atoll,capital,longitude,latitude"
  );
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("resultRecordCount", "300");
  url.searchParams.set("geometryPrecision", "4");
  url.searchParams.set("f", "geojson");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`inhabited: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as ArcGisGeoJSON;
  // Convert each polygon to its centroid (mean of the outer ring's
  // vertices). For tiny island polygons this is indistinguishable
  // from a true area-weighted centroid and avoids a turf dependency.
  const features: ArcGisGeoJSON["features"] = [];
  for (const f of data.features) {
    let lon: number | null = null;
    let lat: number | null = null;
    const geom = f.geometry as
      | { type: "Polygon"; coordinates: number[][][] }
      | { type: "MultiPolygon"; coordinates: number[][][][] }
      | undefined;
    const ring =
      geom?.type === "Polygon"
        ? geom.coordinates[0]
        : geom?.type === "MultiPolygon"
          ? geom.coordinates[0]?.[0]
          : undefined;
    if (ring && ring.length > 0) {
      let sumLon = 0;
      let sumLat = 0;
      for (const [x, y] of ring) {
        sumLon += x!;
        sumLat += y!;
      }
      lon = sumLon / ring.length;
      lat = sumLat / ring.length;
    } else {
      // Fall back to the DMS strings if no geometry came back.
      lon = parseDMS(String(f.properties.longitude ?? "")) ?? null;
      lat = parseDMS(String(f.properties.latitude ?? "")) ?? null;
    }
    if (lon === null || lat === null) continue;
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Math.round(lon * 1e4) / 1e4, Math.round(lat * 1e4) / 1e4],
      },
      properties: {
        islandName: f.properties.islandName,
        atoll: f.properties.atoll,
        capital: f.properties.capital,
      },
    });
  }
  return { type: "FeatureCollection", features };
}

async function main() {
  const outDir = path.resolve(__dirname, "..", "public", "atlas");

  console.log("featured islands:");
  const featured = await fetchFeatured();
  await writeFile(
    path.join(outDir, "featured-islands.geojson"),
    JSON.stringify(featured) + "\n"
  );
  console.log(
    `  wrote ${featured.features.length} polygons → public/atlas/featured-islands.geojson`
  );

  console.log("\ninhabited islands (centroid points):");
  const inhabited = await fetchInhabited();
  await writeFile(
    path.join(outDir, "inhabited-islands.geojson"),
    JSON.stringify(inhabited) + "\n"
  );
  console.log(
    `  wrote ${inhabited.features.length} points → public/atlas/inhabited-islands.geojson`
  );

  console.log("\nDone. Source: OneMap.mv (https://readme.onemap.mv/)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
