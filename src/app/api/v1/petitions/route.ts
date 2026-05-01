import { NextResponse } from "next/server";
import {
  listPetitions,
  getPetitionsForIsland,
} from "@/db/queries/petitions";
import { listIslands } from "@/db/queries/islands";
import { getSignatureCount } from "@/db/queries/signatures";
import {
  CORS_HEADERS,
  CACHE_HEADERS,
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
      return NextResponse.json(
        { error: `Unknown island: ${islandFilter}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    petitions = await getPetitionsForIsland(match.id);
  } else {
    petitions = await listPetitions();
  }

  if (scopeFilter) {
    petitions = petitions.filter((p) => p.scope === scopeFilter);
  }

  // Surface live signature counts (seed baseline + session signatures) so
  // API consumers see the same number the UI shows.
  const data = await Promise.all(
    petitions.map(async (p) => ({
      ...p,
      signatures_total: p.signatures + (await getSignatureCount(p.id)),
    }))
  );

  return NextResponse.json(
    {
      metadata: buildMetadata({
        dataset: "petitions",
        rowCount: data.length,
        filters: { island: islandFilter, scope: scopeFilter },
      }),
      data,
    },
    { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
