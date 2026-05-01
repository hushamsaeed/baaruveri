import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { getClaimsForThread } from "@/db/queries/claims";
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
  const threadFilter = searchParams.get("thread");

  let claims;
  if (threadFilter) {
    claims = await getClaimsForThread(threadFilter);
  } else {
    const rows = await db.select().from(schema.claims);
    claims = rows.map((r) => ({
      id: r.id,
      thread_id: r.threadId,
      parent_claim_id: r.parentClaimId,
      side: r.side,
      body_en: r.bodyEn,
      body_dv: r.bodyDv ?? undefined,
      author_dv: r.authorDv,
      author_en: r.authorEn,
      vote_count: r.voteCount,
      impact: r.impact,
    }));
  }

  return NextResponse.json(
    {
      metadata: buildMetadata({
        dataset: "claims",
        rowCount: claims.length,
        filters: { thread: threadFilter },
      }),
      data: claims,
    },
    { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
