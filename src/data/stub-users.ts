// Seed data for the eFaas stub identities. Imported by scripts/seed.ts to
// populate the stub_users table; runtime reads go through src/db/queries/stub-users.ts.
// When the real eFaas OIDC adapter lands, this file becomes redundant.

import type { StubUser } from "@/db/queries/stub-users";

export const STUB_USERS: StubUser[] = [
  {
    // Stable id retained from v2.x seed; the display-name was changed in
    // v3.6 to avoid colliding with a recognisable real public figure
    // ("Mohamed Naseem"). The id stays so existing signatures/claim_votes
    // FK-cascading from prod don't orphan on re-seed.
    id: "u-naseem",
    name_dv: "މުޙައްމަދު އައިމަން",
    name_en: "Mohamed Aiman",
    nid: "A012345",
    island_slug: "maafaru",
    verified_at: "2026-01-15",
  },
  {
    id: "u-hashim",
    name_dv: "ޢާއިޝަތު ހާޝިމް",
    name_en: "Aishath Hashim",
    nid: "A023456",
    island_slug: "hulhumale",
    verified_at: "2025-11-22",
  },
  {
    id: "u-faruhad",
    name_dv: "އަޙްމަދު ފަރުހާދު",
    name_en: "Ahmed Faruhad",
    nid: "A034567",
    island_slug: "male",
    verified_at: "2025-08-30",
  },
  {
    id: "u-reema",
    name_dv: "ފާޠިމަތު ރީމާ",
    name_en: "Fathmath Reema",
    nid: "A045678",
    island_slug: "addu-city",
    verified_at: "2026-02-14",
  },
];
