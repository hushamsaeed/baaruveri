import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { getCouncilMembers } from "@/db/queries/council";
import { listIslands } from "@/db/queries/islands";
import {
  CORS_HEADERS,
  CACHE_HEADERS,
  apiError,
  buildMetadata,
} from "@/lib/api-helpers";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const islandFilter = searchParams.get("island");

  let members;
  if (islandFilter) {
    const islands = await listIslands();
    const match = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!match) {
      return apiError(`Unknown island: ${islandFilter}`);
    }
    members = await getCouncilMembers(match.id);
  } else {
    // No filter: full table.
    const rows = await db.select().from(schema.councilMembers);
    members = rows.map((r) => ({
      id: r.id,
      island_id: r.islandId,
      name_dv: r.nameDv,
      name_en: r.nameEn,
      role_en: r.roleEn,
      role_dv: r.roleDv,
      party: r.party,
      ward_en: r.wardEn ?? undefined,
      elected_at: r.electedAt,
    }));
  }

  return NextResponse.json(
    {
      metadata: buildMetadata({
        dataset: "council_members",
        rowCount: members.length,
        filters: { island: islandFilter },
      }),
      data: members,
    },
    { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
