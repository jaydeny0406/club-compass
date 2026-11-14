import {getProfiles} from "@/features/activities/queries";
import {ActivityList} from "@/components/activity/activity-list";
export default async function ExplorePage({params}:{params:Promise<{schoolSlug:string}>}) {
  const {schoolSlug}=await params;const items=await getProfiles(schoolSlug);
  return <main id="main-content" className="shell section"><p className="eyebrow">Discover your community</p><h1>Explore activities</h1><p className="lede">Current, published information from your school.</p><ActivityList items={items} schoolSlug={schoolSlug}/></main>;
}
