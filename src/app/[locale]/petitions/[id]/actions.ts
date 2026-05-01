"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { rateLimit } from "@/lib/rate-limit";
import { recordSignature, hasSignedPetition } from "@/db/queries/signatures";
import { getPetition } from "@/db/queries/petitions";

// Per-user cap on petition signatures. The composite PK on
// (petition_id, stub_user_id) already makes signing idempotent, but a
// single picked persona could still walk every petition in a script
// and inflate the cross-petition activity counter on the homepage.
// Five signatures per minute is generous for a real user; bots get
// throttled.
const SIGN_LIMIT_PER_MIN = 5;
const SIGN_WINDOW_MS = 60_000;

export async function signPetitionAction(
  petitionId: string
): Promise<{ ok: true; alreadySigned?: boolean } | { ok: false; reason: string }> {
  const user = await getCurrentStubUser();
  if (!user) return { ok: false, reason: "Not authenticated" };
  const petition = await getPetition(petitionId);
  if (!petition) return { ok: false, reason: "Petition not found" };
  if (await hasSignedPetition(petitionId, user.id)) {
    return { ok: true, alreadySigned: true };
  }
  if (
    !rateLimit(`sign:${user.id}`, SIGN_LIMIT_PER_MIN, SIGN_WINDOW_MS).ok
  ) {
    return {
      ok: false,
      reason: "Too many signatures in a short window. Try again in a minute.",
    };
  }
  await recordSignature(petitionId, user.id);
  revalidatePath(`/petitions/${petitionId}`);
  return { ok: true };
}
