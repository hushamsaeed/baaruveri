"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setStubUser, clearStubUser } from "@/lib/auth-stub";

// Same-origin path only. Rejects protocol-relative ("//evil.com"),
// backslash-prefixed ("/\evil.com"), and absolute URLs — Next.js's
// redirect() will otherwise honour any Location string verbatim.
function isSafeReturnPath(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && /^\/(?![\\/])/.test(value);
}

export async function chooseStubUser(formData: FormData): Promise<void> {
  const userId = formData.get("user_id");
  const returnTo = formData.get("return_to");
  if (typeof userId !== "string" || !userId) {
    throw new Error("Missing user_id");
  }
  await setStubUser(userId);
  revalidatePath("/", "layout");
  if (isSafeReturnPath(returnTo)) {
    redirect(returnTo);
  }
  redirect("/");
}

export async function signOutStubUser(formData: FormData): Promise<void> {
  await clearStubUser();
  revalidatePath("/", "layout");
  const returnTo = formData.get("return_to");
  if (isSafeReturnPath(returnTo)) {
    redirect(returnTo);
  }
  redirect("/");
}
