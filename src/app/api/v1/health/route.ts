import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { CORS_HEADERS } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// "select 1" only proves the socket is open; it doesn't catch a missing
// migration, a missing extension, or an empty seed. The deep checks
// below sanity-test that the schema state actually matches what the app
// expects to read from. Failures here should page oncall, not just look
// like a request-time error to a user.
export async function GET() {
  const startedAt = Date.now();
  try {
    const t0 = Date.now();
    // Liveness ping.
    await db.execute(sql`select 1`);
    const dbLatencyMs = Date.now() - t0;

    // Migration evidence: pg_trgm landed in 0003; 0004 added the perf
    // FK indexes. The presence of the extension proves the migrator
    // actually ran against this DB.
    const extRows = await db.execute<{ exists: boolean }>(
      sql`select exists(select 1 from pg_extension where extname = 'pg_trgm') as exists`
    );
    const pgTrgmInstalled = (extRows as unknown as Array<{ exists: boolean }>)[0]?.exists ?? false;

    // Seed evidence: one read from each core table that the app's
    // homepage/atlas/sandbar/petitions pages depend on. A missing seed
    // wouldn't fail "select 1" but would render the entire site empty.
    const [islandsCnt, threadsCnt, petitionsCnt] = await Promise.all([
      db.execute<{ n: number }>(sql`select count(*)::int as n from islands`),
      db.execute<{ n: number }>(sql`select count(*)::int as n from threads`),
      db.execute<{ n: number }>(sql`select count(*)::int as n from petitions`),
    ]);
    const counts = {
      islands: (islandsCnt as unknown as Array<{ n: number }>)[0]?.n ?? 0,
      threads: (threadsCnt as unknown as Array<{ n: number }>)[0]?.n ?? 0,
      petitions: (petitionsCnt as unknown as Array<{ n: number }>)[0]?.n ?? 0,
    };

    const seedReady =
      counts.islands > 0 && counts.threads > 0 && counts.petitions > 0;
    const ok = pgTrgmInstalled && seedReady;

    return NextResponse.json(
      {
        ok,
        db: {
          status: "connected",
          latency_ms: dbLatencyMs,
          pg_trgm: pgTrgmInstalled,
          counts,
        },
        service: "baaruveri-web",
        elapsed_ms: Date.now() - startedAt,
        checked_at: new Date().toISOString(),
      },
      { status: ok ? 200 : 503, headers: CORS_HEADERS }
    );
  } catch (err) {
    // Log the full error server-side, but don't echo it to the client
    // — the connection string / host paths in the underlying error are
    // sensitive. Public response stays a stable shape monitors can key
    // on.
    console.error("[health] db check failed:", err);
    return NextResponse.json(
      {
        ok: false,
        db: { status: "error" },
        service: "baaruveri-web",
        elapsed_ms: Date.now() - startedAt,
        checked_at: new Date().toISOString(),
      },
      { status: 503, headers: CORS_HEADERS }
    );
  }
}
