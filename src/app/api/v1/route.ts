import { NextResponse } from "next/server";
import { CORS_HEADERS, CACHE_HEADERS } from "@/lib/api-helpers";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      api_version: "v1",
      description:
        "Baaruveri open-data API. CORS-open, no signup. Per the project commitment to open-data parity: anything you see on a dashboard view is available raw.",
      license: "Open Database License v1.0 (ODbL) (intended for v1)",
      endpoints: [
        {
          path: "/api/v1/islands",
          description: "All inhabited islands in the v0 atlas.",
          filters: [],
        },
        {
          path: "/api/v1/threads",
          description: "Sandbar threads across all islands.",
          filters: [
            { name: "island", description: "Filter by island slug or id." },
            { name: "issue", description: "One of: housing, judiciary, climate, fisheries, education, decentralisation, procurement." },
          ],
        },
        {
          path: "/api/v1/petitions",
          description: "Petitions with live signature counts (seed + session).",
          filters: [
            { name: "island", description: "Filter by island; national-scope petitions also surface." },
            { name: "scope", description: "One of: island, national." },
          ],
        },
        {
          path: "/api/v1/council",
          description: "Council members across all islands.",
          filters: [{ name: "island", description: "Filter by island slug or id." }],
        },
        {
          path: "/api/v1/claims",
          description: "Pros/Cons claims attached to threads.",
          filters: [{ name: "thread", description: "Filter by thread id (e.g. thr-maafaru-01)." }],
        },
        {
          path: "/api/v1/budgets",
          description: "Per-island council budget lines (FY26 Q1).",
          filters: [{ name: "island", description: "Filter by island slug or id." }],
        },
      ],
      csv_exports: [
        {
          path: "/datasets/budgets.csv",
          description: "Council budgets as CSV with UTF-8 BOM.",
          filters: [{ name: "island", description: "Filter by island slug." }],
        },
      ],
      notes: [
        "All seed data is illustrative for the v0/v1 prototype until live council / EC / NBS feeds wire.",
        "Petition signatures column carries the seed baseline; signatures_total adds session signatures from the signatures table.",
        "No authentication required for read endpoints. Sign / write actions go through the eFaas-stub flow at /auth/efaas.",
      ],
    },
    { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
