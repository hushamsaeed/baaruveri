import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { CORS_HEADERS } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const startedAt = Date.now();
  let dbStatus: "connected" | "error" = "error";
  let dbLatencyMs = -1;
  try {
    const t0 = Date.now();
    await db.execute(sql`select 1`);
    dbLatencyMs = Date.now() - t0;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "error";
    return NextResponse.json(
      {
        ok: false,
        db: { status: dbStatus, error: String(err) },
        elapsed_ms: Date.now() - startedAt,
        checked_at: new Date().toISOString(),
      },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      db: { status: dbStatus, latency_ms: dbLatencyMs },
      // App-level info
      service: "baaruveri-web",
      // Note: commit/version are baked at build time via env if/when CI lands.
      // For the manual deploy flow there's no canonical commit env var; the
      // git log on the server is the source of truth.
      node_version: process.versions.node,
      elapsed_ms: Date.now() - startedAt,
      checked_at: new Date().toISOString(),
    },
    { headers: CORS_HEADERS }
  );
}
