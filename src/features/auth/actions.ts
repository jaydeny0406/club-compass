"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";
import { safeNext } from "@/lib/permissions";

export type AuthState = { message: string };

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Check your sign-in details." };
  }
  const client = await createServerSupabaseClient();
  if (!client) {
    return { message: "Sign-in is unavailable until this website is connected to its account service. Contact the site administrator." };
  }
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      message: error.status && error.status >= 500
        ? "The account service is temporarily unavailable. Please try again."
        : "The email or password was not accepted.",
    };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signOut(): Promise<AuthState> {
  const client = await createServerSupabaseClient();
  if (client) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return { message: "Sign-out could not finish. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
