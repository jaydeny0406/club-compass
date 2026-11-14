export type SupabaseEnvironment = { url: string; publishableKey: string };
export function parseSupabaseEnvironment(url: string | undefined, key: string | undefined): SupabaseEnvironment | null {
  if (!url?.trim() || !key?.trim() || url.includes("your-project") || key.includes("your-publishable")) return null;
  try {
    const parsed = new URL(url.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return { url: parsed.origin, publishableKey: key.trim() };
  } catch { return null; }
}
export function getSupabaseEnvironment() {
  return parseSupabaseEnvironment(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
