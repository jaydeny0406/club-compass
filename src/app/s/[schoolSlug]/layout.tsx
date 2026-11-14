import Link from "next/link";
import type { ReactNode } from "react";
import { requireSchool } from "@/lib/auth/session";
export default async function SchoolLayout({children,params}:{children:ReactNode;params:Promise<{schoolSlug:string}>}) {
  const {schoolSlug}=await params;
  const {membership}=await requireSchool(schoolSlug);
  const root="/s/"+schoolSlug;
  return <><div className="school-bar"><div className="shell"><div className="school-identity"><strong>{membership.schoolName}</strong><span className="badge">{membership.role==="STUDENT"?"Student":membership.role==="STAFF"?"Staff":"Administrator"}</span></div>
  <nav aria-label="School navigation" className="school-nav"><Link href={root+"/explore"}>Explore activities</Link>{membership.role!=="STUDENT"?<Link href={root+"/staff"}>My activities</Link>:null}{membership.role==="ADMIN"?<Link href={root+"/admin"}>School administration</Link>:null}<Link href={root+"/account"}>Account</Link></nav></div></div>{children}</>;
}
