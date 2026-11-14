import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { landingPath } from "@/lib/permissions";
import type { Membership, Role } from "@/types/domain";

export const getSession = cache(async () => {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { supabase: null, user: null };
  const { data, error } = await supabase.auth.getUser();
  if (error && error.status && error.status >= 500) throw new Error("Authentication service is unavailable.");
  return { supabase, user: error ? null : data.user };
});
export const getMemberships = cache(async (): Promise<Membership[]> => {
  const { supabase, user } = await getSession();
  if (!supabase || !user) return [];
  const { data, error } = await supabase.from("school_memberships")
    .select("id,school_id,role,status,schools!inner(name,slug,timezone,is_active)")
    .eq("user_id",user.id).eq("status","ACTIVE").eq("schools.is_active",true).order("created_at");
  if (error) throw new Error("School memberships could not be loaded.");
  return (data ?? []).map((row) => ({
    id:row.id, schoolId:row.school_id, schoolName:row.schools.name,
    schoolSlug:row.schools.slug, timezone:row.schools.timezone, role:row.role, status:row.status,
  }));
});
export async function requireSchool(schoolSlug: string, allowed: readonly Role[] = ["STUDENT","STAFF","ADMIN"]) {
  const { supabase, user } = await getSession();
  if (!supabase || !user) redirect("/login?next=" + encodeURIComponent("/s/" + schoolSlug));
  const membership = (await getMemberships()).find((m) => m.schoolSlug === schoolSlug);
  if (!membership) notFound();
  if (!allowed.includes(membership.role)) redirect(landingPath(schoolSlug,membership.role));
  return { supabase, user, membership };
}
