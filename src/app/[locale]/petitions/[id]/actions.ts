"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { recordSignature, hasSignedPetition } from "@/db/queries/signatures";
import { getPetition } from "@/db/queries/petitions";

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
  await recordSignature(petitionId, user.id);
  revalidatePath(`/petitions/${petitionId}`);
  return { ok: true };
}
