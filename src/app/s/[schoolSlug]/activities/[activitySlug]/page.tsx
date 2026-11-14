import Link from "next/link";
import {notFound} from "next/navigation";
import {getProfiles} from "@/features/activities/queries";
export default async function ActivityPage({params}:{params:Promise<{schoolSlug:string;activitySlug:string}>}) {
  const{schoolSlug,activitySlug}=await params;const item=(await getProfiles(schoolSlug)).find(row=>row.activities.slug===activitySlug);
  if(!item) notFound();
  return <main id="main-content" className="shell section narrow"><Link href={`/s/${schoolSlug}/explore`}>← Explore activities</Link><article className="panel" style={{marginTop:"1.5rem"}}><p className="eyebrow">{item.activities.activity_types?.name??"Activity"} · {item.academic_years.label}</p><h1>{item.activities.official_name}</h1><p className="lede">{item.short_description??"Not provided"}</p></article></main>;
}
