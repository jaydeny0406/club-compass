import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getMemberships } from "@/lib/auth/session";
import { landingPath } from "@/lib/permissions";
export default async function SchoolsPage() {
  if (!(await getSession()).user) redirect("/login");
  const memberships=await getMemberships();
  if(memberships.length===1) redirect(landingPath(memberships[0].schoolSlug,memberships[0].role));
  return <main id="main-content" className="shell section narrow"><p className="eyebrow">Your account</p><h1>{memberships.length?"Choose your school":"Your account needs school access"}</h1>
    {memberships.length?<div className="stack">{memberships.map(m=><Link className="panel" key={m.id} href={landingPath(m.schoolSlug,m.role)}><h2>{m.schoolName}</h2><span className="badge">{m.role}</span></Link>)}</div>:<p>Ask your school administrator to add an active school membership to this account.</p>}
  </main>;
}
