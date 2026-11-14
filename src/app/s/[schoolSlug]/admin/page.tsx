import {requireSchool} from "@/lib/auth/session";
export default async function AdminPage({params}:{params:Promise<{schoolSlug:string}>}) {
  const {supabase,membership}=await requireSchool((await params).schoolSlug,["ADMIN"]);
  const results=await Promise.all([
    supabase.from("activities").select("id",{count:"exact",head:true}).eq("school_id",membership.schoolId),
    supabase.from("school_memberships").select("id",{count:"exact",head:true}).eq("school_id",membership.schoolId).eq("status","ACTIVE"),
    supabase.from("activity_staff").select("activity_id",{count:"exact",head:true}).eq("school_id",membership.schoolId),
  ]);
  if(results.some(result=>result.error)) throw new Error("School overview could not be loaded.");
  return <main id="main-content" className="shell section"><p className="eyebrow">Administrator workspace</p><h1>School overview</h1><p className="lede">A view of the accounts and activities in your school.</p><div className="three-columns">{["Activity records","Active memberships","Staff assignments"].map((label,i)=><article key={label}><h2>{label}</h2><p style={{fontSize:"2.5rem",fontWeight:750}}>{results[i].count??0}</p></article>)}</div></main>;
}
