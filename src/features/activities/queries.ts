import "server-only";
import { requireSchool } from "@/lib/auth/session";
export async function getProfiles(schoolSlug:string, assignedOnly=false) {
  const {supabase,user,membership}=await requireSchool(schoolSlug,assignedOnly?["STAFF","ADMIN"]:["STUDENT","STAFF","ADMIN"]);
  let activityIds:string[]|undefined;
  if(assignedOnly) {
    const {data,error}=await supabase.from("activity_staff").select("activity_id").eq("school_id",membership.schoolId).eq("user_id",user.id);
    if(error) throw new Error("Assignments could not be loaded.");
    activityIds=data.map(row=>row.activity_id);
    if(!activityIds.length) return [];
  }
  let query=supabase.from("activity_profiles").select("id,status,short_description,activity_id,activities!inner(official_name,slug,is_active,activity_types(name)),academic_years!inner(label,is_current)")
    .eq("school_id",membership.schoolId).eq("academic_years.is_current",true).order("created_at");
  if(activityIds) query=query.in("activity_id",activityIds);
  else query=query.eq("status","PUBLISHED").eq("activities.is_active",true);
  const {data,error}=await query;
  if(error) throw new Error("Activity information could not be loaded.");
  return data;
}
