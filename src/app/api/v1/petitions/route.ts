import { NextResponse } from "next/server";
import {
  listPetitions,
  getPetitionsForIsland,
} from "@/db/queries/petitions";
import { listIslands } from "@/db/queries/islands";
import { getSignatureCounts } from "@/db/queries/signatures";
import {
  CORS_HEADERS,
  COUNTER_CACHE_HEADERS,
  apiError,
  buildMetadata,
} from "@/lib/api-helpers";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");
  const scopeFilter = searchParams.get("scope");

  let petitions;
  if (islandFilter) {
    const islands = await listIslands();
    const match = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!match) {
      return apiError(`Unknown island: ${islandFilter}`);
    }
    petitions = await getPetitionsForIsland(match.id);
  } else {
    petitions = await listPetitions();
  }

  if (scopeFilter) {
    petitions = petitions.filter((p) => p.scope === scopeFilter);
  }

  // Surface live signature counts (seed baseline + session signatures) so
  // API consumers see the same number the UI shows. One grouped query
  // instead of N round-trips.
  const sessionCounts = await getSignatureCounts(petitions.map((p) => p.id));
  const data = petitions.map((p) => ({
    ...p,
    signatures_total: p.signatures + (sessionCounts.get(p.id) ?? 0),
  }));

  return NextResponse.json(
    {
      metadata: buildMetadata({
        dataset: "petitions",
        rowCount: data.length,
        filters: { island: islandFilter, scope: scopeFilter },
      }),
      data,
    },
    { headers: { ...CORS_HEADERS, ...COUNTER_CACHE_HEADERS } }
  );
}
