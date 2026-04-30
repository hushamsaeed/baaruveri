// v0 in-memory signature store. Resets on server restart — fine for the
// concept prototype. Will move to Postgres + Drizzle when the auth layer
// becomes real. Seed counts in petitions.ts represent prior signatures
// outside this dev session; this store layers on top.

const signatures = new Map<string, Set<string>>();

export function getStubSignatures(petitionId: string): ReadonlySet<string> {
  return signatures.get(petitionId) ?? new Set();
}

export function getStubSignatureCount(petitionId: string): number {
  return signatures.get(petitionId)?.size ?? 0;
}

export function hasSignedPetition(
  petitionId: string,
  userId: string
): boolean {
  return signatures.get(petitionId)?.has(userId) ?? false;
}

export function recordSignature(petitionId: string, userId: string): void {
  let set = signatures.get(petitionId);
  if (!set) {
    set = new Set();
    signatures.set(petitionId, set);
  }
  set.add(userId);
}

export function unrecordSignature(petitionId: string, userId: string): void {
  signatures.get(petitionId)?.delete(userId);
}
