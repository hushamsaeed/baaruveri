import { NextResponse } from "next/server";
import { listThreads, getThreadsForIsland } from "@/db/queries/threads";
import { listIslands } from "@/db/queries/islands";
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
  const issueFilter = searchParams.get("issue");

  let threads;
  if (islandFilter) {
    const islands = await listIslands();
    const match = islands.find(
      (i) => i.slug === islandFilter || i.id === islandFilter
    );
    if (!match) {
      return apiError(`Unknown island: ${islandFilter}`);
    }
    threads = await getThreadsForIsland(match.id);
  } else {
    threads = await listThreads();
  }

  if (issueFilter) {
    threads = threads.filter((t) => t.issue === issueFilter);
  }

  return NextResponse.json(
    {
      metadata: buildMetadata({
        dataset: "threads",
        rowCount: threads.length,
        filters: { island: islandFilter, issue: issueFilter },
      }),
      data: threads,
    },
    { headers: { ...CORS_HEADERS, ...COUNTER_CACHE_HEADERS } }
  );
}
