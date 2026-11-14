import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvironment } from "./config";
import type { Database } from "@/types/database";
export async function createServerSupabaseClient() {
  const environment = getSupabaseEnvironment();
  if (!environment) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(environment.url, environment.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot set cookies; proxy refreshes them. */ }
      },
    },
  });
}
