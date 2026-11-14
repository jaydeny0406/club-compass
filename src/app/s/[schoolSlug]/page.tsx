import {redirect} from "next/navigation";
import {requireSchool} from "@/lib/auth/session";
import {landingPath} from "@/lib/permissions";
export default async function SchoolEntry({params}:{params:Promise<{schoolSlug:string}>}) {const{schoolSlug}=await params;const{membership}=await requireSchool(schoolSlug);redirect(landingPath(schoolSlug,membership.role));}
