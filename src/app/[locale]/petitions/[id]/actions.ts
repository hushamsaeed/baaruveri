"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStubUser } from "@/lib/auth-stub";
import { recordSignature, hasSignedPetition } from "@/lib/signature-store";
import { getPetition } from "@/data/petitions";

export async function signPetitionAction(
  petitionId: string
): Promise<{ ok: true; alreadySigned?: boolean } | { ok: false; reason: string }> {
  const user = await getCurrentStubUser();
  if (!user) return { ok: false, reason: "Not authenticated" };
  const petition = getPetition(petitionId);
  if (!petition) return { ok: false, reason: "Petition not found" };
  if (hasSignedPetition(petitionId, user.id)) {
    return { ok: true, alreadySigned: true };
  }
  recordSignature(petitionId, user.id);
  revalidatePath(`/petitions/${petitionId}`);
  return { ok: true };
}
