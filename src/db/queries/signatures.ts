import { and, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { signaturesTable } from "../schema";

export async function getSignatureCount(petitionId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(signaturesTable)
    .where(eq(signaturesTable.petitionId, petitionId));
  return rows[0]?.count ?? 0;
}

// Total session signatures across all petitions — for the homepage live
// counter ribbon. The displayed total on a petition card sums this plus
// the seeded baseline; here we report only the session column so it
// reflects "real activity since the platform shipped".
export async function getTotalSessionSignatures(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(signaturesTable);
  return rows[0]?.count ?? 0;
}

export async function hasSignedPetition(
  petitionId: string,
  stubUserId: string
): Promise<boolean> {
  const rows = await db
    .select({ p: signaturesTable.petitionId })
    .from(signaturesTable)
    .where(
      and(
        eq(signaturesTable.petitionId, petitionId),
        eq(signaturesTable.stubUserId, stubUserId)
      )
    )
    .limit(1);
  return rows.length > 0;
}

/** Insert a signature; no-op if the user has already signed (composite PK). */
export async function recordSignature(
  petitionId: string,
  stubUserId: string
): Promise<void> {
  await db
    .insert(signaturesTable)
    .values({ petitionId, stubUserId })
    .onConflictDoNothing();
}

export async function unrecordSignature(
  petitionId: string,
  stubUserId: string
): Promise<void> {
  await db
    .delete(signaturesTable)
    .where(
      and(
        eq(signaturesTable.petitionId, petitionId),
        eq(signaturesTable.stubUserId, stubUserId)
      )
    );
}
