import { NextResponse } from "next/server";
import { search } from "@/db/queries/search";
import { CORS_HEADERS, buildMetadata } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const results = await search(q);

  return NextResponse.json(
    {
      metadata: buildMetadata({
        dataset: "search",
        rowCount: results.totalCount,
        filters: { q },
      }),
      data: {
        islands: results.islands,
        threads: results.threads,
        petitions: results.petitions,
      },
    },
    {
      headers: {
        ...CORS_HEADERS,
        // Search results are session-scoped — short cache window so the
        // freshly-added thread shows up quickly but burst traffic doesn't
        // hammer the DB.
        "Cache-Control": "public, max-age=15, s-maxage=15",
      },
    }
  );
}
