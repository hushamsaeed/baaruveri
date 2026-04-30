"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setStubUser, clearStubUser } from "@/lib/auth-stub";

export async function chooseStubUser(formData: FormData): Promise<void> {
  const userId = formData.get("user_id");
  const returnTo = formData.get("return_to");
  if (typeof userId !== "string" || !userId) {
    throw new Error("Missing user_id");
  }
  await setStubUser(userId);
  revalidatePath("/", "layout");
  if (typeof returnTo === "string" && returnTo.startsWith("/")) {
    redirect(returnTo);
  }
  redirect("/");
}

export async function signOutStubUser(formData: FormData): Promise<void> {
  await clearStubUser();
  revalidatePath("/", "layout");
  const returnTo = formData.get("return_to");
  if (typeof returnTo === "string" && returnTo.startsWith("/")) {
    redirect(returnTo);
  }
  redirect("/");
}
