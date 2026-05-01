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

async function fetchInhabited(): Promise<ArcGisGeoJSON> {
  const url = new URL(ARCGIS_BASE);
  url.searchParams.set("where", "category='Residential Island'");
  url.searchParams.set("outFields", "islandName,atoll,capital,longitude,latitude");
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("resultRecordCount", "300");
  url.searchParams.set("f", "json");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`inhabited: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    features: Array<{ attributes: Record<string, unknown> }>;
  };
  // Convert to point GeoJSON. The longitude/latitude fields are strings
  // in the source; coerce to numbers and drop any rows missing coords.
  const features: ArcGisGeoJSON["features"] = [];
  for (const f of data.features) {
    const lon = parseFloat(String(f.attributes.longitude ?? ""));
    const lat = parseFloat(String(f.attributes.latitude ?? ""));
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: {
        islandName: f.attributes.islandName,
        atoll: f.attributes.atoll,
        capital: f.attributes.capital,
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
