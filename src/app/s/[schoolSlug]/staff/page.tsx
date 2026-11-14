import {getProfiles} from "@/features/activities/queries";
import {ActivityList} from "@/components/activity/activity-list";
export default async function StaffPage({params}:{params:Promise<{schoolSlug:string}>}) {
  const{schoolSlug}=await params;const items=await getProfiles(schoolSlug,true);
  return <main id="main-content" className="shell section"><p className="eyebrow">Staff workspace</p><h1>My activities</h1><p className="lede">Activities your school has assigned you to maintain.</p><ActivityList items={items} schoolSlug={schoolSlug}/></main>;
}
